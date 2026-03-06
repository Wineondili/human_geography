import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { QuizFeedback, QuizQuestion } from '../types/quiz'
import type { MotionLevel } from '../types/ui'

export interface QuizStageProps {
  question: QuizQuestion | null
  inputValue: string
  feedbackState: QuizFeedback
  revealedAnswer: string | null
  onInputChange: (value: string) => void
  onSubmit: () => void
  onSwitchDirection: () => void
  motionLevel: MotionLevel
}

function QuizStage({
  question,
  inputValue,
  feedbackState,
  revealedAnswer,
  onInputChange,
  onSubmit,
  onSwitchDirection,
  motionLevel,
}: QuizStageProps) {
  const animated = motionLevel === 'full'
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [feedbackState, question?.prompt])

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
          <span className="stage-tip">输入答案后按回车验证</span>
          <button onClick={onSwitchDirection} type="button" className="text-btn">
            切换方向（R）
          </button>
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
