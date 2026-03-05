import type { ProgressRecord } from '../types/vocab'
import { STORAGE_KEY } from '../types/vocab'

const EMPTY_PROGRESS: ProgressRecord = {
  mastery: {},
  lastReviewedAt: undefined,
  streak: 0,
  correct: 0,
  wrong: 0,
  createdAt: new Date().toISOString(),
}

export const getInitialProgress = (): ProgressRecord => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...EMPTY_PROGRESS }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...EMPTY_PROGRESS }
    }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { ...EMPTY_PROGRESS }
    }

    return {
      mastery: parsed.mastery ?? {},
      lastReviewedAt: parsed.lastReviewedAt,
      streak: Number(parsed.streak ?? 0),
      correct: Number(parsed.correct ?? 0),
      wrong: Number(parsed.wrong ?? 0),
      createdAt: parsed.createdAt ?? EMPTY_PROGRESS.createdAt,
    }
  } catch {
    return { ...EMPTY_PROGRESS }
  }
}

export const saveProgress = (progress: ProgressRecord) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage unavailable or quota exceeded: keep app usable with memory-only state
  }
}

export const recordAttempt = (
  progress: ProgressRecord,
  key: string,
  correct: boolean,
): ProgressRecord => {
  const nextMastery = {
    ...progress.mastery,
    [key]: (progress.mastery?.[key] ?? 0) + (correct ? 1 : -1),
  }

  return {
    ...progress,
    mastery: nextMastery,
    lastReviewedAt: new Date().toISOString(),
    streak: correct ? progress.streak + 1 : 0,
    correct: correct ? progress.correct + 1 : progress.correct,
    wrong: correct ? progress.wrong : progress.wrong + 1,
  }
}

export const getMasteryRate = (
  progress: ProgressRecord,
  keys: string[],
  threshold = 3,
): number => {
  if (keys.length === 0) {
    return 0
  }

  const mastered = keys.filter((key) => (progress.mastery?.[key] ?? 0) >= threshold)
  return Math.round((mastered.length / keys.length) * 100)
}

export const getReviewedRate = (progress: ProgressRecord, keys: string[]) => {
  const reviewed = keys.filter((key) => (progress.mastery?.[key] ?? 0) !== 0)
  if (keys.length === 0) {
    return 0
  }

  return Math.round((reviewed.length / keys.length) * 100)
}
