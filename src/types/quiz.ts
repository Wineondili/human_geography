import type { VocabItem } from './vocab'

export interface QuizQuestion {
  word: VocabItem
  prompt: string
  answer: string
  promptLabel: string
  answerLabel: string
}

export type QuizFeedback = 'idle' | 'correct' | 'wrong'
