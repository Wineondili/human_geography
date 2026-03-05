import { motion } from 'framer-motion'
import type { MotionLevel } from '../types/ui'

interface HeaderHeroProps {
  totalWords: number
  motionLevel: MotionLevel
}

function HeaderHero({ totalWords, motionLevel }: HeaderHeroProps) {
  const animated = motionLevel === 'full'

  return (
    <motion.header
      className="hero-panel"
      initial={animated ? { opacity: 0, y: 28 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <p className="hero-kicker">Human Geography · Chapter 1</p>
      <h1>沉浸式词汇舞台</h1>
      <p className="hero-subtitle">简洁配色，重动效驱动记忆节奏</p>
      <div className="hero-meta">
        <span className="hero-chip">词库 {totalWords}</span>
        <span className="hero-chip">Vite + React</span>
        <span className="hero-chip">Motion Layer</span>
      </div>
    </motion.header>
  )
}

export default HeaderHero
