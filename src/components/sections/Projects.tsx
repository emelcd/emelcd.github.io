import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"
import { ArrowUpRightIcon } from "@/lib/icons"

export function Projects() {
  const { t, palette } = usePreferences()

  return (
    <section id="projects" className="section-band border-y">
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
              className="surface group flex min-w-0 flex-col rounded-2xl border border-border/80 p-5 sm:p-6"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <h3 className="min-w-0 text-lg font-semibold break-words">{p.name}</h3>
                <span
                  className="w-fit shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px]"
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
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1 font-mono text-xs font-semibold transition hover:gap-1.5"
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
