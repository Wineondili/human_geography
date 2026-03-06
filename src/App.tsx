import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import AnimatedBackdrop from './components/AnimatedBackdrop'
import FlashcardStage from './components/FlashcardStage'
import HeaderHero from './components/HeaderHero'
import QuizStage from './components/QuizStage'
import StatsRibbon from './components/StatsRibbon'
import { createQuizQuestion, makeVocabKey, normalizeAnswer, shuffleItems } from './lib/vocab'
import { getInitialProgress, getMasteryRate, getReviewedRate, recordAttempt, saveProgress } from './lib/storage'
import type { QuizFeedback, QuizQuestion } from './types/quiz'
import { STORAGE_KEY } from './types/vocab'
import type { Direction, ProgressRecord, VocabItem } from './types/vocab'
import type { MotionLevel, UiState } from './types/ui'

function App() {
  const prefersReducedMotion = useReducedMotion()
  const motionLevel: MotionLevel = prefersReducedMotion ? 'reduced' : 'full'

  const [mode, setMode] = useState<UiState['mode'] | null>(null)
  const [deck, setDeck] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [direction, setDirection] = useState<Direction>('enToCn')
  const [progress, setProgress] = useState<ProgressRecord>(() => getInitialProgress())
  const [quizDeck, setQuizDeck] = useState<VocabItem[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizInput, setQuizInput] = useState('')
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback>('idle')
  const [revealedQuizAnswer, setRevealedQuizAnswer] = useState<string | null>(null)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizWrong, setQuizWrong] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const quizAdvanceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (quizAdvanceTimerRef.current !== null) {
        window.clearTimeout(quizAdvanceTimerRef.current)
      }
    }
  }, [])

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
  const currentQuizWord = quizDeck[quizIndex]
  const quizQuestion: QuizQuestion | null = currentQuizWord
    ? createQuizQuestion(currentQuizWord, direction)
    : null
  const totalWords = deck.length

  const masteryRate = getMasteryRate(progress, keys)
  const reviewedRate = getReviewedRate(progress, keys)
  const quizAccuracy = useMemo(() => {
    const total = quizCorrect + quizWrong
    return total ? Math.round((quizCorrect / total) * 100) : 0
  }, [quizCorrect, quizWrong])

  const persistProgress = useCallback((nextProgress: ProgressRecord) => {
    saveProgress(nextProgress)
  }, [])

  const clearQuizLoopState = useCallback(() => {
    setQuizInput('')
    setQuizFeedback('idle')
    setRevealedQuizAnswer(null)
  }, [])

  const startQuizRun = useCallback(() => {
    if (!deck.length) {
      setQuizDeck([])
      setQuizIndex(0)
      clearQuizLoopState()
      return
    }

    setQuizDeck(shuffleItems(deck))
    setQuizIndex(0)
    clearQuizLoopState()
  }, [clearQuizLoopState, deck])

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

  const advanceQuizWord = useCallback(() => {
    if (!quizDeck.length) {
      return
    }

    clearQuizLoopState()
    setQuizIndex((prev) => {
      const atEnd = prev >= quizDeck.length - 1
      if (atEnd) {
        setQuizDeck((currentDeck) => shuffleItems(currentDeck))
        return 0
      }
      return prev + 1
    })
  }, [clearQuizLoopState, quizDeck.length])

  const reveal = useCallback(() => {
    setShowAnswer(true)
  }, [])

  const switchDirection = useCallback(() => {
    setDirection((prev) => (prev === 'enToCn' ? 'cnToEn' : 'enToCn'))
    setShowAnswer(false)
    clearQuizLoopState()
  }, [clearQuizLoopState])

  const enterMode = useCallback(
    (nextMode: UiState['mode']) => {
      if (quizAdvanceTimerRef.current !== null) {
        window.clearTimeout(quizAdvanceTimerRef.current)
        quizAdvanceTimerRef.current = null
      }

      setMode(nextMode)
      if (nextMode === 'quiz') {
        startQuizRun()
        return
      }

      setShowAnswer(false)
    },
    [startQuizRun],
  )

  const returnToHome = useCallback(() => {
    if (quizAdvanceTimerRef.current !== null) {
      window.clearTimeout(quizAdvanceTimerRef.current)
      quizAdvanceTimerRef.current = null
    }

    setMode(null)
    setShowAnswer(false)
    clearQuizLoopState()
  }, [clearQuizLoopState])

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

  const handleQuizInputChange = useCallback(
    (value: string) => {
      setQuizInput(value)
      if (revealedQuizAnswer) {
        setRevealedQuizAnswer(null)
      }
      if (quizFeedback === 'wrong') {
        setQuizFeedback('idle')
      }
    },
    [quizFeedback, revealedQuizAnswer],
  )

  const handleQuizSubmit = useCallback(() => {
    if (!quizQuestion) {
      return
    }

    const submittedAnswer = normalizeAnswer(quizInput)
    if (!submittedAnswer) {
      return
    }

    const correctAnswer = normalizeAnswer(quizQuestion.answer)
    const isCorrect = submittedAnswer === correctAnswer
    const key = makeVocabKey(quizQuestion.word)

    setProgress((previous) => {
      const next = recordAttempt(previous, key, isCorrect)
      persistProgress(next)
      return next
    })

    if (isCorrect) {
      setQuizCorrect((count) => count + 1)
      setQuizFeedback('correct')
      setQuizInput('')
      setRevealedQuizAnswer(null)

      if (quizAdvanceTimerRef.current !== null) {
        window.clearTimeout(quizAdvanceTimerRef.current)
      }

      quizAdvanceTimerRef.current = window.setTimeout(() => {
        advanceQuizWord()
        quizAdvanceTimerRef.current = null
      }, 420)
      return
    }

    setQuizWrong((count) => count + 1)
    setQuizFeedback('wrong')
    setRevealedQuizAnswer(quizQuestion.answer)
    setQuizInput('')
  }, [advanceQuizWord, persistProgress, quizInput, quizQuestion])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') {
        return
      }

      if (!mode) {
        return
      }

      if (event.key === 'r' || event.key === 'R') {
        switchDirection()
        return
      }

      if (mode !== 'flashcard') {
        return
      }

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
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handleRemember, mode, moveNext, movePrev, reveal, showAnswer, switchDirection])

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

        {mode === null ? (
          <section className="entry-panel">
            <p className="entry-kicker">初始化入口</p>
            <h2 className="entry-title">选择进入学习模式或测试模式</h2>
            <p className="entry-copy">
              学习模式适合翻卡记忆，测试模式会打乱整套词表并要求你键入答案，直到答对才会进入下一题。
            </p>

            <div className="entry-grid">
              <button onClick={() => enterMode('flashcard')} type="button" className="entry-card">
                <span>Study</span>
                <strong>进入学习模式</strong>
                <p>按节奏翻卡、展示答案、继续推进。</p>
              </button>

              <button onClick={() => enterMode('quiz')} type="button" className="entry-card">
                <span>Test</span>
                <strong>进入测试模式</strong>
                <p>整轮 shuffle，输入答案，回车验证，直到答对。</p>
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="session-bar">
              <span className="session-badge">
                {mode === 'flashcard' ? '当前：学习模式' : '当前：测试模式'}
              </span>
              <button onClick={returnToHome} type="button" className="text-btn">
                返回入口
              </button>
            </section>

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
                inputValue={quizInput}
                feedbackState={quizFeedback}
                revealedAnswer={revealedQuizAnswer}
                onInputChange={handleQuizInputChange}
                onSubmit={handleQuizSubmit}
                onSwitchDirection={switchDirection}
                motionLevel={motionLevel}
              />
            )}
          </>
        )}

        <p className="app-hint">当前进度（localStorage key: {STORAGE_KEY}）</p>
      </div>
    </main>
  )
}

export default App
