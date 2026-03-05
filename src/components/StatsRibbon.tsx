import { motion } from 'framer-motion'
import AnimatedNumber from './AnimatedNumber'
import type { ProgressRecord } from '../types/vocab'
import type { MotionLevel } from '../types/ui'

interface StatsRibbonProps {
  progress: ProgressRecord
  reviewedRate: number
  masteryRate: number
  quizAccuracy: number
  quizCorrect: number
  quizWrong: number
  motionLevel: MotionLevel
}

function StatsRibbon({
  progress,
  reviewedRate,
  masteryRate,
  quizAccuracy,
  quizCorrect,
  quizWrong,
  motionLevel,
}: StatsRibbonProps) {
  const animated = motionLevel === 'full'

  const items = [
    { id: 'reviewed', label: '复习率', text: `${reviewedRate}%` },
    { id: 'mastery', label: '掌握率', text: `${masteryRate}%` },
    { id: 'streak', label: '连对', text: String(progress.streak) },
    { id: 'accuracy', label: '测验正确率', text: '' },
    { id: 'correct-all', label: '总答对', text: String(progress.correct) },
    { id: 'wrong-all', label: '总答错', text: String(progress.wrong) },
    { id: 'correct-quiz', label: '测验答对', text: String(quizCorrect) },
    { id: 'wrong-quiz', label: '测验答错', text: String(quizWrong) },
  ]

  return (
    <motion.section
      className="stats-ribbon"
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: 0.12, duration: 0.56 }}
    >
      {items.map((item, idx) => (
        <motion.article
          key={`${item.id}-${idx}`}
          className={item.id === 'streak' ? 'stat-tile streak-tile' : 'stat-tile'}
          initial={animated ? { opacity: 0, y: 12 } : false}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.16 + idx * 0.035, duration: 0.4 }}
        >
          <span>{item.label}</span>
          {item.id === 'streak' && animated ? (
            <motion.strong
              key={`streak-${item.text}`}
              initial={{ scale: 0.6, opacity: 0.5 }}
              animate={{ scale: [1, 1.32, 1], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 15 }}
            >
              {item.text}
            </motion.strong>
          ) : item.id === 'accuracy' ? (
            <strong>
              <AnimatedNumber value={quizAccuracy} suffix="%" motionLevel={motionLevel} />
            </strong>
          ) : (
            <strong>{item.text}</strong>
          )}
        </motion.article>
      ))}
    </motion.section>
  )
}

export default StatsRibbon
