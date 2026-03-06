import type { Direction, VocabItem } from '../types/vocab'
import type { QuizQuestion } from '../types/quiz'

export const makeVocabKey = (item: { en: string; cn: string }): string => `${item.en}||${item.cn}`

const STRICT_ENGLISH_PLURAL_ANSWERS = new Set([
  'geographicinformationsystems',
  'globalpositioningsystems',
])

export const stripTrailingLatinAlias = (value: string): string => {
  return value.replace(/\s*[（(]\s*[A-Za-z][A-Za-z0-9\s.'-]*\s*[)）]\s*$/u, '').trim()
}

const singularizeEnglishWord = (word: string): string => {
  if (/ies$/i.test(word) && word.length > 3) {
    return word.replace(/ies$/i, 'y')
  }

  if (/(ches|shes|sses|xes|zes)$/i.test(word)) {
    return word.replace(/es$/i, '')
  }

  if (/s$/i.test(word) && !/ss$/i.test(word)) {
    return word.replace(/s$/i, '')
  }

  return word
}

const singularizeEnglishPhrase = (value: string): string => {
  return value.replace(/[A-Za-z]+/g, (word) => singularizeEnglishWord(word))
}

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
  const cleanCn = stripTrailingLatinAlias(item.cn)

  if (direction === 'enToCn') {
    return {
      prompt: item.en,
      answer: cleanCn,
      promptLabel: '英文 -> 中文',
      answerLabel: '答案（中文）',
    }
  }

  return {
    prompt: cleanCn,
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
  return stripTrailingLatinAlias(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

export const getAcceptedAnswerForms = (value: string): string[] => {
  const stripped = stripTrailingLatinAlias(value)
  const normalized = normalizeAnswer(stripped)

  if (!/[A-Za-z]/.test(stripped) || STRICT_ENGLISH_PLURAL_ANSWERS.has(normalized)) {
    return [normalized]
  }

  const singularNormalized = normalizeAnswer(singularizeEnglishPhrase(stripped))

  if (singularNormalized === normalized) {
    return [normalized]
  }

  return [normalized, singularNormalized]
}
