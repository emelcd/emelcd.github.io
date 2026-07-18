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
  email: "mailto:mick.altura@gmail.com",
  linkedin: "https://linkedin.com/in/emelcd/",
}

export const CONTENT: Record<Lang, Content> = {
  es: {
    flag: "🇪🇸",
    langLabel: "ES",
    name: "Miguel",
    surname: "López",
    role: "Ingeniero Full Stack · Backend-focused",
    roles: [
      "diseño APIs REST limpias",
      "levanto arquitecturas DDD + CQRS",
      "integro sistemas distribuidos",
      "automatizo Linux y la nube",
    ],
    bio: "Desarrollador full stack centrado en backend. Construyo servicios en Python (FastAPI/Flask) y Node con Clean Architecture, DDD y CQRS, integro sistemas de mensajería y datos, y despliego sobre Linux y nube (GCP/AWS).",
    status: {
      available: "Abierto a proyectos",
      location: "Valencia, ES",
      focus: "Backend & Cloud",
    },
    cta: { primary: "Hablemos", secondary: "Ver CV" },
    nav: {
      about: "Perfil",
      work: "Trayectoria",
      projects: "Proyectos",
      contact: "Contacto",
    },
    headings: {
      about: "Lo que hago",
      aboutLead:
        "De la arquitectura al despliegue: diseño el backend, lo conecto con datos y mensajería, y lo dejo corriendo en producción.",
      experience: "Trayectoria",
      experienceLead:
        "Siete años entre backend, cloud y sistemas — de la administración de infraestructura al desarrollo de plataformas.",
      skills: "Stack técnico",
      skillsLead: "Las herramientas con las que trabajo a diario.",
      projects: "Trabajo seleccionado",
      projectsLead:
        "Una muestra de plataformas y herramientas que he construido y mantengo.",
      education: "Formación",
      contact: "Construyamos algo",
      contactLead:
        "¿Tienes un backend que diseñar, una integración que resolver o una plataforma que escalar? Escríbeme.",
    },
    services: [
      {
        icon: "server",
        title: "Arquitectura backend",
        description:
          "APIs REST con Clean Architecture, DDD y CQRS en Python (FastAPI/Flask) y Node (Express). Seguridad con JWT y OAuth2.0.",
      },
      {
        icon: "layout",
        title: "Frontend moderno",
        description:
          "Interfaces con Vue 3, Nuxt, React y Angular. Estilos con Tailwind, shadcn, Chakra/MUI. Integración de APIs seguras.",
      },
      {
        icon: "database",
        title: "Datos & mensajería",
        description:
          "Persistencia y streaming con Kafka, MongoDB, Redis y Elasticsearch. Modelado de datos SQL y NoSQL.",
      },
      {
        icon: "terminal",
        title: "Linux, cloud & DevOps",
        description:
          "Despliegue con Docker y GitLab CI sobre GCP/AWS. Scripting en Bash, ZX y Python. Automatización y mantenimiento.",
      },
    ],
    experience: [
      {
        title: "Ingeniero de Desarrollo e Investigación",
        company: "ITI — Instituto Tecnológico de Informática",
        description:
          "Desarrollo backend de la plataforma interna iti-moar en Python (FastAPI) con Clean Architecture, DDD y CQRS. Integración de Kafka, MongoDB, Redis y Elasticsearch. Frontends con Vue 3 y Nuxt. Mantenimiento de módulos Odoo a medida (CRM, nóminas, analítica).",
        location: "Valencia",
        duration: "32 meses",
        period: "2023 — actualidad",
        stack: ["FastAPI", "DDD", "CQRS", "Kafka", "Vue 3", "Odoo"],
      },
      {
        title: "Desarrollador de Software Junior / TSR",
        company: "Webhelp · Proyecto Google",
        description:
          "Desarrollo de aplicaciones y herramientas internas. Soporte de Google Cloud y Google Workspace. Especialista en arquitectura GCloud, integración de datos y APIs de Google. Scripting, análisis de código e informes de errores.",
        location: "Barcelona",
        duration: "27 meses",
        period: "2020 — 2023",
        stack: ["GCP", "Apigee", "APIs", "Scripting"],
      },
      {
        title: "Desarrollador Web",
        company: "SNIK Comunicaciones",
        description:
          "Responsable del diseño, desarrollo y mantenimiento de una variedad de sitios y aplicaciones web para clientes.",
        location: "Remoto",
        duration: "6 meses",
        period: "2020",
        stack: ["JavaScript", "PHP", "Web"],
      },
      {
        title: "Posición de IT",
        company: "Ayuntamiento de Altura",
        description:
          "Gestión de usuarios (Active Directory) y de infraestructura cloud (AWS). Implementación de herramientas web internas (gestión de vacaciones y ticketing).",
        location: "Altura",
        duration: "9 meses",
        period: "2019 — 2020",
        stack: ["AWS", "Active Directory", "IT"],
      },
      {
        title: "Desarrollador Web Freelance",
        company: "Autónomo",
        description:
          "Diseño, desarrollo y despliegue de aplicaciones de principio a fin: Figma/Photoshop, React/Vanilla, FastAPI/Express, Mongo/SQL sobre GCP/AWS.",
        location: "Remoto",
        duration: "11 meses",
        period: "2018 — 2019",
        stack: ["React", "FastAPI", "MongoDB", "GCP"],
      },
    ],
    skills: [
      {
        category: "Backend",
        description:
          "APIs REST y arquitecturas limpias (Clean Architecture, DDD, CQRS) en Python y Node. Seguridad con JWT y OAuth2.0.",
        tags: ["Python", "FastAPI", "Flask", "Node", "Express", "OAuth2"],
      },
      {
        category: "Frontend",
        description:
          "Desarrollo con Vue 3, Nuxt, React, Angular y Vanilla JS. Estilos con Tailwind, shadcn y SCSS.",
        tags: ["Vue 3", "Nuxt", "React", "Angular", "Tailwind", "TypeScript"],
      },
      {
        category: "Datos e Infraestructura",
        description:
          "Mensajería y persistencia con Kafka, MongoDB, Redis y Elasticsearch. Despliegue con Docker y GitLab CI.",
        tags: ["Kafka", "MongoDB", "Redis", "Elasticsearch", "Docker", "SQL"],
      },
      {
        category: "Linux & Cloud",
        description:
          "Experto en Linux local y cloud (GCP/AWS). Scripting en Bash, ZX y Python. Automatización y mantenimiento.",
        tags: ["Linux", "GCP", "AWS", "Bash", "GitLab CI", "Apigee"],
      },
    ],
    projects: [
      {
        name: "Plataforma iti-moar",
        blurb:
          "Plataforma interna de investigación construida sobre FastAPI con Clean Architecture, DDD y CQRS. Mensajería con Kafka y persistencia poliglota (Mongo, Redis, Elasticsearch).",
        tags: ["FastAPI", "DDD", "CQRS", "Kafka"],
        status: "En producción",
      },
      {
        name: "Módulos Odoo a medida",
        blurb:
          "Módulos personalizados de CRM, nóminas y analítica para ERP Odoo, integrados con los flujos internos del instituto.",
        tags: ["Odoo", "Python", "PostgreSQL"],
        status: "Mantenimiento",
      },
      {
        name: "Herramientas internas GCloud",
        blurb:
          "Aplicaciones y automatizaciones sobre Google Cloud y Apigee: integración de APIs, scripting y arquitectura de datos para el proyecto Google.",
        tags: ["GCP", "Apigee", "Automatización"],
        status: "Entregado",
      },
      {
        name: "Este portfolio",
        blurb:
          "Sitio personal en React + Vite + TypeScript con Tailwind y shadcn/ui. Bilingüe, con temas y acentos personalizables. Desplegado en GitHub Pages.",
        tags: ["React", "Vite", "TypeScript", "Tailwind"],
        status: "Open source",
        link: "https://github.com/emelcd/emelcd.github.io",
        linkLabel: "Ver código",
      },
    ],
    education: [
      { degree: "Desarrollo de APIs en GCP Apigee", institution: "Google", year: "2026" },
      { degree: "Google IT Automation with Python", institution: "Google", year: "2022" },
      {
        degree: "Ciclo Superior en Administración de Sistemas",
        institution: "UNED · Buitrago",
        year: "2021",
      },
      { degree: "Grado en Psicología", institution: "Universidad de Valencia", year: "2016" },
    ],
    contact: {
      line: "Respondo rápido. Cuéntame qué tienes en mente.",
      button: "Enviar un correo",
    },
    footerNote: "Diseñado y construido con React, Vite y Tailwind.",
  },
  en: {
    flag: "🇬🇧",
    langLabel: "EN",
    name: "Miguel",
    surname: "López",
    role: "Full Stack Engineer · Backend-focused",
    roles: [
      "design clean REST APIs",
      "build DDD + CQRS architectures",
      "wire up distributed systems",
      "automate Linux and the cloud",
    ],
    bio: "Backend-focused full stack developer. I build services in Python (FastAPI/Flask) and Node with Clean Architecture, DDD and CQRS, integrate messaging and data systems, and ship them on Linux and cloud (GCP/AWS).",
    status: {
      available: "Open to work",
      location: "Valencia, ES",
      focus: "Backend & Cloud",
    },
    cta: { primary: "Get in touch", secondary: "View résumé" },
    nav: {
      about: "About",
      work: "Journey",
      projects: "Projects",
      contact: "Contact",
    },
    headings: {
      about: "What I do",
      aboutLead:
        "From architecture to deployment: I design the backend, wire it to data and messaging, and keep it running in production.",
      experience: "Journey",
      experienceLead:
        "Seven years across backend, cloud and systems — from infrastructure administration to platform engineering.",
      skills: "Tech stack",
      skillsLead: "The tools I reach for every day.",
      projects: "Selected work",
      projectsLead:
        "A sample of the platforms and tools I've built and maintain.",
      education: "Education",
      contact: "Let's build something",
      contactLead:
        "Got a backend to design, an integration to solve, or a platform to scale? Drop me a line.",
    },
    services: [
      {
        icon: "server",
        title: "Backend architecture",
        description:
          "REST APIs with Clean Architecture, DDD and CQRS in Python (FastAPI/Flask) and Node (Express). Security with JWT and OAuth2.0.",
      },
      {
        icon: "layout",
        title: "Modern frontend",
        description:
          "Interfaces with Vue 3, Nuxt, React and Angular. Styling with Tailwind, shadcn, Chakra/MUI. Secure API integration.",
      },
      {
        icon: "database",
        title: "Data & messaging",
        description:
          "Persistence and streaming with Kafka, MongoDB, Redis and Elasticsearch. SQL and NoSQL data modeling.",
      },
      {
        icon: "terminal",
        title: "Linux, cloud & DevOps",
        description:
          "Deployment with Docker and GitLab CI on GCP/AWS. Scripting in Bash, ZX and Python. Automation and maintenance.",
      },
    ],
    experience: [
      {
        title: "Research & Development Engineer",
        company: "ITI — Instituto Tecnológico de Informática",
        description:
          "Backend development of the internal iti-moar platform in Python (FastAPI) using Clean Architecture, DDD and CQRS. Integration of Kafka, MongoDB, Redis and Elasticsearch. Frontends with Vue 3 and Nuxt. Maintenance of custom Odoo modules (CRM, payroll, analytics).",
        location: "Valencia",
        duration: "32 mo",
        period: "2023 — present",
        stack: ["FastAPI", "DDD", "CQRS", "Kafka", "Vue 3", "Odoo"],
      },
      {
        title: "Junior Software Developer / TSR",
        company: "Webhelp · Google Project",
        description:
          "Development of internal applications and tools. Google Cloud and Google Workspace support. Specialist in GCloud architecture, data integration and Google APIs. Scripting, code analysis and bug reporting.",
        location: "Barcelona",
        duration: "27 mo",
        period: "2020 — 2023",
        stack: ["GCP", "Apigee", "APIs", "Scripting"],
      },
      {
        title: "Web Developer",
        company: "SNIK Comunicaciones",
        description:
          "Responsible for designing, developing and maintaining a variety of websites and web applications for clients.",
        location: "Remote",
        duration: "6 mo",
        period: "2020",
        stack: ["JavaScript", "PHP", "Web"],
      },
      {
        title: "IT Position",
        company: "Altura Town Hall",
        description:
          "User management (Active Directory) and cloud infrastructure (AWS). Implementation of internal web tools (vacation management and ticketing).",
        location: "Altura",
        duration: "9 mo",
        period: "2019 — 2020",
        stack: ["AWS", "Active Directory", "IT"],
      },
      {
        title: "Freelance Web Developer",
        company: "Self-employed",
        description:
          "End-to-end design, development and deployment of applications: Figma/Photoshop, React/Vanilla, FastAPI/Express, Mongo/SQL on GCP/AWS.",
        location: "Remote",
        duration: "11 mo",
        period: "2018 — 2019",
        stack: ["React", "FastAPI", "MongoDB", "GCP"],
      },
    ],
    skills: [
      {
        category: "Backend",
        description:
          "REST APIs and clean architectures (Clean Architecture, DDD, CQRS) in Python and Node. Security with JWT and OAuth2.0.",
        tags: ["Python", "FastAPI", "Flask", "Node", "Express", "OAuth2"],
      },
      {
        category: "Frontend",
        description:
          "Development with Vue 3, Nuxt, React, Angular and Vanilla JS. Styling with Tailwind, shadcn and SCSS.",
        tags: ["Vue 3", "Nuxt", "React", "Angular", "Tailwind", "TypeScript"],
      },
      {
        category: "Data & Infrastructure",
        description:
          "Messaging and persistence with Kafka, MongoDB, Redis and Elasticsearch. Deployment with Docker and GitLab CI.",
        tags: ["Kafka", "MongoDB", "Redis", "Elasticsearch", "Docker", "SQL"],
      },
      {
        category: "Linux & Cloud",
        description:
          "Expert in local and cloud Linux (GCP/AWS). Scripting in Bash, ZX and Python. Automation and maintenance.",
        tags: ["Linux", "GCP", "AWS", "Bash", "GitLab CI", "Apigee"],
      },
    ],
    projects: [
      {
        name: "iti-moar Platform",
        blurb:
          "Internal research platform built on FastAPI with Clean Architecture, DDD and CQRS. Kafka messaging and polyglot persistence (Mongo, Redis, Elasticsearch).",
        tags: ["FastAPI", "DDD", "CQRS", "Kafka"],
        status: "In production",
      },
      {
        name: "Custom Odoo Modules",
        blurb:
          "Custom CRM, payroll and analytics modules for the Odoo ERP, integrated with the institute's internal workflows.",
        tags: ["Odoo", "Python", "PostgreSQL"],
        status: "Maintained",
      },
      {
        name: "GCloud Internal Tools",
        blurb:
          "Applications and automations on Google Cloud and Apigee: API integration, scripting and data architecture for the Google project.",
        tags: ["GCP", "Apigee", "Automation"],
        status: "Delivered",
      },
      {
        name: "This portfolio",
        blurb:
          "Personal site in React + Vite + TypeScript with Tailwind and shadcn/ui. Bilingual, with customizable themes and accents. Deployed on GitHub Pages.",
        tags: ["React", "Vite", "TypeScript", "Tailwind"],
        status: "Open source",
        link: "https://github.com/emelcd/emelcd.github.io",
        linkLabel: "View source",
      },
    ],
    education: [
      { degree: "Developing APIs in GCP Apigee", institution: "Google", year: "2026" },
      { degree: "Google IT Automation with Python", institution: "Google", year: "2022" },
      {
        degree: "Higher Certificate in Systems Administration",
        institution: "UNED · Buitrago",
        year: "2021",
      },
      { degree: "Bachelor's in Psychology", institution: "University of Valencia", year: "2016" },
    ],
    contact: {
      line: "I reply fast. Tell me what you have in mind.",
      button: "Send an email",
    },
    footerNote: "Designed and built with React, Vite and Tailwind.",
  },
}
