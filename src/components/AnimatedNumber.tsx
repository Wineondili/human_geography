import { animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { MotionLevel } from '../types/ui'

interface AnimatedNumberProps {
  value: number
  suffix?: string
  motionLevel: MotionLevel
}

function AnimatedNumber({ value, suffix = '', motionLevel }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const currentValueRef = useRef(value)

  useEffect(() => {
    if (motionLevel === 'reduced') {
      currentValueRef.current = value
      setDisplay(value)
      return
    }

    const controls = animate(currentValueRef.current, value, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate: (latest) => {
        const rounded = Math.round(latest)
        currentValueRef.current = rounded
        setDisplay(rounded)
      },
    })

    return () => {
      controls.stop()
    }
  }, [motionLevel, value])

  return (
    <>
      {display}
      {suffix}
    </>
  )
}

export default AnimatedNumber
