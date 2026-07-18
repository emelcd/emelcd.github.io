import contentData from "./content-data.json"

export type Lang = "es" | "en"

export type CvPayload = {
  es: { portfolio: unknown; resume?: unknown }
  en: { portfolio: unknown; resume?: unknown }
}

export const ACCENTS = {
  blue: { 400: "#4299E1", 600: "#2B6CB0", 800: "#2C5282" },
  teal: { 400: "#38B2AC", 600: "#2C7A7B", 800: "#234E52" },
  violet: { 400: "#9F7AEA", 600: "#6B46C1", 800: "#44337A" },
  orange: { 400: "#ED8936", 600: "#C05621", 800: "#7B341E" },
  rose: { 400: "#F472B6", 600: "#DB2777", 800: "#9D174D" },
  green: { 400: "#4ADE80", 600: "#16A34A", 800: "#166534" },
  amber: { 400: "#FBBF24", 600: "#D97706", 800: "#92400E" },
  cyan: { 400: "#22D3EE", 600: "#0891B2", 800: "#155E75" },
} as const

export type Accent = keyof typeof ACCENTS
export type Palette = (typeof ACCENTS)[Accent]

export const ACCENT_ORDER: Accent[] = [
  "blue",
  "teal",
  "violet",
  "orange",
  "rose",
  "green",
  "amber",
  "cyan",
]

/** UI font stacks the visitor can cycle through. */
export const FONTS = {
  geist: {
    label: "Geist",
    family: "'Geist Variable', sans-serif",
  },
  inter: {
    label: "Inter",
    family: "'Inter Variable', sans-serif",
  },
  "space-grotesk": {
    label: "Space Grotesk",
    family: "'Space Grotesk Variable', sans-serif",
  },
  "dm-sans": {
    label: "DM Sans",
    family: "'DM Sans Variable', sans-serif",
  },
  "ibm-plex": {
    label: "IBM Plex",
    family: "'IBM Plex Sans Variable', sans-serif",
  },
  serif: {
    label: "Source Serif",
    family: "'Source Serif 4 Variable', Georgia, serif",
  },
} as const

export type FontId = keyof typeof FONTS
export type FontOption = (typeof FONTS)[FontId]

export const FONT_ORDER: FontId[] = [
  "geist",
  "inter",
  "space-grotesk",
  "dm-sans",
  "ibm-plex",
  "serif",
]

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
  repo?: string
}

export type Content = {
  flag: string
  langLabel: string
  name: string
  surname: string
  role: string
  roles: string[]
  bio: string
  highlights: { value: string; label: string }[]
  stackPreview: string[]
  status: { available: string; location: string; focus: string }
  cta: { primary: string; secondary: string }
  nav: { about: string; work: string; projects: string; activity: string; contact: string }
  headings: {
    about: string
    aboutLead: string
    experience: string
    experienceLead: string
    skills: string
    skillsLead: string
    projects: string
    projectsLead: string
    activity: string
    activityLead: string
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

export type GitHubProfile = {
  login: string
  name: string | null
  publicRepos: number
  privateRepos: number
  totalRepos: number
  followers: number
  following: number
  avatarUrl: string
  htmlUrl: string
  createdAt: string
}

export type GitHubRepo = {
  name: string
  fullName: string
  description: string | null
  private: boolean
  stars: number
  forks: number
  language: string | null
  topics: string[]
  htmlUrl: string
  homepage: string | null
  updatedAt: string
  pushedAt: string
}

export type GitHubEvent = {
  id: string
  type: string
  repo: string
  repoUrl: string
  private: boolean
  createdAt: string
  summary: string
}

export type GitHubData = {
  profile: GitHubProfile
  repos: Record<string, GitHubRepo>
  events: GitHubEvent[]
}

export const SOCIAL_LINKS = {
  github: "https://github.com/emelcd",
  stackoverflow: "https://stackoverflow.com/users/14271633/emel",
  resume: "/resume.pdf",
  resumeEn: "/resume-en.pdf",
  email: "mailto:mick.altura@gmail.com",
  linkedin: "https://linkedin.com/in/emelcd/",
}

/** Baked portfolio bundles used to backfill fields missing from stale API payloads. */
const BAKED: Record<Lang, Content> = {
  es: contentData.es.portfolio as Content,
  en: contentData.en.portfolio as Content,
}

/** Merge a raw portfolio object with baked defaults so new fields never break the UI. */
function normalizePortfolio(raw: unknown, fallback: Content): Content {
  const p = (raw ?? {}) as Partial<Content>
  return {
    ...fallback,
    ...p,
    highlights: p.highlights ?? fallback.highlights ?? [],
    stackPreview: p.stackPreview ?? fallback.stackPreview ?? [],
    status: { ...fallback.status, ...p.status },
    cta: { ...fallback.cta, ...p.cta },
    nav: { ...fallback.nav, ...p.nav },
    headings: { ...fallback.headings, ...p.headings },
    contact: { ...fallback.contact, ...p.contact },
  }
}

/** Map the raw `/api/cv` payload into the per-language content bundle. */
function toContent(data: {
  es: { portfolio: unknown }
  en: { portfolio: unknown }
}): Record<Lang, Content> {
  return {
    es: normalizePortfolio(data.es.portfolio, BAKED.es),
    en: normalizePortfolio(data.en.portfolio, BAKED.en),
  }
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

export async function fetchGitHub(): Promise<GitHubData | null> {
  try {
    const res = await fetch(`${API_URL}/api/github`, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as GitHubData
    if (!data?.profile || !data.repos) throw new Error("Malformed GitHub payload")
    return {
      ...data,
      events: (Array.isArray(data.events) ? data.events : []).map((event) => ({
        ...event,
        private: event.private ?? false,
      })),
      profile: {
        ...data.profile,
        privateRepos: data.profile.privateRepos ?? 0,
        totalRepos: data.profile.totalRepos ?? data.profile.publicRepos ?? 0,
      },
      repos: Object.fromEntries(
        Object.entries(data.repos).map(([key, repo]) => [
          key,
          { ...repo, private: repo.private ?? false },
        ]),
      ),
    }
  } catch (err) {
    console.warn("[content] GitHub fetch failed:", err)
    return null
  }
}

/** Resolve an owner/repo slug from project metadata. */
export function projectRepoSlug(project: Pick<ProjectEntry, "repo" | "link">): string | null {
  if (project.repo?.includes("/")) return project.repo
  if (project.link) {
    const match = project.link.match(/github\.com\/([^/]+\/[^/?#]+)/i)
    if (match) return match[1]
  }
  return null
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
