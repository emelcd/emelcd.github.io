import { usePreferences } from "@/context/preferences"
import { useTypewriter } from "@/hooks/useTypewriter"
import { SOCIALS, isExternal } from "@/lib/socials"
import { ArrowUpRightIcon, MapPinIcon, ResumeIcon } from "@/lib/icons"
import { TerminalCard } from "@/components/TerminalCard"

export function Hero() {
  const { t, palette, resumeHref } = usePreferences()
  const typed = useTypewriter(t.roles)

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="accent-glow pointer-events-none absolute top-[-10%] left-1/2 h-[520px] w-[820px] -translate-x-1/2" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                style={{ backgroundColor: palette[400] }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: palette[400] }}
              />
            </span>
            {t.status.available}
          </span>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {t.name}{" "}
            <span
              className="bg-gradient-to-br bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${palette[400]}, ${palette[800]})`,
              }}
            >
              {t.surname}
            </span>
          </h1>

          <p className="font-mono text-lg text-muted-foreground sm:text-xl">
            <span className="text-foreground">I </span>
            <span style={{ color: "var(--accent-400)" }}>{typed}</span>
            <span className="cursor-blink ml-0.5" />
          </p>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            {t.bio}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${palette[400]}, ${palette[600]})`,
              }}
            >
              {t.cta.primary}
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted"
            >
              <ResumeIcon className="h-4 w-4" />
              {t.cta.secondary}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5" />
              {t.status.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: palette[400] }}
              />
              {t.status.focus}
            </span>
            <span className="flex items-center gap-3">
              {SOCIALS.map(({ href, icon: Icon, label }) => {
                const url = label === "Resume" ? resumeHref : href
                return (
                <a
                  key={label}
                  href={url}
                  target={isExternal(url) ? "_blank" : undefined}
                  rel={isExternal(url) ? "noreferrer" : undefined}
                  aria-label={label}
                  className="transition hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
                )
              })}
            </span>
          </div>
        </div>

        <TerminalCard />
      </div>
    </section>
  )
}
