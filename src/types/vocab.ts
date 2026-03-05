export type Direction = 'enToCn' | 'cnToEn'

export interface VocabItem {
  en: string
  cn: string
}

export interface ProgressRecord {
  mastery: Record<string, number>
  lastReviewedAt?: string
  streak: number
  correct: number
  wrong: number
  createdAt: string
}

export const STORAGE_KEY = 'human-geography:chapter1:v1'
