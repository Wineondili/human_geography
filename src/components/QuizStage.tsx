import { AnimatePresence, motion } from 'framer-motion'
import type { QuizFeedback, QuizQuestionState } from '../types/quiz'
import type { MotionLevel } from '../types/ui'

export interface QuizStageProps {
  question: QuizQuestionState | null
  onAnswer: (option: string, optionIndex: number) => void
  onNext: () => void
  feedbackState: QuizFeedback
  motionLevel: MotionLevel
}

function QuizStage({ question, onAnswer, onNext, feedbackState, motionLevel }: QuizStageProps) {
  const animated = motionLevel === 'full'

  if (!question) {
    return <section className="stage-panel quiz-stage">当前词量不足，无法开始测验。</section>
  }

  const isAnswered = question.answeredIndex !== null

  return (
    <motion.section
      className="stage-panel quiz-stage"
      initial={animated ? { opacity: 0, y: 24 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.58, ease: 'easeOut' }}
    >
      <div className="stage-head">
        <span className="stage-label">{question.promptLabel}</span>
        <span className="stage-tip">按 1-4 回答</span>
      </div>

      <motion.h2
        className="stage-word"
        key={`quiz-${question.prompt}-${question.answer}`}
        initial={animated ? { opacity: 0, y: 12 } : false}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.35 }}
      >
        {question.prompt}
      </motion.h2>

      <div className="quiz-options">
        {question.options.map((item, optionIndex) => {
          const selected = question.answeredIndex === optionIndex
          const isRight = item === question.answer
          const className = !isAnswered
            ? 'quiz-option'
            : isRight
              ? 'quiz-option right'
              : selected
                ? 'quiz-option wrong'
                : 'quiz-option'

          return (
            <motion.button
              key={`${question.answer}-${optionIndex}`}
              onClick={() => onAnswer(item, optionIndex)}
              type="button"
              className={className}
              disabled={isAnswered}
              initial={animated ? { opacity: 0, y: 10 } : false}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.04 * optionIndex, duration: 0.28 }}
            >
              {`${optionIndex + 1}. ${item}`}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {isAnswered ? (
          <motion.div
            className={feedbackState === 'correct' ? 'quiz-feedback ok' : 'quiz-feedback bad'}
            initial={animated ? { opacity: 0, y: 8 } : false}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            exit={animated ? { opacity: 0, y: -8 } : undefined}
            transition={{ duration: 0.25 }}
          >
            <p>
              {feedbackState === 'correct'
                ? '答对了！'
                : `答错了，正确答案是：${question.answer}`}
            </p>
            <button onClick={onNext} type="button" className="cta-btn">
              下一题（空格 / 回车）
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}

export default QuizStage
