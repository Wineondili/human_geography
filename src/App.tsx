import { useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import AnimatedBackdrop from './components/AnimatedBackdrop'
import FlashcardStage from './components/FlashcardStage'
import HeaderHero from './components/HeaderHero'
import ModeTabs from './components/ModeTabs'
import QuizStage from './components/QuizStage'
import StatsRibbon from './components/StatsRibbon'
import { createQuizQuestion, makeVocabKey, shuffleItems } from './lib/vocab'
import { getInitialProgress, getMasteryRate, getReviewedRate, recordAttempt, saveProgress } from './lib/storage'
import type { QuizFeedback, QuizQuestionState } from './types/quiz'
import type { MotionLevel, UiState } from './types/ui'
import { STORAGE_KEY } from './types/vocab'
import type { Direction, ProgressRecord, VocabItem } from './types/vocab'

function App() {
  const prefersReducedMotion = useReducedMotion()
  const motionLevel: MotionLevel = prefersReducedMotion ? 'reduced' : 'full'

  const [mode, setMode] = useState<UiState['mode']>('flashcard')
  const [deck, setDeck] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [direction, setDirection] = useState<Direction>('enToCn')
  const [progress, setProgress] = useState<ProgressRecord>(() => getInitialProgress())
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestionState | null>(null)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizWrong, setQuizWrong] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const uiState = useMemo<UiState>(() => ({ mode, motionLevel }), [mode, motionLevel])

  useEffect(() => {
    let cancelled = false

    const validateItems = (items: unknown): VocabItem[] => {
      if (!Array.isArray(items)) {
        return []
      }

      return items.filter(
        (item): item is VocabItem =>
          !!item &&
          typeof item === 'object' &&
          typeof (item as { en?: unknown }).en === 'string' &&
          typeof (item as { cn?: unknown }).cn === 'string',
      )
    }

    fetch('/data/ch1_vocab_cn_en_humangeo.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`数据文件读取失败: ${res.status}`)
        }
        return res.json()
      })
      .then((json) => {
        if (cancelled) {
          return
        }

        const vocab = validateItems(json)
        if (!vocab.length) {
          setStatus('error')
          setErrorMessage('词表为空或格式不正确。')
          return
        }

        setDeck(shuffleItems(vocab))
        setIndex(0)
        setShowAnswer(false)
        setStatus('ready')
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage((error as Error).message || '读取词表失败')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const keys = useMemo(() => deck.map((item) => makeVocabKey(item)), [deck])
  const current = deck[index]
  const totalWords = deck.length

  const masteryRate = getMasteryRate(progress, keys)
  const reviewedRate = getReviewedRate(progress, keys)
  const quizAccuracy = useMemo(() => {
    const total = quizCorrect + quizWrong
    return total ? Math.round((quizCorrect / total) * 100) : 0
  }, [quizCorrect, quizWrong])

  const persistProgress = useCallback((nextProgress: ProgressRecord) => {
    setProgress(nextProgress)
    saveProgress(nextProgress)
  }, [])

  const moveNext = useCallback(() => {
    if (!deck.length) {
      return
    }

    setShowAnswer(false)
    setIndex((prev) => {
      const atEnd = prev >= deck.length - 1
      if (atEnd) {
        setDeck((currentDeck) => shuffleItems(currentDeck))
        return 0
      }
      return prev + 1
    })
  }, [deck.length])

  const movePrev = useCallback(() => {
    if (!deck.length) {
      return
    }

    setShowAnswer(false)
    setIndex((prev) => (prev === 0 ? deck.length - 1 : prev - 1))
  }, [deck.length])

  const reveal = useCallback(() => {
    setShowAnswer(true)
  }, [])

  const switchDirection = useCallback(() => {
    setDirection((prev) => (prev === 'enToCn' ? 'cnToEn' : 'enToCn'))
    setShowAnswer(false)
  }, [])

  const resetQuiz = useCallback(() => {
    const next = createQuizQuestion(deck, direction)
    if (!next) {
      setQuizQuestion(null)
      return
    }

    setQuizQuestion({ ...next, answeredIndex: null, isCorrect: null })
  }, [deck, direction])

  const handleRemember = useCallback(
    (known: boolean) => {
      if (!current) {
        return
      }

      const key = makeVocabKey(current)
      setProgress((previous) => {
        const next = recordAttempt(previous, key, known)
        persistProgress(next)
        return next
      })
      moveNext()
    },
    [current, moveNext, persistProgress],
  )

  const handleQuizAnswer = useCallback(
    (option: string, optionIndex: number) => {
      if (!quizQuestion || quizQuestion.answeredIndex !== null) {
        return
      }

      const correct = option === quizQuestion.answer
      setQuizQuestion((previous) =>
        previous
          ? {
              ...previous,
              answeredIndex: optionIndex,
              isCorrect: correct,
            }
          : previous,
      )

      setQuizCorrect((count) => (correct ? count + 1 : count))
      setQuizWrong((count) => (correct ? count : count + 1))

      const key = makeVocabKey(quizQuestion.word)
      setProgress((previous) => {
        const next = recordAttempt(previous, key, correct)
        persistProgress(next)
        return next
      })
    },
    [persistProgress, quizQuestion],
  )

  const nextQuizQuestion = useCallback(() => {
    resetQuiz()
  }, [resetQuiz])

  const feedbackState: QuizFeedback = useMemo(() => {
    if (!quizQuestion || quizQuestion.answeredIndex === null) {
      return 'idle'
    }

    return quizQuestion.isCorrect ? 'correct' : 'wrong'
  }, [quizQuestion])

  useEffect(() => {
    if (status === 'ready' && mode === 'quiz') {
      resetQuiz()
    }
  }, [mode, resetQuiz, status])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') {
        return
      }

      if (event.key === 'r' || event.key === 'R') {
        switchDirection()
        return
      }

      if (mode === 'flashcard') {
        if (event.key === ' ') {
          event.preventDefault()
          if (!showAnswer) {
            reveal()
          } else {
            handleRemember(true)
          }
          return
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault()
          moveNext()
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault()
          movePrev()
        } else if (event.key === '1' && showAnswer) {
          handleRemember(true)
        } else if (event.key === '2' && showAnswer) {
          handleRemember(false)
        }

        return
      }

      if (!quizQuestion) {
        return
      }

      if (event.key >= '1' && event.key <= '4' && quizQuestion.answeredIndex === null) {
        const optionIndex = Number(event.key) - 1
        if (quizQuestion.options[optionIndex] !== undefined) {
          handleQuizAnswer(quizQuestion.options[optionIndex], optionIndex)
        }
        return
      }

      if ((event.key === ' ' || event.key === 'Enter') && quizQuestion.answeredIndex !== null) {
        event.preventDefault()
        nextQuizQuestion()
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [
    handleQuizAnswer,
    handleRemember,
    mode,
    moveNext,
    movePrev,
    nextQuizQuestion,
    quizQuestion,
    reveal,
    showAnswer,
    switchDirection,
  ])

  if (status === 'loading') {
    return (
      <main className={`app-shell motion-${motionLevel}`}>
        <AnimatedBackdrop motionLevel={motionLevel} />
        <div className="app-content">
          <section className="empty-state">正在加载词表……</section>
        </div>
      </main>
    )
  }

  if (status === 'error' || !current) {
    return (
      <main className={`app-shell motion-${motionLevel}`}>
        <AnimatedBackdrop motionLevel={motionLevel} />
        <div className="app-content">
          <section className="empty-state">{errorMessage || '当前暂无词条。'}</section>
        </div>
      </main>
    )
  }

  return (
    <main className={`app-shell motion-${motionLevel}`}>
      <AnimatedBackdrop motionLevel={motionLevel} />

      <div className="app-content">
        <HeaderHero totalWords={totalWords} motionLevel={motionLevel} />

        <ModeTabs uiState={uiState} onModeChange={setMode} />

        <StatsRibbon
          progress={progress}
          reviewedRate={reviewedRate}
          masteryRate={masteryRate}
          quizAccuracy={quizAccuracy}
          quizCorrect={quizCorrect}
          quizWrong={quizWrong}
          motionLevel={motionLevel}
        />

        {mode === 'flashcard' ? (
          <FlashcardStage
            current={current}
            direction={direction}
            showAnswer={showAnswer}
            onReveal={reveal}
            onRemember={handleRemember}
            onPrev={movePrev}
            onNext={moveNext}
            onSwitchDirection={switchDirection}
            motionLevel={motionLevel}
          />
        ) : (
          <QuizStage
            question={quizQuestion}
            onAnswer={handleQuizAnswer}
            onNext={nextQuizQuestion}
            feedbackState={feedbackState}
            motionLevel={motionLevel}
          />
        )}

        <p className="app-hint">当前进度（localStorage key: {STORAGE_KEY}）</p>
      </div>
    </main>
  )
}

export default App
