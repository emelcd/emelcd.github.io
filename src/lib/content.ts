export type Lang = "es" | "en"

export const ACCENTS = {
  blue: { 400: "#4299E1", 600: "#2B6CB0", 800: "#2C5282" },
  orange: { 400: "#ED8936", 600: "#C05621", 800: "#7B341E" },
  teal: { 400: "#38B2AC", 600: "#2C7A7B", 800: "#234E52" },
} as const

export type Accent = keyof typeof ACCENTS

export const ACCENT_ORDER: Accent[] = ["blue", "orange", "teal"]

type ExperienceEntry = {
  title: string
  company: string
  description: string
  location: string
  duration: string
}

type SkillEntry = {
  category: string
  description: string
}

type EducationEntry = {
  degree: string
  institution: string
  year: string
}

type Content = {
  flag: string
  name: string
  surname: string
  bio: string
  experience: ExperienceEntry[]
  skills: SkillEntry[]
  education: EducationEntry[]
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
    name: "Miguel",
    surname: "L.",
    bio: "Desarrollador web full stack con xperiencia en frontend y backend. Manejo de React, FastAPI, Flask, Express y Python. Despliegue y scripting en Linux-Cloud (GCP/AWS).",
    experience: [
      {
        title: "Desarrollador de Software Junior / TSR",
        company: "Webhelp [Proyecto Google]",
        description:
          "Desarrollo de aplicaciones y herramientas internas. Soporte de Google Cloud y Google Workspace. Especialista en Arquitectura Gcloud, Integración de Datos y APIs de Google. Scripting. Análisis de código e informes de errores. Comunicación con el cliente.",
        location: "BCN",
        duration: "27 Mo",
      },
      {
        title: "Desarrollador Web",
        company: "SNIK Comunicaciones",
        description:
          "Responsable del diseño, desarrollo y mantenimiento de una variedad de sitios web y aplicaciones web para nuestros clientes.",
        location: "Remoto",
        duration: "6 Mo",
      },
      {
        title: "Posición de IT",
        company: "Altura Town Hall",
        description:
          "Gestión de usuarios (AD). Gestión de Cloud (AWS). Implementación de herramientas web (Gestión de vacaciones y ticket).",
        location: "Altura",
        duration: "9 Mo",
      },
      {
        title: "Desarrollador Web Freelance",
        company: "Freelance",
        description:
          "Especialista en diseño, desarrollo y despliegue de aplicaciones: Figma / Photoshop React/Vanilla - FastAPI/Express - Mongo/SQL GCP/AWS",
        location: "Remoto",
        duration: "11 Mo",
      },
    ],
    skills: [
      {
        category: "Desarrollo Backend",
        description:
          "Diseño de APIs REST tanto en Python (FastAPI/Flask) como en Node (Express) para interactuar con aplicaciones front o extensiones de navegador. Integración de bases de datos NoSQL y SQL, añadiendo capas de seguridad como JWT u OAuth2.0.",
      },
      {
        category: "Desarrollo Frontend",
        description:
          "Diseño y desarrollo de Frontend con React, Angular y Vanilla JS. Estilos: Tailwind, Chakra/MUI/Bootstrap y SCSS. Routing y Context. Integración de APIs seguras.",
      },
      {
        category: "Linux y Cloud",
        description:
          "Experto en Linux Local/Cloud (GCP), hábil en scripting Bash-ZX-Python. Automatización, Backup, y tareas de mantenimiento y puesta a punto.",
      },
    ],
    education: [
      {
        degree: "Desarrollo de APIs en GCP Apigee",
        institution: "Google",
        year: "2026",
      },
      {
        degree: "Google IT Automation with Python",
        institution: "Google",
        year: "2022",
      },
      {
        degree: "Ciclo Superior en Administración de Sistemas",
        institution: "UNED Buitrago",
        year: "2021",
      },
      {
        degree: "Grado en Psicología",
        institution: "Universidad de Valencia",
        year: "2016",
      },
    ],
  },
  en: {
    flag: "🇬🇧",
    name: "Miguel",
    surname: "L.",
    bio: "Full stack web developer with xperience in both frontend and backend development. Skilled in React, FastAPI, Flask, Express to (SQL/NoSQL). Deploying and scripting in Linux-Cloud (GCP/AWS).",
    experience: [
      {
        title: "Junior Software Developer / TSR",
        company: "Webhelp [Google Project]",
        description:
          "Development/analysis/testing both internal/client applications and tools in variuos languages. Google API integration. GCP, Apigee REST API. Scripting. Code analysis and bug reporting. Client communication.",
        location: "BCN",
        duration: "27 Mo",
      },
      {
        title: "Web Developer",
        company: "SNIK Comunicaciones",
        description:
          "Responsible for designing, developing and maintaining a variety of websites and web applications for our clients.",
        location: "Remote",
        duration: "6 Mo",
      },
      {
        title: "IT Position",
        company: "Altura Town Hall",
        description:
          "User managment (AD). Cloud managment (AWS). Implementation of Web based tools (Vacation managment system, ticket, etc).",
        location: "Altura",
        duration: "9 Mo",
      },
      {
        title: "Freelance Web Developer",
        company: "Freelance",
        description:
          "Design, develop and deploy applications: Figma / Photoshop React/Vanilla - FastAPI/Express - Mongo/SQL GCP/AWS",
        location: "Remote",
        duration: "11 Mo",
      },
    ],
    skills: [
      {
        category: "Backend Development",
        description:
          "Design of REST APIs both Python(FastAPI/Flask) and Node(Express) for interacting with front applications or navigator extensions. Integration of NoSQL and SQL databases and adding security layers as JWT or OAuth2.0.",
      },
      {
        category: "Frontend Development",
        description:
          "Frontend Design and Depoloment with React, Angular and Vanilla JS. Styling: Tailwind, Chakra/MUI/Bootstrap and SCSS. Routing and Context. Integration of secure APIs.",
      },
      {
        category: "Linux and Cloud",
        description:
          "Expert in Linux Local/Cloud (GCP), skilled in Bash-ZX-Python scripting. Automation, Backup, and maintenance tasks.",
      },
    ],
    education: [
      {
        degree: "Developing APIs in GCP Apigee",
        institution: "Google",
        year: "2026",
      },
      {
        degree: "Google IT Automation with Python",
        institution: "Google",
        year: "2022",
      },
      {
        degree: "Higher Technical Certificate in Systems Administration",
        institution: "School Name",
        year: "2021",
      },
      {
        degree: "Bachelor's in Psychology",
        institution: "University of Valencia",
        year: "2016",
      },
    ],
  },
}
