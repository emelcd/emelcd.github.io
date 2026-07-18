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
  fetchContent,
  SOCIAL_LINKS,
  type Accent,
  type Lang,
  type Palette,
} from "@/lib/content"

type PreferencesValue = {
  lang: Lang
  dark: boolean
  accent: Accent
  palette: Palette
  /** True while the runtime CV fetch is in flight. */
  contentLoading: boolean
  /** Localized content bundle for the active language. */
  t: (typeof CONTENT)[Lang]
  /** Résumé PDF for the active language. */
  resumeHref: string
  setLang: (lang: Lang) => void
  setDark: (dark: boolean) => void
  setAccent: (accent: Accent) => void
  toggleLang: () => void
  toggleTheme: () => void
  cycleAccent: () => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("es")
  const [dark, setDark] = useState(true)
  const [accent, setAccent] = useState<Accent>("blue")
  // Start from the content baked in at build time, then refresh from the
  // backend at runtime so data edits appear without rebuilding the site.
  const [content, setContent] = useState(CONTENT)
  const [contentLoading, setContentLoading] = useState(true)

  const palette = ACCENTS[accent]

  useEffect(() => {
    let active = true
    fetchContent()
      .then((fresh) => {
        if (active && fresh) setContent(fresh)
      })
      .finally(() => {
        if (active) setContentLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

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

  const setLangDirect = useCallback((next: Lang) => setLang(next), [])
  const setDarkDirect = useCallback((next: boolean) => setDark(next), [])
  const setAccentDirect = useCallback((next: Accent) => setAccent(next), [])

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
      contentLoading,
      t: content[lang],
      resumeHref: lang === "en" ? SOCIAL_LINKS.resumeEn : SOCIAL_LINKS.resume,
      setLang: setLangDirect,
      setDark: setDarkDirect,
      setAccent: setAccentDirect,
      toggleLang,
      toggleTheme,
      cycleAccent,
    }),
    [
      lang,
      dark,
      accent,
      palette,
      contentLoading,
      content,
      setLangDirect,
      setDarkDirect,
      setAccentDirect,
      toggleLang,
      toggleTheme,
      cycleAccent,
    ],
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
