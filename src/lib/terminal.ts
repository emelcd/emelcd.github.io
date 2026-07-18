import {
  ACCENT_ORDER,
  ACCENTS,
  FONT_ORDER,
  FONTS,
  type Accent,
  type Content,
  type FontId,
  type Lang,
} from "@/lib/content"
import { gameCopy, isGameId, startGameLines, type GameId } from "@/lib/terminal-games"

export type TerminalLineKind = "input" | "output" | "error" | "boot"

export type TerminalLine = {
  kind: TerminalLineKind
  /** Command typed by the user (input lines only). */
  command?: string
  text: string
}

export type TerminalEffect =
  | { type: "setLang"; lang: Lang }
  | { type: "toggleLang" }
  | { type: "setDark"; dark: boolean }
  | { type: "toggleTheme" }
  | { type: "setAccent"; accent: Accent }
  | { type: "cycleAccent" }
  | { type: "setFont"; font: FontId }
  | { type: "cycleFont" }
  | { type: "scrollTo"; sectionId: string }
  | { type: "openResume" }
  | { type: "clear" }
  | { type: "startGame"; game: GameId }
  | { type: "stopGame" }

export type CommandResult = {
  lines: TerminalLine[]
  effects: TerminalEffect[]
}

export type TerminalContext = {
  lang: Lang
  dark: boolean
  accent: Accent
  font: FontId
  t: Content
}

const ACCENT_LIST = ACCENT_ORDER.join(", ")
const FONT_LIST = FONT_ORDER.join(", ")
const SECTIONS: Record<string, string> = {
  top: "top",
  home: "top",
  hero: "top",
  about: "about",
  work: "work",
  experience: "work",
  projects: "projects",
  activity: "activity",
  contact: "contact",
}

const ACCENTS_SET = new Set<string>(Object.keys(ACCENTS))
const FONTS_SET = new Set<string>(Object.keys(FONTS))

const COPY = {
  es: {
    helpTitle: "Comandos disponibles:",
    helpLines: [
      "  help              — esta ayuda",
      "  clear             — limpia la terminal",
      "  whoami            — identidad",
      "  status            — estado actual",
      "  ls | stack        — tecnologías",
      "  lang [es|en]      — idioma (sin args: alternar)",
      "  theme [dark|light]— tema (sin args: alternar)",
      "  accent [color]    — acento (sin args: ciclar)",
      "  font [nombre]     — fuente (sin args: ciclar)",
      "  goto <sección>    — ir a una sección",
      "  cd <sección>      — alias de goto",
      "  open resume | cv  — abrir CV",
      "  games             — minijuegos",
      "  play <juego>      — snake | guess | quiz",
    ],
    sectionsTitle: "Secciones: top, about, work, projects, activity, contact",
    accentsTitle: `Acentos: ${ACCENT_LIST}`,
    fontsTitle: `Fuentes: ${FONT_LIST}`,
    unknown: (cmd: string) =>
      `comando no encontrado: ${cmd}. Prueba 'help'.`,
    langSet: (l: Lang) => `idioma → ${l}`,
    themeSet: (mode: string) => `tema → ${mode}`,
    accentSet: (a: Accent) => `acento → ${a}`,
    fontSet: (f: FontId) => `fuente → ${f} (${FONTS[f].label})`,
    accentInvalid: (a: string) =>
      `acento inválido: ${a}. Opciones: ${ACCENT_LIST}`,
    fontInvalid: (f: string) =>
      `fuente inválida: ${f}. Opciones: ${FONT_LIST}`,
    langInvalid: (l: string) => `idioma inválido: ${l}. Opciones: es, en`,
    themeInvalid: (t: string) => `tema inválido: ${t}. Opciones: dark, light`,
    gotoMissing: "uso: goto <sección>",
    gotoUnknown: (s: string) =>
      `sección desconocida: ${s}. Prueba: top, about, work, projects, activity, contact`,
    gotoOk: (s: string) => `navegando → #${s}`,
    resumeOpen: "abriendo CV…",
    bootWelcome: "terminal interactiva — escribe 'help' para empezar",
    bootHint: "tip: prueba 'goto projects' o 'play snake'",
  },
  en: {
    helpTitle: "Available commands:",
    helpLines: [
      "  help              — this help",
      "  clear             — clear terminal",
      "  whoami            — identity",
      "  status            — current status",
      "  ls | stack        — tech stack",
      "  lang [es|en]      — language (no args: toggle)",
      "  theme [dark|light]— theme (no args: toggle)",
      "  accent [color]    — accent (no args: cycle)",
      "  font [name]       — font (no args: cycle)",
      "  goto <section>    — scroll to section",
      "  cd <section>      — goto alias",
      "  open resume | cv  — open résumé",
      "  games             — mini-games",
      "  play <game>       — snake | guess | quiz",
    ],
    sectionsTitle: "Sections: top, about, work, projects, activity, contact",
    accentsTitle: `Accents: ${ACCENT_LIST}`,
    fontsTitle: `Fonts: ${FONT_LIST}`,
    unknown: (cmd: string) => `command not found: ${cmd}. Try 'help'.`,
    langSet: (l: Lang) => `language → ${l}`,
    themeSet: (mode: string) => `theme → ${mode}`,
    accentSet: (a: Accent) => `accent → ${a}`,
    fontSet: (f: FontId) => `font → ${f} (${FONTS[f].label})`,
    accentInvalid: (a: string) =>
      `invalid accent: ${a}. Options: ${ACCENT_LIST}`,
    fontInvalid: (f: string) =>
      `invalid font: ${f}. Options: ${FONT_LIST}`,
    langInvalid: (l: string) => `invalid language: ${l}. Options: es, en`,
    themeInvalid: (t: string) => `invalid theme: ${t}. Options: dark, light`,
    gotoMissing: "usage: goto <section>",
    gotoUnknown: (s: string) =>
      `unknown section: ${s}. Try: top, about, work, projects, activity, contact`,
    gotoOk: (s: string) => `navigating → #${s}`,
    resumeOpen: "opening résumé…",
    bootWelcome: "interactive terminal — type 'help' to start",
    bootHint: "tip: try 'goto projects' or 'play snake'",
  },
} as const
function output(text: string): TerminalLine {
  return { kind: "output", text }
}

function error(text: string): TerminalLine {
  return { kind: "error", text }
}

function collectStackTags(t: Content): string {
  const tags = new Set<string>()
  for (const group of t.skills) {
    for (const tag of group.tags) tags.add(tag)
  }
  return [...tags].join("  ")
}

export function bootLines(lang: Lang): TerminalLine[] {
  const c = COPY[lang]
  return [
    { kind: "boot", text: c.bootWelcome },
    { kind: "boot", text: c.bootHint },
  ]
}

export function executeCommand(
  raw: string,
  ctx: TerminalContext,
): CommandResult {
  const trimmed = raw.trim()
  if (!trimmed) return { lines: [], effects: [] }

  const inputLine: TerminalLine = { kind: "input", command: trimmed, text: trimmed }
  const [cmd, ...args] = trimmed.split(/\s+/)
  const c = COPY[ctx.lang]

  switch (cmd.toLowerCase()) {
    case "help":
      return {
        lines: [
          inputLine,
          output(c.helpTitle),
          ...c.helpLines.map(output),
          output(c.sectionsTitle),
          output(c.accentsTitle),
          output(c.fontsTitle),
        ],
        effects: [],
      }
    case "clear":
      return { lines: [inputLine], effects: [{ type: "clear" }] }

    case "whoami":
      return {
        lines: [
          inputLine,
          output(`${ctx.t.name.toLowerCase()}_${ctx.t.surname.toLowerCase()}`),
        ],
        effects: [],
      }

    case "status":
      return {
        lines: [
          inputLine,
          output(`● ${ctx.t.status.available.toLowerCase()}`),
          output(ctx.t.status.location),
          output(ctx.t.status.focus),
        ],
        effects: [],
      }

    case "ls":
    case "stack":
      return {
        lines: [inputLine, output(collectStackTags(ctx.t))],
        effects: [],
      }

    case "lang": {
      if (args.length === 0) {
        return {
          lines: [inputLine, output(c.langSet(ctx.lang === "es" ? "en" : "es"))],
          effects: [{ type: "toggleLang" }],
        }
      }
      const next = args[0].toLowerCase()
      if (next !== "es" && next !== "en") {
        return { lines: [inputLine, error(c.langInvalid(args[0]))], effects: [] }
      }
      return {
        lines: [inputLine, output(c.langSet(next))],
        effects: [{ type: "setLang", lang: next }],
      }
    }

    case "theme": {
      if (args.length === 0) {
        const next = ctx.dark ? "light" : "dark"
        return {
          lines: [inputLine, output(c.themeSet(next))],
          effects: [{ type: "toggleTheme" }],
        }
      }
      const next = args[0].toLowerCase()
      if (next !== "dark" && next !== "light") {
        return {
          lines: [inputLine, error(c.themeInvalid(args[0]))],
          effects: [],
        }
      }
      return {
        lines: [inputLine, output(c.themeSet(next))],
        effects: [{ type: "setDark", dark: next === "dark" }],
      }
    }

    case "accent": {
      if (args.length === 0) {
        const idx = ACCENT_ORDER.indexOf(ctx.accent)
        const next = ACCENT_ORDER[(idx + 1) % ACCENT_ORDER.length]
        return {
          lines: [inputLine, output(c.accentSet(next))],
          effects: [{ type: "cycleAccent" }],
        }
      }
      const next = args[0].toLowerCase()
      if (!ACCENTS_SET.has(next)) {
        return {
          lines: [inputLine, error(c.accentInvalid(args[0]))],
          effects: [],
        }
      }
      return {
        lines: [inputLine, output(c.accentSet(next as Accent))],
        effects: [{ type: "setAccent", accent: next as Accent }],
      }
    }

    case "font": {
      if (args.length === 0) {
        const idx = FONT_ORDER.indexOf(ctx.font)
        const next = FONT_ORDER[(idx + 1) % FONT_ORDER.length]
        return {
          lines: [inputLine, output(c.fontSet(next))],
          effects: [{ type: "cycleFont" }],
        }
      }
      const next = args[0].toLowerCase()
      if (!FONTS_SET.has(next)) {
        return {
          lines: [inputLine, error(c.fontInvalid(args[0]))],
          effects: [],
        }
      }
      return {
        lines: [inputLine, output(c.fontSet(next as FontId))],
        effects: [{ type: "setFont", font: next as FontId }],
      }
    }

    case "goto":
    case "cd": {
      if (args.length === 0) {
        return { lines: [inputLine, error(c.gotoMissing)], effects: [] }
      }
      const target = SECTIONS[args[0].toLowerCase()]
      if (!target) {
        return {
          lines: [inputLine, error(c.gotoUnknown(args[0]))],
          effects: [],
        }
      }
      return {
        lines: [inputLine, output(c.gotoOk(target))],
        effects: [{ type: "scrollTo", sectionId: target }],
      }
    }

    case "open": {
      if (args[0]?.toLowerCase() === "resume") {
        return {
          lines: [inputLine, output(c.resumeOpen)],
          effects: [{ type: "openResume" }],
        }
      }
      break
    }

    case "cv":
      return {
        lines: [inputLine, output(c.resumeOpen)],
        effects: [{ type: "openResume" }],
      }

    case "games": {
      const g = gameCopy(ctx.lang)
      return {
        lines: [
          inputLine,
          output(g.listTitle),
          ...g.listLines.map(output),
        ],
        effects: [],
      }
    }

    case "play": {
      if (args.length === 0) {
        const g = gameCopy(ctx.lang)
        return {
          lines: [
            inputLine,
            error(ctx.lang === "es" ? "uso: play <juego>" : "usage: play <game>"),
            output(g.listTitle),
            ...g.listLines.map(output),
          ],
          effects: [],
        }
      }
      const id = args[0].toLowerCase()
      if (!isGameId(id)) {
        return {
          lines: [inputLine, error(gameCopy(ctx.lang).unknownGame(args[0]))],
          effects: [],
        }
      }
      return {
        lines: [inputLine, ...startGameLines(ctx.lang, id).map(output)],
        effects: [{ type: "startGame", game: id }],
      }
    }

    default:
      return {
        lines: [inputLine, error(c.unknown(cmd))],
        effects: [],
      }
  }

  return {
    lines: [inputLine, error(c.unknown(cmd))],
    effects: [],
  }
}
