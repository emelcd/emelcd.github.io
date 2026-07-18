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
  FONT_ORDER,
  FONTS,
  fetchContent,
  fetchGitHub,
  SOCIAL_LINKS,
  type Accent,
  type FontId,
  type GitHubData,
  type Lang,
  type Palette,
} from "@/lib/content"

const STORAGE_KEY = "emelcd-prefs"

type StoredPrefs = {
  lang?: Lang
  dark?: boolean
  accent?: Accent
  font?: FontId
}

function readStoredPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as StoredPrefs
    return {
      lang: parsed.lang === "es" || parsed.lang === "en" ? parsed.lang : undefined,
      dark: typeof parsed.dark === "boolean" ? parsed.dark : undefined,
      accent:
        parsed.accent && parsed.accent in ACCENTS
          ? parsed.accent
          : undefined,
      font: parsed.font && parsed.font in FONTS ? parsed.font : undefined,
    }
  } catch {
    return {}
  }
}

type PreferencesValue = {
  lang: Lang
  dark: boolean
  accent: Accent
  font: FontId
  palette: Palette
  /** True while the runtime CV fetch is in flight. */
  contentLoading: boolean
  /** Live GitHub profile and repo metadata from the backend. */
  github: GitHubData | null
  /** Localized content bundle for the active language. */
  t: (typeof CONTENT)[Lang]
  /** Résumé PDF for the active language. */
  resumeHref: string
  setLang: (lang: Lang) => void
  setDark: (dark: boolean) => void
  setAccent: (accent: Accent) => void
  setFont: (font: FontId) => void
  toggleLang: () => void
  toggleTheme: () => void
  cycleAccent: () => void
  cycleFont: () => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const stored = useMemo(() => readStoredPrefs(), [])
  const [lang, setLang] = useState<Lang>(stored.lang ?? "es")
  const [dark, setDark] = useState(stored.dark ?? true)
  const [accent, setAccent] = useState<Accent>(stored.accent ?? "blue")
  const [font, setFont] = useState<FontId>(stored.font ?? "geist")
  // Start from the content baked in at build time, then refresh from the
  // backend at runtime so data edits appear without rebuilding the site.
  const [content, setContent] = useState(CONTENT)
  const [github, setGithub] = useState<GitHubData | null>(null)
  const [contentLoading, setContentLoading] = useState(true)

  const palette = ACCENTS[accent]

  useEffect(() => {
    let active = true
    Promise.all([fetchContent(), fetchGitHub()])
      .then(([fresh, gh]) => {
        if (!active) return
        if (fresh) setContent(fresh)
        if (gh) setGithub(gh)
      })
      .finally(() => {
        if (active) setContentLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Persist visitor theming choices across reloads.
  useEffect(() => {
    const payload: StoredPrefs = { lang, dark, accent, font }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore quota / private-mode failures
    }
  }, [lang, dark, accent, font])

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

  // Swap the UI font stack via --font-ui (Tailwind --font-sans points here)
  useEffect(() => {
    document.documentElement.style.setProperty("--font-ui", FONTS[font].family)
  }, [font])

  const setLangDirect = useCallback((next: Lang) => setLang(next), [])
  const setDarkDirect = useCallback((next: boolean) => setDark(next), [])
  const setAccentDirect = useCallback((next: Accent) => setAccent(next), [])
  const setFontDirect = useCallback((next: FontId) => setFont(next), [])

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
  const cycleFont = useCallback(
    () =>
      setFont(
        (prev) => FONT_ORDER[(FONT_ORDER.indexOf(prev) + 1) % FONT_ORDER.length],
      ),
    [],
  )

  const value = useMemo<PreferencesValue>(
    () => ({
      lang,
      dark,
      accent,
      font,
      palette,
      contentLoading,
      github,
      t: content[lang],
      resumeHref: lang === "en" ? SOCIAL_LINKS.resumeEn : SOCIAL_LINKS.resume,
      setLang: setLangDirect,
      setDark: setDarkDirect,
      setAccent: setAccentDirect,
      setFont: setFontDirect,
      toggleLang,
      toggleTheme,
      cycleAccent,
      cycleFont,
    }),
    [
      lang,
      dark,
      accent,
      font,
      palette,
      contentLoading,
      github,
      content,
      setLangDirect,
      setDarkDirect,
      setAccentDirect,
      setFontDirect,
      toggleLang,
      toggleTheme,
      cycleAccent,
      cycleFont,
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
