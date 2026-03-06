import type { Direction, VocabItem } from '../types/vocab'
import type { QuizQuestion } from '../types/quiz'

export const makeVocabKey = (item: { en: string; cn: string }): string => `${item.en}||${item.cn}`

export const shuffleItems = <T,>(items: T[]): T[] => {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const getPromptAndAnswer = (
  item: { en: string; cn: string },
  direction: Direction,
) => {
  if (direction === 'enToCn') {
    return {
      prompt: item.en,
      answer: item.cn,
      promptLabel: '英文 -> 中文',
      answerLabel: '答案（中文）',
    }
  }

  return {
    prompt: item.cn,
    answer: item.en,
    promptLabel: '中文 -> 英文',
    answerLabel: '答案（英文）',
  }
}

export const createQuizQuestion = (item: VocabItem, direction: Direction): QuizQuestion => {
  return {
    word: item,
    ...getPromptAndAnswer(item, direction),
  }
}

export const normalizeAnswer = (value: string): string => {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
}
