import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"

export function Experience() {
  const { t, palette } = usePreferences()

  return (
    <section id="work" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow={t.nav.work}
            title={t.headings.experience}
            lead={t.headings.experienceLead}
          />
        </Reveal>

        <div className="mt-12 flex flex-col">
          {t.experience.map((entry, i) => (
            <Reveal
              key={entry.title}
              delay={i * 60}
              className="group relative grid gap-4 border-l-2 border-border pb-10 pl-8 last:pb-0 sm:grid-cols-[1fr_auto] sm:gap-6"
            >
              <span
                className="absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-background transition group-hover:scale-125"
                style={{ backgroundColor: palette[400] }}
              />
              <div className="flex flex-col gap-2">
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
                      className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="font-mono text-xs text-muted-foreground sm:text-right">
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
