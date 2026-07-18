import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  ACCENT_ORDER,
  ACCENTS,
  CONTENT,
  SOCIAL_LINKS,
  type Accent,
  type Lang,
} from "@/lib/content"
import {
  EnvelopeIcon,
  GithubIcon,
  LinkedinIcon,
  ResumeIcon,
  StackOverflowIcon,
} from "@/lib/icons"

const SOCIALS = [
  { href: SOCIAL_LINKS.github, icon: GithubIcon, label: "GitHub" },
  {
    href: SOCIAL_LINKS.stackoverflow,
    icon: StackOverflowIcon,
    label: "Stack Overflow",
  },
  { href: SOCIAL_LINKS.resume, icon: ResumeIcon, label: "Resume" },
  { href: SOCIAL_LINKS.email, icon: EnvelopeIcon, label: "Email" },
  { href: SOCIAL_LINKS.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
]

function Section({
  title,
  accent600,
  children,
}: {
  title: string
  accent600: string
  children: React.ReactNode
}) {
  return (
    <Card className="App-Box gap-4 rounded-2xl border-none bg-card p-6">
      <p className="text-lg font-bold" style={{ color: accent600 }}>
        {title}
      </p>
      <hr className="w-28 border-t border-dashed border-border" />
      <ul className="flex flex-col gap-4">{children}</ul>
    </Card>
  )
}

function App() {
  const [lang, setLang] = useState<Lang>("es")
  const [dark, setDark] = useState(true)
  const [accent, setAccent] = useState<Accent>("blue")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const t = CONTENT[lang]
  const palette = ACCENTS[accent]

  const cycleAccent = () => {
    const next =
      ACCENT_ORDER[(ACCENT_ORDER.indexOf(accent) + 1) % ACCENT_ORDER.length]
    setAccent(next)
  }

  return (
    <div className="min-h-svh bg-background p-4 text-foreground">
      <div className="mx-auto grid max-w-5xl grid-cols-1 place-items-center gap-8 p-4 md:grid-cols-2 md:place-items-stretch">
        <Card className="App-Card flex flex-col items-center gap-0 overflow-hidden rounded-t-[50px] rounded-b-2xl border-none bg-card p-0 shadow-[inset_0_-4px_1px_rgba(0,0,0,0.2),inset_0_-4px_10px_rgba(0,0,0,0.1)]">
          <img
            src="/avatar.png"
            alt="Miguel L."
            className="App-logo h-[170px] w-[170px] object-cover"
          />
          <div className="grid w-full grid-cols-3 items-center">
            <button
              type="button"
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="p-3 text-xl transition hover:bg-muted"
              aria-label="Toggle language"
            >
              {t.flag}
            </button>
            <button
              type="button"
              onClick={() => setDark(!dark)}
              className="p-3 text-xl transition hover:bg-muted"
              aria-label="Toggle theme"
            >
              {dark ? "🌙" : "☀️"}
            </button>
            <button
              type="button"
              onClick={cycleAccent}
              className="flex items-center justify-center p-3 transition hover:bg-muted"
              aria-label="Cycle accent color"
            >
              <span
                className="block h-5 w-5 rounded-full"
                style={{ backgroundColor: palette[400] }}
              />
            </button>
          </div>
        </Card>

        <div className="flex flex-col items-center gap-4 text-center md:items-end">
          <p className="text-5xl font-bold">
            {t.name} <span style={{ color: palette[600] }}>{t.surname}</span>
          </p>
          <hr className="w-full border-t border-border" />
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {t.bio}
          </p>
          <div className="flex gap-4">
            {SOCIALS.map(({ href, icon: IconCmp, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={label}
                className="text-foreground transition hover:opacity-70"
              >
                <IconCmp className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-4 md:grid-cols-3">
        <Section title="Experience" accent600={palette[600]}>
          {t.experience.map((entry) => (
            <li key={entry.title} className="flex flex-col gap-1 font-mono text-sm">
              <p>
                <span style={{ color: palette[600] }}>&gt; {entry.title}</span>
                <br />
                <i className="text-muted-foreground">{entry.company}</i>
              </p>
              <p className="font-semibold">{entry.description}</p>
              <p className="text-right font-semibold">
                <i className="text-muted-foreground">{entry.location}</i>{" "}
                {entry.duration}
              </p>
            </li>
          ))}
        </Section>

        <Section title="Skills" accent600={palette[600]}>
          {t.skills.map((entry) => (
            <li key={entry.category} className="flex flex-col gap-1 font-mono text-sm">
              <p>{entry.category}</p>
              <p className="italic" style={{ color: palette[600] }}>
                {entry.description}
              </p>
            </li>
          ))}
        </Section>

        <Section title="Education" accent600={palette[600]}>
          {t.education.map((entry) => (
            <li key={entry.degree} className="flex flex-col gap-1 font-mono text-sm">
              <p>{entry.degree}</p>
              <p className="text-right font-semibold">
                <i className="text-muted-foreground">{entry.institution}</i>{" "}
                {entry.year}
              </p>
            </li>
          ))}
        </Section>
      </div>
    </div>
  )
}

export default App
