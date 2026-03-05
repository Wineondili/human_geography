import type { VocabItem } from './vocab'

export interface QuizQuestion {
  word: VocabItem
  prompt: string
  answer: string
  promptLabel: string
  answerLabel: string
  options: string[]
}

export interface QuizQuestionState extends QuizQuestion {
  answeredIndex: number | null
  isCorrect: boolean | null
}

export type QuizFeedback = 'idle' | 'correct' | 'wrong'
