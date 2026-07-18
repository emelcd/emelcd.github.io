import contentData from "./content-data.json"

export type Lang = "es" | "en"

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

type Content = {
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

export const CONTENT = {
  es: contentData.es.portfolio,
  en: contentData.en.portfolio,
} as unknown as Record<Lang, Content>
