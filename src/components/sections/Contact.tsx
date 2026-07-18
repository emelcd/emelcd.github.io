import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SOCIALS, isExternal } from "@/lib/socials"
import { SOCIAL_LINKS } from "@/lib/content"
import { EnvelopeIcon } from "@/lib/icons"

export function Contact() {
  const { t, palette, resumeHref } = usePreferences()

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-border/50"
    >
      <div className="accent-glow pointer-events-none absolute bottom-[-35%] left-1/2 h-[min(520px,70vw)] w-[min(820px,160vw)] -translate-x-1/2 blur-sm" />
      <div
        className="pointer-events-none absolute top-[10%] left-[15%] size-[min(200px,40vw)] rounded-full opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${palette[400]}28, transparent 70%)`,
        }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-5 py-16 text-center sm:gap-6 sm:py-20 md:py-28">
        <Reveal className="flex w-full min-w-0 flex-col items-center gap-5 sm:gap-6">
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase sm:text-xs">
            <span style={{ color: "var(--accent-400)" }}>07</span> — {t.nav.contact}
          </span>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight break-words sm:text-4xl md:text-5xl">
            {t.headings.contact}
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            {t.headings.contactLead}
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            {t.contact.line}
          </p>
          <a
            href={SOCIAL_LINKS.email}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            style={{
              background: `linear-gradient(135deg, ${palette[400]}, ${palette[600]})`,
            }}
          >
            <EnvelopeIcon className="h-4 w-4" />
            {t.contact.button}
          </a>
          <div className="flex items-center gap-4 pt-2">
            {SOCIALS.map(({ href, icon: Icon, label }) => {
              const url = label === "Resume" ? resumeHref : href
              return (
              <a
                key={label}
                href={url}
                target={isExternal(url) ? "_blank" : undefined}
                rel={isExternal(url) ? "noreferrer" : undefined}
                aria-label={label}
                className="rounded-lg border border-border bg-card p-2.5 text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
