import { useMemo, useState, useEffect } from 'react'

const fallbackWords = [
  { en: 'Geography', cn: '地理学' },
  { en: 'Human Geography', cn: '人文地理学' },
]

function App() {
  const [words, setWords] = useState(fallbackWords)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    fetch('/data/ch1_vocab_cn_en_humangeo.json')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json) && json.length) {
          setWords(json)
        }
      })
      .catch(() => {})
  }, [])

  const current = words[index % words.length]

  const next = () => setIndex((i) => (i + 1) % words.length)

  const show = useMemo(() => {
    return `${current.en} - ${current.cn}`
  }, [current])

  return (
    <main>
      <h1>人文地理 Chapter 1 词汇</h1>
      <p>已加载词数: {words.length}</p>
      <p>{show}</p>
      <button onClick={next}>下一个</button>
    </main>
  )
}

export default App
