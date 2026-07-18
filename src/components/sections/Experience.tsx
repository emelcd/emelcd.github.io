import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"

export function Experience() {
  const { t, palette } = usePreferences()

  return (
    <section id="work" className="section-band border-y">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow={t.nav.work}
            title={t.headings.experience}
            lead={t.headings.experienceLead}
          />
        </Reveal>

        <div className="relative mt-12 flex flex-col">
          <div
            className="pointer-events-none absolute top-2 bottom-2 left-[7px] w-px"
            style={{
              background: `linear-gradient(180deg, ${palette[400]}, color-mix(in oklch, ${palette[400]} 35%, transparent) 55%, transparent)`,
            }}
            aria-hidden
          />
          {t.experience.map((entry, i) => (
            <Reveal
              key={entry.title}
              delay={i * 60}
              className="group relative grid gap-4 pb-10 pl-8 last:pb-0 sm:grid-cols-[1fr_auto] sm:gap-6"
            >
              <span
                className="absolute top-1 left-0 h-4 w-4 rounded-full border-4 border-background shadow-[0_0_0_3px_color-mix(in_oklch,var(--accent-400)_25%,transparent)] transition group-hover:scale-125"
                style={{ backgroundColor: palette[400] }}
              />
              <div className="flex flex-col gap-2 rounded-xl border border-transparent p-3 -m-3 transition group-hover:border-border/60 group-hover:bg-card/50 group-hover:shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold">{entry.title}</h3>
                  <p
                    className="font-mono text-sm"
                    style={{ color: "var(--accent-400)" }}
                  >
                    {entry.company}
                  </p>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {entry.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {entry.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-border/80 bg-background/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground shadow-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="font-mono text-xs text-muted-foreground sm:text-right sm:pt-3">
                <p className="font-semibold text-foreground">{entry.period}</p>
                <p>{entry.location}</p>
                <p>{entry.duration}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
