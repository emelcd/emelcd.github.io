import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"

export function Skills() {
  const { t, palette } = usePreferences()

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Reveal>
        <SectionHeader
          index="03"
          eyebrow="stack"
          title={t.headings.skills}
          lead={t.headings.skillsLead}
        />
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {t.skills.map((entry, i) => (
          <Reveal
            key={entry.category}
            delay={i * 70}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="font-mono text-sm"
                style={{ color: "var(--accent-400)" }}
              >
                ./
              </span>
              <h3 className="text-lg font-semibold">{entry.category}</h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {entry.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border px-2.5 py-1 font-mono text-xs transition hover:-translate-y-0.5"
                  style={{
                    borderColor: `color-mix(in oklch, ${palette[400]} 30%, transparent)`,
                    color: "var(--accent-400)",
                    backgroundColor: `color-mix(in oklch, ${palette[400]} 8%, transparent)`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
