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

export const createQuizQuestion = (items: VocabItem[], direction: Direction): QuizQuestion | null => {
  if (items.length < 4) {
    return null
  }

  const shuffled = shuffleItems(items)
  const correctWord = shuffled[0]
  const base = getPromptAndAnswer(correctWord, direction)

  const answerPool = items
    .map((item) => (direction === 'enToCn' ? item.cn : item.en))
    .filter((value) => value !== base.answer)

  const uniqueAnswers = Array.from(new Set(answerPool))
  const shuffledDistractors = shuffleItems(uniqueAnswers)
  const options = shuffleItems([base.answer, ...shuffledDistractors.slice(0, 3)])

  return {
    word: correctWord,
    ...base,
    options: options.slice(0, 4),
  }
}
