import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"
import { ArrowUpRightIcon } from "@/lib/icons"

export function Projects() {
  const { t, palette } = usePreferences()

  return (
    <section id="projects" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <SectionHeader
            index="04"
            eyebrow={t.nav.projects}
            title={t.headings.projects}
            lead={t.headings.projectsLead}
          />
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {t.projects.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 70}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px]"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${palette[400]} 14%, transparent)`,
                    color: "var(--accent-400)",
                  }}
                >
                  {p.status}
                </span>
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.blurb}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1 font-mono text-xs font-semibold transition hover:gap-1.5"
                    style={{ color: "var(--accent-400)" }}
                  >
                    {p.linkLabel}
                    <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
