import { lazy, Suspense, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Menu, X } from "lucide-react"
import { SectionDots } from "@/components/SectionDots"
import { ThemeMenu } from "@/components/ThemeMenu"
import { usePreferences } from "@/context/preferences"
import { useActiveSection } from "@/hooks/useActiveSection"
import { cn } from "@/lib/utils"

const ChipScene = lazy(() => import("@/components/ChipScene"))

export function Navbar() {
  const { t, lang } = usePreferences()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: "#about", id: "about", label: t.nav.about },
    { href: "#work", id: "work", label: t.nav.work },
    { href: "#projects", id: "projects", label: t.nav.projects },
    { href: "#activity", id: "activity", label: t.nav.activity },
    { href: "#contact", id: "contact", label: t.nav.contact },
  ]

  const active = useActiveSection(links.map((l) => l.id))
  const menuCopy =
    lang === "es"
      ? { open: "Abrir menú", close: "Cerrar menú", title: "Navegar" }
      : { open: "Open menu", close: "Close menu", title: "Navigate" }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/65 shadow-[0_1px_0_color-mix(in_oklch,var(--foreground)_4%,transparent),0_8px_24px_-16px_color-mix(in_oklch,var(--foreground)_18%,transparent)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <a
            href="#top"
            aria-label={`${t.name} ${t.surname}`}
            className="-my-2 -ml-2 shrink-0"
          >
            <Suspense fallback={<span className="block size-13" />}>
              <ChipScene className="size-13" />
            </Suspense>
          </a>

          <div className="hidden items-center gap-1 font-mono text-sm text-muted-foreground lg:flex">
            {links.map((item) => {
              const isActive = active === item.id
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted hover:text-foreground",
                    isActive && "bg-muted text-foreground",
                  )}
                >
                  {item.label}
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-0.5">
            <ThemeMenu />

            <button
              type="button"
              className="grid size-9 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
              aria-label={menuCopy.open}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-4" strokeWidth={2} />
            </button>

            <Dialog.Root
              open={menuOpen}
              onOpenChange={(open) => setMenuOpen(open)}
            >
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
                <Dialog.Popup className="fixed inset-x-3 top-3 z-[90] max-h-[calc(100dvh-1.5rem)] w-auto overflow-y-auto rounded-2xl border border-border/80 bg-card/95 p-4 shadow-2xl outline-none backdrop-blur-xl transition data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:inset-x-auto sm:right-3 sm:left-auto sm:w-80">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Dialog.Title className="font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {menuCopy.title}
                    </Dialog.Title>
                    <Dialog.Close
                      className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label={menuCopy.close}
                    >
                      <X className="size-4" strokeWidth={2} />
                    </Dialog.Close>
                  </div>

                  <ol className="flex flex-col gap-1">
                    {links.map((item, i) => {
                      const isActive = active === item.id
                      return (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            aria-current={isActive ? "true" : undefined}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-3 font-mono text-sm transition hover:bg-muted",
                              isActive && "bg-muted",
                            )}
                          >
                            <span
                              className="text-[11px] font-semibold tabular-nums"
                              style={{ color: "var(--accent-400)" }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={cn(
                                "text-muted-foreground",
                                isActive && "font-semibold text-foreground",
                              )}
                            >
                              {item.label}
                            </span>
                          </a>
                        </li>
                      )
                    })}
                  </ol>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </nav>
      </header>

      <SectionDots links={links} />
    </>
  )
}
