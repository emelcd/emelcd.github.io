import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"

export function Education() {
  const { t } = usePreferences()

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Reveal>
        <SectionHeader index="05" eyebrow="learning" title={t.headings.education} />
      </Reveal>
      <div className="mt-10 grid gap-3">
        {t.education.map((entry, i) => (
          <Reveal
            key={entry.degree}
            delay={i * 50}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition hover:border-transparent hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-semibold text-muted-foreground">
                {entry.year}
              </span>
              <span className="hidden h-8 w-px bg-border sm:block" />
              <p className="font-medium">{entry.degree}</p>
            </div>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {entry.institution}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
