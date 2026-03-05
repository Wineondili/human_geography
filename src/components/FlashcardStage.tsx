import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [feedbackFx, setFeedbackFx] = useState<'idle' | 'known' | 'unknown'>('idle')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!animated) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const relativeX = (event.clientX - rect.left) / rect.width
    const relativeY = (event.clientY - rect.top) / rect.height

    const nextTiltY = (relativeX - 0.5) * 10
    const nextTiltX = (0.5 - relativeY) * 8
    setTilt({ x: nextTiltX, y: nextTiltY })
  }

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const handleRememberClick = (known: boolean) => {
    if (!animated) {
      onRemember(known)
      return
    }

    setFeedbackFx(known ? 'known' : 'unknown')
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      onRemember(known)
      setFeedbackFx('idle')
    }, 170)
  }

  return (
    <motion.section
      className={`stage-panel flashcard-stage${feedbackFx === 'known' ? ' fx-known' : ''}${feedbackFx === 'unknown' ? ' fx-unknown' : ''}`}
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

      {animated ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.en}-${current.cn}-${direction}`}
            className="tilt-shell"
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateX: tilt.x, rotateY: tilt.y }}
            exit={{ opacity: 0, x: -50, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
          >
            <div className="flip-wrap">
              <motion.div
                className="flip-inner"
                animate={{ rotateY: showAnswer ? 180 : 0 }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
              >
                <article className="flip-face flip-front">
                  <p className="face-kicker">Prompt</p>
                  <h2 className="stage-word">{base.prompt}</h2>
                </article>
                <article className="flip-face flip-back">
                  <p className="face-kicker">Answer</p>
                  <h2 className="stage-word">{base.answer}</h2>
                </article>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <article className="reduced-card">
          <h2 className="stage-word">{base.prompt}</h2>
          {showAnswer ? <p className="stage-answer">{base.answerLabel}：{base.answer}</p> : null}
        </article>
      )}

      <div className="stage-actions">
        {!showAnswer ? (
          <button onClick={onReveal} type="button" className="cta-btn">
            显示答案（空格）
          </button>
        ) : (
          <>
            <button onClick={() => handleRememberClick(true)} type="button" className="cta-btn success">
              认识（1 / 空格）
            </button>
            <button onClick={() => handleRememberClick(false)} type="button" className="cta-btn danger">
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
