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

const optionContainerVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const optionItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
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

      <AnimatePresence mode="wait">
        <motion.div
          key={`quiz-block-${question.prompt}-${question.answer}`}
          className="quiz-content"
          initial={animated ? { opacity: 0, y: 12 } : false}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          exit={animated ? { opacity: 0, y: -14 } : undefined}
          transition={{ duration: 0.32 }}
        >
          <h2 className="stage-word">{question.prompt}</h2>

          <motion.div
            className="quiz-options"
            variants={animated ? optionContainerVariants : undefined}
            initial={animated ? 'hidden' : false}
            animate={animated ? 'visible' : undefined}
          >
            {question.options.map((item, optionIndex) => {
              const selected = question.answeredIndex === optionIndex
              const isRight = item === question.answer
              const className = !isAnswered
                ? 'quiz-option'
                : isRight
                  ? 'quiz-option right pulse'
                  : selected
                    ? 'quiz-option wrong shake'
                    : 'quiz-option'

              return (
                <motion.button
                  key={`${question.answer}-${optionIndex}`}
                  onClick={() => onAnswer(item, optionIndex)}
                  type="button"
                  className={selected ? `${className} selected` : className}
                  disabled={isAnswered}
                  variants={animated ? optionItemVariants : undefined}
                  whileTap={animated ? { scale: 0.98 } : undefined}
                >
                  {`${optionIndex + 1}. ${item}`}
                </motion.button>
              )
            })}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isAnswered ? (
          <motion.div
            className={feedbackState === 'correct' ? 'quiz-feedback ok' : 'quiz-feedback bad'}
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            exit={animated ? { opacity: 0, y: -8 } : undefined}
            transition={{ duration: 0.28 }}
          >
            <motion.span
              className={feedbackState === 'correct' ? 'feedback-icon ok' : 'feedback-icon bad'}
              initial={animated ? { scale: 0.4, rotate: -25 } : false}
              animate={animated ? { scale: 1, rotate: 0 } : undefined}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            >
              {feedbackState === 'correct' ? '✓' : '✕'}
            </motion.span>
            <p>
              {feedbackState === 'correct'
                ? '答对了！'
                : `答错了，正确答案是：${question.answer}`}
            </p>
            <motion.button
              onClick={onNext}
              type="button"
              className="cta-btn"
              initial={animated ? { opacity: 0, scale: 0.92 } : false}
              animate={animated ? { opacity: 1, scale: 1 } : undefined}
              transition={{ delay: 0.14, duration: 0.25 }}
            >
              下一题（空格 / 回车）
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}

export default QuizStage
