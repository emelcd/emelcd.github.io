import { usePreferences } from "@/context/preferences"
import { useActiveSection } from "@/hooks/useActiveSection"
import { cn } from "@/lib/utils"

type NavLink = { href: string; label: string; id: string }

export function SectionDots({ links }: { links: NavLink[] }) {
  const { lang } = usePreferences()
  const ids = links.map((l) => l.id)
  const active = useActiveSection(ids)
  const label = lang === "es" ? "Secciones" : "Sections"

  return (
    <nav
      aria-label={label}
      className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col items-end gap-2 lg:flex xl:right-5"
    >
      {links.map((item) => {
        const isActive = active === item.id
        return (
          <a
            key={item.id}
            href={item.href}
            className="pointer-events-auto group flex items-center gap-2"
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={cn(
                "rounded-md bg-card/90 px-2 py-0.5 font-mono text-[10px] text-muted-foreground opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100",
                isActive && "opacity-100 text-foreground",
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                "block size-2 rounded-full border border-border bg-muted transition",
                isActive && "scale-125 border-transparent",
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--accent-400)",
                      boxShadow: "0 0 0 3px color-mix(in oklch, var(--accent-400) 28%, transparent)",
                    }
                  : undefined
              }
            />
          </a>
        )
      })}
    </nav>
  )
}
