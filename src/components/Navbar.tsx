import { ThemeMenu } from "@/components/ThemeMenu"
import { usePreferences } from "@/context/preferences"

export function Navbar() {
  const { t, palette } = usePreferences()

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

        <div className="flex items-center">
          <ThemeMenu />
        </div>
      </nav>
    </header>
  )
}
