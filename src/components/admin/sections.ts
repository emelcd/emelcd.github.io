export type AdminMode = "portfolio" | "resume"

export type SectionDef = {
  id: string
  label: string
  paths: string[]
}

export type ModeDef = {
  id: AdminMode
  label: string
  sections: SectionDef[]
}

/** Labels amigables para campos frecuentes del CV. */
export const FIELD_LABELS: Record<string, string> = {
  flag: "Bandera / emoji",
  langLabel: "Etiqueta de idioma",
  name: "Nombre",
  surname: "Apellidos",
  role: "Rol / titular",
  roles: "Roles alternativos",
  bio: "Bio",
  highlights: "Destacados",
  stackPreview: "Preview del stack",
  status: "Estado",
  available: "Disponible",
  location: "Ubicación",
  focus: "Enfoque actual",
  cta: "Llamadas a la acción",
  primary: "CTA principal",
  secondary: "CTA secundaria",
  nav: "Navegación",
  headings: "Títulos de sección",
  services: "Servicios",
  experience: "Experiencia",
  skills: "Skills",
  projects: "Proyectos",
  education: "Educación",
  contact: "Contacto",
  footerNote: "Nota del footer",
  line: "Línea de contacto",
  button: "Texto del botón",
  icon: "Icono",
  title: "Título",
  description: "Descripción",
  company: "Empresa",
  period: "Periodo",
  duration: "Duración",
  stack: "Stack",
  category: "Categoría",
  tags: "Tags",
  blurb: "Descripción breve",
  degree: "Título / grado",
  institution: "Institución",
  year: "Año",
  value: "Valor",
  label: "Etiqueta",
  lang: "Idioma del PDF",
  summary: "Resumen",
  labels: "Etiquetas del PDF",
  methods: "Metodologías",
  certs: "Certificaciones",
  languages: "Idiomas",
  strengths: "Fortalezas",
  interests: "Intereses",
  email: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  profile: "Perfil",
  present: "Presente",
  about: "Sobre mí",
  aboutLead: "Lead sobre mí",
  experienceLead: "Lead experiencia",
  skillsLead: "Lead skills",
  projectsLead: "Lead proyectos",
  activity: "Actividad",
  activityLead: "Lead actividad",
  contactLead: "Lead contacto",
}

export const MODES: ModeDef[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    sections: [
      {
        id: "identity",
        label: "Identidad",
        paths: [
          "name",
          "surname",
          "role",
          "roles",
          "bio",
          "highlights",
          "stackPreview",
          "flag",
          "langLabel",
        ],
      },
      {
        id: "status-cta",
        label: "Estado y CTAs",
        paths: ["status", "cta"],
      },
      {
        id: "nav-headings",
        label: "Navegación y headings",
        paths: ["nav", "headings"],
      },
      {
        id: "services",
        label: "Servicios / About",
        paths: ["services"],
      },
      {
        id: "experience",
        label: "Experiencia",
        paths: ["experience"],
      },
      {
        id: "skills",
        label: "Skills",
        paths: ["skills"],
      },
      {
        id: "projects",
        label: "Proyectos",
        paths: ["projects"],
      },
      {
        id: "education",
        label: "Educación",
        paths: ["education"],
      },
      {
        id: "contact",
        label: "Contacto",
        paths: ["contact", "footerNote"],
      },
    ],
  },
  {
    id: "resume",
    label: "Resume",
    sections: [
      {
        id: "header",
        label: "Cabecera",
        paths: ["name", "surname", "role", "lang", "contact", "summary"],
      },
      {
        id: "labels",
        label: "Labels PDF",
        paths: ["labels"],
      },
      {
        id: "experience",
        label: "Experiencia",
        paths: ["experience"],
      },
      {
        id: "projects",
        label: "Proyectos",
        paths: ["projects"],
      },
      {
        id: "skills-methods",
        label: "Skills / métodos",
        paths: ["skills", "methods"],
      },
      {
        id: "certs-education",
        label: "Certs / educación",
        paths: ["certs", "education"],
      },
      {
        id: "extras",
        label: "Idiomas / extras",
        paths: ["languages", "strengths", "interests"],
      },
    ],
  },
]

export function getMode(id: AdminMode) {
  return MODES.find((mode) => mode.id === id) ?? MODES[0]
}

export function fieldLabel(key: string | number) {
  const str = String(key)
  return FIELD_LABELS[str] ?? labelize(str)
}

function labelize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}
