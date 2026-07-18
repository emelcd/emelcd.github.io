import contentData from "./content-data.json"

export type Lang = "es" | "en"

export type CvPayload = {
  es: { portfolio: unknown; resume?: unknown }
  en: { portfolio: unknown; resume?: unknown }
}

export const ACCENTS = {
  blue: { 400: "#4299E1", 600: "#2B6CB0", 800: "#2C5282" },
  orange: { 400: "#ED8936", 600: "#C05621", 800: "#7B341E" },
  teal: { 400: "#38B2AC", 600: "#2C7A7B", 800: "#234E52" },
  violet: { 400: "#9F7AEA", 600: "#6B46C1", 800: "#44337A" },
} as const

export type Accent = keyof typeof ACCENTS
export type Palette = (typeof ACCENTS)[Accent]

export const ACCENT_ORDER: Accent[] = ["blue", "teal", "violet", "orange"]

type ExperienceEntry = {
  title: string
  company: string
  description: string
  location: string
  duration: string
  period: string
  stack: string[]
}

type SkillEntry = {
  category: string
  description: string
  tags: string[]
}

type EducationEntry = {
  degree: string
  institution: string
  year: string
}

type ServiceEntry = {
  icon: string
  title: string
  description: string
}

type ProjectEntry = {
  name: string
  blurb: string
  tags: string[]
  status: string
  link?: string
  linkLabel?: string
}

export type Content = {
  flag: string
  langLabel: string
  name: string
  surname: string
  role: string
  roles: string[]
  bio: string
  status: { available: string; location: string; focus: string }
  cta: { primary: string; secondary: string }
  nav: { about: string; work: string; projects: string; contact: string }
  headings: {
    about: string
    aboutLead: string
    experience: string
    experienceLead: string
    skills: string
    skillsLead: string
    projects: string
    projectsLead: string
    education: string
    contact: string
    contactLead: string
  }
  services: ServiceEntry[]
  experience: ExperienceEntry[]
  skills: SkillEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  contact: { line: string; button: string }
  footerNote: string
}

export const SOCIAL_LINKS = {
  github: "https://github.com/emelcd",
  stackoverflow: "https://stackoverflow.com/users/14271633/emel",
  resume: "/resume.pdf",
  resumeEn: "/resume-en.pdf",
  email: "mailto:mick.altura@gmail.com",
  linkedin: "https://linkedin.com/in/emelcd/",
}

/** Map the raw `/api/cv` payload into the per-language content bundle. */
function toContent(data: {
  es: { portfolio: unknown }
  en: { portfolio: unknown }
}): Record<Lang, Content> {
  return {
    es: data.es.portfolio,
    en: data.en.portfolio,
  } as unknown as Record<Lang, Content>
}

/** Content baked into the bundle at build time. Used as the initial render
 *  and as a fallback if the runtime fetch fails. */
export const CONTENT = toContent(contentData)

export const API_URL = import.meta.env.VITE_API_URL || "https://emelcdbackend.vercel.app"

function isValidCvPayload(data: unknown): data is CvPayload {
  const payload = data as CvPayload
  return Boolean(payload?.es?.portfolio && payload?.en?.portfolio)
}

/**
 * Fetch the latest content from the backend at runtime so edits to the
 * backend show up without rebuilding the site. Returns `null` (and keeps the
 * baked fallback) if the request fails or the payload is malformed.
 */
export async function fetchContent(): Promise<Record<Lang, Content> | null> {
  try {
    const data = await fetchCvPayload()
    return toContent(data)
  } catch (err) {
    console.warn("[content] runtime fetch failed, using baked data:", err)
    return null
  }
}

export async function fetchCvPayload(): Promise<CvPayload> {
  const res = await fetch(`${API_URL}/api/cv`, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!isValidCvPayload(data)) {
    throw new Error("Malformed payload: missing es/en portfolio")
  }
  return data
}

export async function saveCvPayload(password: string, data: CvPayload) {
  const res = await fetch(`${API_URL}/api/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, data }),
  })
  const out = (await res.json()) as { error?: string; commit?: string; url?: string }
  if (!res.ok) throw new Error(out.error || `HTTP ${res.status}`)
  return out
}
