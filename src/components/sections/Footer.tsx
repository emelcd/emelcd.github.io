import { usePreferences } from "@/context/preferences"

export function Footer() {
  const { t, palette } = usePreferences()

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 font-mono text-xs text-muted-foreground sm:flex-row">
        <span>
          © {t.name} {t.surname} — {t.footerNote}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: palette[400] }}
          />
          {t.status.location}
        </span>
      </div>
    </footer>
  )
}
