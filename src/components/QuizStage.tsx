import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import type { QuizFeedback, QuizQuestion } from '../types/quiz'
import type { MotionLevel } from '../types/ui'
import type { Direction } from '../types/vocab'

export interface QuizStageProps {
  question: QuizQuestion | null
  direction: Direction
  inputValue: string
  feedbackState: QuizFeedback
  revealedAnswer: string | null
  onInputChange: (value: string) => void
  onSubmit: () => void
  onDirectionChange: (direction: Direction) => void
  motionLevel: MotionLevel
}

function QuizStage({
  question,
  direction,
  inputValue,
  feedbackState,
  revealedAnswer,
  onInputChange,
  onSubmit,
  onDirectionChange,
  motionLevel,
}: QuizStageProps) {
  const animated = motionLevel === 'full'
  const inputRef = useRef<HTMLInputElement | null>(null)
  const focusInput = useCallback(() => {
    if (!inputRef.current) {
      return
    }

    inputRef.current.focus()
    const length = inputRef.current.value.length
    inputRef.current.setSelectionRange(length, length)
  }, [])

  useEffect(() => {
    if (feedbackState === 'correct') {
      return
    }

    const rafId = window.requestAnimationFrame(() => {
      focusInput()
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [direction, feedbackState, focusInput, question?.prompt])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      const isEditable =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable === true

      if (isEditable) {
        return
      }

      const isFocusShortcut =
        event.code === 'Slash' && (event.ctrlKey || event.metaKey) && !event.altKey

      if (!isFocusShortcut) {
        return
      }

      event.preventDefault()
      focusInput()
    }

    window.addEventListener('keydown', handleShortcut)
    return () => {
      window.removeEventListener('keydown', handleShortcut)
    }
  }, [focusInput])

  if (!question) {
    return <section className="stage-panel quiz-stage">当前词量不足，无法开始测试。</section>
  }

  const isLocked = feedbackState === 'correct'
  const inputPlaceholder = question.answerLabel === '答案（中文）' ? '输入中文答案，回车验证' : 'Type the English answer and press Enter'

  return (
    <motion.section
      className="stage-panel quiz-stage"
      initial={animated ? { opacity: 0, y: 24 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.58, ease: 'easeOut' }}
    >
      <div className="stage-head">
        <span className="stage-label">{question.promptLabel}</span>
        <div className="stage-head-actions">
          <span className="stage-tip">回车验证，Ctrl+/ 或 Cmd+/ 快速定位输入框</span>
          <div className="direction-toggle" role="group" aria-label="测试方向">
            <button
              onClick={() => onDirectionChange('enToCn')}
              type="button"
              className={direction === 'enToCn' ? 'direction-btn active' : 'direction-btn'}
            >
              英中
            </button>
            <button
              onClick={() => onDirectionChange('cnToEn')}
              type="button"
              className={direction === 'cnToEn' ? 'direction-btn active' : 'direction-btn'}
            >
              中英
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`quiz-${question.word.en}-${question.word.cn}-${question.prompt}`}
          className="quiz-content"
          initial={animated ? { opacity: 0, y: 12 } : false}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          exit={animated ? { opacity: 0, y: -14 } : undefined}
          transition={{ duration: 0.32 }}
        >
          <h2 className="stage-word">{question.prompt}</h2>

          <form
            className="quiz-form"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <label className="quiz-field">
              <span>{question.answerLabel}</span>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                className="quiz-input"
                placeholder={inputPlaceholder}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                autoFocus
                disabled={isLocked}
              />
            </label>
            <button type="submit" className="cta-btn" disabled={isLocked}>
              回车提交
            </button>
          </form>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedbackState === 'correct' ? (
          <motion.div
            className="quiz-feedback ok"
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            exit={animated ? { opacity: 0, y: -8 } : undefined}
            transition={{ duration: 0.22 }}
          >
            <span className="feedback-icon ok">✓</span>
            <p>正确，正在切换到下一题……</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {feedbackState === 'wrong' && revealedAnswer ? (
          <motion.div
            className="quiz-feedback bad"
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            exit={animated ? { opacity: 0, y: -8 } : undefined}
            transition={{ duration: 0.22 }}
          >
            <span className="feedback-icon bad">!</span>
            <p>正确答案：{revealedAnswer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}

export default QuizStage
