import { motion } from 'framer-motion'
import type { MotionLevel } from '../types/ui'

interface AnimatedBackdropProps {
  motionLevel: MotionLevel
}

function AnimatedBackdrop({ motionLevel }: AnimatedBackdropProps) {
  const isReduced = motionLevel === 'reduced'

  return (
    <div className="scene-backdrop" aria-hidden>
      <motion.div
        className="orb orb-1"
        animate={
          isReduced
            ? undefined
            : {
                x: [-40, 56, -22],
                y: [0, -44, 28],
                scale: [1, 1.16, 0.92],
              }
        }
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="orb orb-2"
        animate={
          isReduced
            ? undefined
            : {
                x: [30, -64, 12],
                y: [0, 42, -34],
                scale: [1.08, 0.9, 1.1],
              }
        }
        transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="orb orb-3"
        animate={
          isReduced
            ? undefined
            : {
                x: [0, 18, -25],
                y: [0, -28, 12],
                scale: [1, 1.14, 0.95],
              }
        }
        transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <div className="grid-overlay" />
      <div className="spot-overlay" />
    </div>
  )
}

export default AnimatedBackdrop
