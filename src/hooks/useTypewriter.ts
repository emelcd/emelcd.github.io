import { useEffect, useState } from "react"

/**
 * Cycles through `words`, typing and deleting each one like a terminal prompt.
 * Resets when the word list changes (e.g. on language switch).
 */
export function useTypewriter(
  words: string[],
  { typeMs = 62, deleteMs = 34, holdMs = 1600 } = {},
) {
  const [text, setText] = useState("")
  const [wordIdx, setWordIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx % words.length] ?? ""
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), holdMs)
    } else if (deleting && text === "") {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % words.length)
    } else {
      timeout = setTimeout(
        () =>
          setText((prev) =>
            deleting
              ? current.slice(0, prev.length - 1)
              : current.slice(0, prev.length + 1),
          ),
        deleting ? deleteMs : typeMs,
      )
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, wordIdx, words, typeMs, deleteMs, holdMs])

  useEffect(() => {
    setText("")
    setWordIdx(0)
    setDeleting(false)
  }, [words])

  return text
}
