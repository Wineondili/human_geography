import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Direction, ProgressRecord, VocabItem } from './types/vocab'
import { STORAGE_KEY } from './types/vocab'
import { createQuizQuestion, getPromptAndAnswer, makeVocabKey, shuffleItems } from './lib/vocab'
import { getInitialProgress, getMasteryRate, getReviewedRate, recordAttempt, saveProgress } from './lib/storage'
import type { QuizQuestion as QuizQuestionType } from './lib/vocab'

type AppMode = 'flashcard' | 'quiz'

type QuizState = QuizQuestionType & {
  answeredIndex: number | null
  isCorrect: boolean | null
}

function App() {
  const [mode, setMode] = useState<AppMode>('flashcard')
  const [deck, setDeck] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [direction, setDirection] = useState<Direction>('enToCn')
  const [progress, setProgress] = useState<ProgressRecord>(() => getInitialProgress())
  const [quizQuestion, setQuizQuestion] = useState<QuizState | null>(null)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizWrong, setQuizWrong] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

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
  const totalWords = deck.length
  const current = deck[index]
  const { prompt, answer, promptLabel, answerLabel } =
    current ? getPromptAndAnswer(current, direction) : { prompt: '', answer: '', promptLabel: '', answerLabel: '' }

  const masteryRate = getMasteryRate(progress, keys)
  const reviewedRate = getReviewedRate(progress, keys)

  const persistProgress = useCallback(
    (nextProgress: ProgressRecord) => {
      setProgress(nextProgress)
      saveProgress(nextProgress)
    },
    [],
  )

  const moveNext = useCallback(() => {
    if (!deck.length) {
      return
    }

    setShowAnswer(false)
    setIndex((prevIndex) => {
      const atEnd = prevIndex >= deck.length - 1
      if (atEnd) {
        setDeck((currentDeck) => shuffleItems(currentDeck))
        return 0
      }
      return prevIndex + 1
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

  const handleRemember = useCallback(
    (known: boolean) => {
      if (!current) {
        return
      }

      const key = makeVocabKey(current)
      setProgress((previousProgress) => {
        const next = recordAttempt(previousProgress, key, known)
        persistProgress(next)
        return next
      })
      moveNext()
    },
    [current, moveNext, persistProgress],
  )

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

  useEffect(() => {
    if (status === 'ready' && mode === 'quiz') {
      resetQuiz()
    }
  }, [mode, resetQuiz, status])

  const handleQuizAnswer = useCallback(
    (option: string, optionIndex: number) => {
      if (!quizQuestion || quizQuestion.answeredIndex !== null || !quizQuestion.answer) {
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
      setProgress((previousProgress) => {
        const next = recordAttempt(previousProgress, key, correct)
        persistProgress(next)
        return next
      })
    },
    [persistProgress, quizQuestion],
  )

  const nextQuizQuestion = useCallback(() => {
    resetQuiz()
  }, [resetQuiz])

  const quizAccuracy = useMemo(() => {
    const total = quizCorrect + quizWrong
    return total === 0 ? 0 : Math.round((quizCorrect / total) * 100)
  }, [quizCorrect, quizWrong])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        switchDirection()
        return
      }

      if (mode === 'flashcard') {
        const tag = (event.target as HTMLElement)?.tagName?.toLowerCase()
        if (tag === 'input' || tag === 'textarea') {
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

        return
      }

      if (!quizQuestion) {
        return
      }

      if (event.key >= '1' && event.key <= '4' && quizQuestion.answeredIndex === null) {
        const index = Number(event.key) - 1
        if (quizQuestion.options[index] !== undefined) {
          handleQuizAnswer(quizQuestion.options[index], index)
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
    handleRemember,
    handleQuizAnswer,
    mode,
    moveNext,
    movePrev,
    nextQuizQuestion,
    reveal,
    showAnswer,
    switchDirection,
    quizQuestion,
    status,
  ])

  const renderQuizCard = () => {
    if (!quizQuestion) {
      return <section className="card">当前词量不足，无法开始测验。</section>
    }

    const disabled = quizQuestion.answeredIndex !== null

    return (
      <section className="card" aria-live="polite">
        <div className="labels">
          <span>{quizQuestion.promptLabel}</span>
          <span>测验模式（按数字键 1-4）</span>
        </div>
        <h2>{quizQuestion.prompt}</h2>

        <div className="options">
          {quizQuestion.options.map((item, optionIndex) => {
            const selected = quizQuestion.answeredIndex === optionIndex
            const className =
              quizQuestion.answeredIndex === null
                ? 'option'
                : quizQuestion.isCorrect
                  ? item === quizQuestion.answer
                    ? 'option correct'
                    : selected
                      ? 'option wrong'
                      : 'option'
                  : item === quizQuestion.answer
                    ? 'option correct'
                    : selected
                      ? 'option wrong'
                      : 'option'

            return (
              <button
                key={`${quizQuestion.answer}-${optionIndex}`}
                onClick={() => handleQuizAnswer(item, optionIndex)}
                type="button"
                className={className}
                disabled={disabled}
              >
                {`${optionIndex + 1}. ${item}`}
              </button>
            )
          })}
        </div>

        {quizQuestion.answeredIndex !== null ? (
          <div className="actions">
            {quizQuestion.isCorrect ? (
              <p className="feedback success">答对了！</p>
            ) : (
              <p className="feedback error">答错了，正确答案是：{quizQuestion.answer}</p>
            )}
            <button onClick={nextQuizQuestion} type="button" className="primary">
              下一题（空格/回车）
            </button>
          </div>
        ) : null}
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <main className="app-shell">
        <p>正在加载词表……</p>
      </main>
    )
  }

  if (status === 'error' || !current) {
    return (
      <main className="app-shell">
        <p>{errorMessage || '当前暂无词条。'}</p>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <h1>人文地理 Chapter 1 背诵</h1>
        <p>词汇总数：{totalWords}</p>
      </header>

      <section className="mode-switch" aria-label="学习模式">
        <button
          onClick={() => setMode('flashcard')}
          type="button"
          className={mode === 'flashcard' ? 'primary' : ''}
        >
          卡片学习
        </button>
        <button onClick={() => setMode('quiz')} type="button" className={mode === 'quiz' ? 'primary' : ''}>
          选择题测验
        </button>
      </section>

      <section className="stats">
        <p>
          已学习词数：{Object.keys(progress.mastery).length} · 已复习率：{reviewedRate}%
        </p>
        <p>
          答对：{progress.correct} · 答错：{progress.wrong} · 连续答对：{progress.streak}
        </p>
        <p>掌握率（≥3次记忆标记）：{masteryRate}%</p>
        <p>
          测验成绩：{quizCorrect + quizWrong} 题 · 答对 {quizCorrect} · 答错 {quizWrong} · 正确率：{quizAccuracy}%
        </p>
      </section>

      {mode === 'flashcard' ? (
        <section className="card" aria-live="polite">
          <div className="labels">
            <span>{promptLabel}</span>
            <button onClick={switchDirection} type="button">
              切换方向（R）
            </button>
          </div>
          <h2>{prompt}</h2>
          {showAnswer ? <p className="answer">{answerLabel}：{answer}</p> : null}

          <div className="actions">
            {!showAnswer ? (
              <button onClick={reveal} type="button" className="primary">
                显示答案（空格）
              </button>
            ) : (
              <>
                <button onClick={() => handleRemember(true)} type="button" className="primary">
                  认识（1 / 空格）
                </button>
                <button onClick={() => handleRemember(false)} type="button">
                  未记住（2）
                </button>
              </>
            )}
          </div>
        </section>
      ) : null}

      {mode === 'quiz' ? renderQuizCard() : null}

      {mode === 'flashcard' ? (
        <section className="footer-actions">
          <button onClick={movePrev} type="button" className="ghost">
            上一条（←）
          </button>
          <button onClick={moveNext} type="button" className="ghost">
            下一条（→）
          </button>
        </section>
      ) : null}

      <p className="hint">当前进度（localStorage key: {STORAGE_KEY}）</p>
    </main>
  )
}

export default App
