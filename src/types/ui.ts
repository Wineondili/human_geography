export type MotionLevel = 'full' | 'reduced'

export interface UiState {
  mode: 'flashcard' | 'quiz' | 'overview'
  motionLevel: MotionLevel
}
