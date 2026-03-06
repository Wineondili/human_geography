import { motion } from 'framer-motion'
import { stripTrailingLatinAlias } from '../lib/vocab'
import type { VocabItem } from '../types/vocab'
import type { MotionLevel } from '../types/ui'

export interface OverviewStageProps {
  items: VocabItem[]
  motionLevel: MotionLevel
}

function OverviewStage({ items, motionLevel }: OverviewStageProps) {
  const animated = motionLevel === 'full'

  return (
    <motion.section
      className="stage-panel overview-stage"
      initial={animated ? { opacity: 0, y: 24 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.58, ease: 'easeOut' }}
    >
      <div className="overview-head">
        <span className="stage-label">Chapter 1 单词总览</span>
        <span className="overview-count">{items.length} 个词</span>
      </div>

      <div className="overview-scroll">
        <div className="overview-grid">
          {items.map((item, index) => (
            <article key={`${item.en}-${item.cn}`} className="overview-item">
              <span className="overview-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.en}</h3>
              <p>{stripTrailingLatinAlias(item.cn)}</p>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default OverviewStage
