import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"

export function Education() {
  const { t } = usePreferences()

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Reveal>
        <SectionHeader index="06" eyebrow="learning" title={t.headings.education} />
      </Reveal>
      <div className="mt-10 grid gap-3">
        {t.education.map((entry, i) => (
          <Reveal
            key={entry.degree}
            delay={i * 50}
            className="surface flex flex-col gap-2 rounded-xl border border-border/80 px-4 py-4 hover:border-transparent sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
          >
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <span className="shrink-0 font-mono text-sm font-semibold text-muted-foreground">
                {entry.year}
              </span>
              <span className="hidden h-8 w-px shrink-0 bg-border sm:block" />
              <p className="min-w-0 font-medium break-words">{entry.degree}</p>
            </div>
            <span className="pl-10 font-mono text-xs text-muted-foreground sm:shrink-0 sm:pl-0 sm:text-right">
              {entry.institution}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
