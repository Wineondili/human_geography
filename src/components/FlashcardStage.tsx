import { AnimatePresence, motion } from 'framer-motion'
import { getPromptAndAnswer } from '../lib/vocab'
import type { Direction, VocabItem } from '../types/vocab'
import type { MotionLevel } from '../types/ui'

export interface FlashcardStageProps {
  current: VocabItem
  direction: Direction
  showAnswer: boolean
  onReveal: () => void
  onRemember: (known: boolean) => void
  onPrev: () => void
  onNext: () => void
  onSwitchDirection: () => void
  motionLevel: MotionLevel
}

function FlashcardStage({
  current,
  direction,
  showAnswer,
  onReveal,
  onRemember,
  onPrev,
  onNext,
  onSwitchDirection,
  motionLevel,
}: FlashcardStageProps) {
  const base = getPromptAndAnswer(current, direction)
  const animated = motionLevel === 'full'

  return (
    <motion.section
      className="stage-panel flashcard-stage"
      initial={animated ? { opacity: 0, y: 24 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.58, ease: 'easeOut' }}
    >
      <div className="stage-head">
        <span className="stage-label">{base.promptLabel}</span>
        <button onClick={onSwitchDirection} type="button" className="text-btn">
          切换方向（R）
        </button>
      </div>

      <motion.h2
        className="stage-word"
        key={`${current.en}-${current.cn}-${direction}`}
        initial={animated ? { opacity: 0, y: 12 } : false}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.35 }}
      >
        {base.prompt}
      </motion.h2>

      <AnimatePresence mode="wait">
        {showAnswer ? (
          <motion.p
            key={`answer-${current.en}-${current.cn}-${direction}`}
            className="stage-answer"
            initial={animated ? { opacity: 0, rotateX: -28 } : false}
            animate={animated ? { opacity: 1, rotateX: 0 } : undefined}
            exit={animated ? { opacity: 0, y: -6 } : undefined}
            transition={{ duration: 0.35 }}
          >
            {base.answerLabel}：{base.answer}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="stage-actions">
        {!showAnswer ? (
          <button onClick={onReveal} type="button" className="cta-btn">
            显示答案（空格）
          </button>
        ) : (
          <>
            <button onClick={() => onRemember(true)} type="button" className="cta-btn success">
              认识（1 / 空格）
            </button>
            <button onClick={() => onRemember(false)} type="button" className="cta-btn danger">
              未记住（2）
            </button>
          </>
        )}
      </div>

      <div className="stage-nav">
        <button onClick={onPrev} type="button" className="ghost-btn">
          上一条（←）
        </button>
        <button onClick={onNext} type="button" className="ghost-btn">
          下一条（→）
        </button>
      </div>
    </motion.section>
  )
}

export default FlashcardStage
