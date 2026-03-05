import { motion } from 'framer-motion'
import type { UiState } from '../types/ui'

interface ModeTabsProps {
  uiState: UiState
  onModeChange: (mode: UiState['mode']) => void
}

function ModeTabs({ uiState, onModeChange }: ModeTabsProps) {
  return (
    <section className="mode-tabs" aria-label="学习模式">
      <button
        onClick={() => onModeChange('flashcard')}
        type="button"
        className={uiState.mode === 'flashcard' ? 'tab-btn active' : 'tab-btn'}
      >
        卡片背诵
      </button>
      <button
        onClick={() => onModeChange('quiz')}
        type="button"
        className={uiState.mode === 'quiz' ? 'tab-btn active' : 'tab-btn'}
      >
        测验模式
      </button>
      {uiState.motionLevel === 'full' ? (
        <motion.div
          className="tab-indicator"
          layout
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          style={{ left: uiState.mode === 'flashcard' ? '0.3rem' : 'calc(50% + 0.1rem)' }}
        />
      ) : null}
    </section>
  )
}

export default ModeTabs
