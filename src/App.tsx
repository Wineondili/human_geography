import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Direction, ProgressRecord, VocabItem } from './types/vocab'
import { STORAGE_KEY } from './types/vocab'
import { getPromptAndAnswer, makeVocabKey, shuffleItems } from './lib/vocab'
import { getInitialProgress, getMasteryRate, getReviewedRate, recordAttempt, saveProgress } from './lib/storage'

function App() {
  const [deck, setDeck] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [direction, setDirection] = useState<Direction>('enToCn')
  const [progress, setProgress] = useState<ProgressRecord>(() => getInitialProgress())
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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
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
      } else if (event.key === 'r' || event.key === 'R') {
        switchDirection()
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
  }, [handleRemember, moveNext, movePrev, reveal, switchDirection, showAnswer])

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

      <section className="stats">
        <p>
          已学习词数：{Object.keys(progress.mastery).length} · 已复习率：{reviewedRate}%
        </p>
        <p>
          答对：{progress.correct} · 答错：{progress.wrong} · 连续答对：{progress.streak}
        </p>
        <p>掌握率（≥3次记忆标记）：{masteryRate}%</p>
      </section>

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

      <section className="footer-actions">
        <button onClick={movePrev} type="button" className="ghost">
          上一条（←）
        </button>
        <button onClick={moveNext} type="button" className="ghost">
          下一条（→）
        </button>
      </section>

      <p className="hint">当前进度（localStorage key: {STORAGE_KEY}）</p>
    </main>
  )
}

export default App
