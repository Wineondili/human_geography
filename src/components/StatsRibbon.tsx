import { motion } from 'framer-motion'
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
    { label: '复习率', value: `${reviewedRate}%` },
    { label: '掌握率', value: `${masteryRate}%` },
    { label: '连对', value: String(progress.streak) },
    { label: '测验正确率', value: `${quizAccuracy}%` },
    { label: '总答对', value: String(progress.correct) },
    { label: '总答错', value: String(progress.wrong) },
    { label: '测验答对', value: String(quizCorrect) },
    { label: '测验答错', value: String(quizWrong) },
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
          key={`${item.label}-${idx}`}
          className="stat-tile"
          initial={animated ? { opacity: 0, y: 12 } : false}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.16 + idx * 0.035, duration: 0.4 }}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </motion.article>
      ))}
    </motion.section>
  )
}

export default StatsRibbon
