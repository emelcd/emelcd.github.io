import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"
import { SERVICE_ICONS } from "@/lib/icons"

export function About() {
  const { t, palette } = usePreferences()

  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Reveal>
        <SectionHeader
          index="01"
          eyebrow={t.nav.about}
          title={t.headings.about}
          lead={t.headings.aboutLead}
        />
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {t.services.map((s, i) => {
          const Icon = SERVICE_ICONS[s.icon as keyof typeof SERVICE_ICONS]
          return (
            <Reveal
              key={s.title}
              delay={i * 70}
              className="surface group relative min-w-0 overflow-hidden rounded-2xl border border-border/80 p-5 hover:border-transparent sm:p-6"
            >
              <span
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ backgroundColor: palette[400] }}
              />
              <span
                className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in oklch, ${palette[400]} 14%, transparent)`,
                  color: palette[400],
                }}
              >
                {Icon && <Icon className="h-5 w-5" />}
              </span>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
