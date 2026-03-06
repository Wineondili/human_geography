import { motion } from 'framer-motion'
import type { MotionLevel } from '../types/ui'

interface HeaderHeroProps {
  motionLevel: MotionLevel
}

function HeaderHero({ motionLevel }: HeaderHeroProps) {
  const animated = motionLevel === 'full'

  return (
    <motion.header
      className="hero-panel"
      initial={animated ? { opacity: 0, y: 28 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <p className="hero-kicker">Human Geography · Chapter 1</p>
      <h1>人文地理 Chapter 1 单词练习</h1>
    </motion.header>
  )
}

export default HeaderHero
