import { usePreferences } from "@/context/preferences"

export function Navbar() {
  const { t, palette, toggleLang, toggleTheme, cycleAccent, dark } =
    usePreferences()

  const initials = `${t.name[0]}${t.surname[0]}`
  const links = [
    { href: "#about", label: t.nav.about },
    { href: "#work", label: t.nav.work },
    { href: "#projects", label: t.nav.projects },
    { href: "#activity", label: t.nav.activity },
    { href: "#contact", label: t.nav.contact },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/65 shadow-[0_1px_0_color-mix(in_oklch,var(--foreground)_4%,transparent),0_8px_24px_-16px_color-mix(in_oklch,var(--foreground)_18%,transparent)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="#top" className="group flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-lg font-mono text-sm font-bold text-white shadow-sm transition group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${palette[400]}, ${palette[800]})`,
            }}
          >
            {initials}
          </span>
          <span className="hidden font-mono text-sm font-semibold tracking-tight sm:block">
            {t.name.toLowerCase()}
            <span style={{ color: "var(--accent-400)" }}>.dev</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 font-mono text-sm text-muted-foreground md:flex">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-xs font-semibold transition hover:bg-muted"
            aria-label="Toggle language"
          >
            <span className="text-sm">{t.flag}</span>
            {t.langLabel}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md p-2 text-base transition hover:bg-muted"
            aria-label="Toggle theme"
          >
            {dark ? "🌙" : "☀️"}
          </button>
          <button
            type="button"
            onClick={cycleAccent}
            className="rounded-md p-2 transition hover:bg-muted"
            aria-label="Cycle accent color"
          >
            <span
              className="block h-4 w-4 rounded-full ring-2 ring-offset-2 ring-offset-background"
              style={{
                backgroundColor: palette[400],
                boxShadow: `0 0 0 2px ${palette[400]}`,
              }}
            />
          </button>
        </div>
      </nav>
    </header>
  )
}
