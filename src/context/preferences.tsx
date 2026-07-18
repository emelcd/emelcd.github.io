import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  ACCENT_ORDER,
  ACCENTS,
  CONTENT,
  type Accent,
  type Lang,
  type Palette,
} from "@/lib/content"

type PreferencesValue = {
  lang: Lang
  dark: boolean
  accent: Accent
  palette: Palette
  /** Localized content bundle for the active language. */
  t: (typeof CONTENT)[Lang]
  toggleLang: () => void
  toggleTheme: () => void
  cycleAccent: () => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("es")
  const [dark, setDark] = useState(true)
  const [accent, setAccent] = useState<Accent>("blue")

  const palette = ACCENTS[accent]

  // Sync theme class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  // Expose accent as CSS custom properties so plain CSS can consume it
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--accent-400", palette[400])
    root.style.setProperty("--accent-600", palette[600])
    root.style.setProperty("--accent-800", palette[800])
  }, [palette])

  const toggleLang = useCallback(
    () => setLang((prev) => (prev === "es" ? "en" : "es")),
    [],
  )
  const toggleTheme = useCallback(() => setDark((prev) => !prev), [])
  const cycleAccent = useCallback(
    () =>
      setAccent(
        (prev) =>
          ACCENT_ORDER[(ACCENT_ORDER.indexOf(prev) + 1) % ACCENT_ORDER.length],
      ),
    [],
  )

  const value = useMemo<PreferencesValue>(
    () => ({
      lang,
      dark,
      accent,
      palette,
      t: CONTENT[lang],
      toggleLang,
      toggleTheme,
      cycleAccent,
    }),
    [lang, dark, accent, palette, toggleLang, toggleTheme, cycleAccent],
  )

  return <PreferencesContext value={value}>{children}</PreferencesContext>
}

export function usePreferences() {
  const ctx = use(PreferencesContext)
  if (!ctx) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return ctx
}
