import { Popover } from "@base-ui/react/popover"
import { usePreferences } from "@/context/preferences"
import {
  ACCENT_ORDER,
  ACCENTS,
  FONT_ORDER,
  FONTS,
  type Accent,
  type FontId,
  type Lang,
} from "@/lib/content"
import { cn } from "@/lib/utils"

export function ThemeMenu() {
  const {
    lang,
    dark,
    accent,
    font,
    palette,
    setLang,
    setDark,
    setAccent,
    setFont,
  } = usePreferences()

  const copy =
    lang === "es"
      ? {
          title: "Preferencias",
          language: "Idioma",
          theme: "Tema",
          color: "Color",
          font: "Fuente",
          dark: "Oscuro",
          light: "Claro",
        }
      : {
          title: "Preferences",
          language: "Language",
          theme: "Theme",
          color: "Color",
          font: "Font",
          dark: "Dark",
          light: "Light",
        }

  const langs: { id: Lang; flag: string; label: string }[] = [
    { id: "es", flag: "🇪🇸", label: "ES" },
    { id: "en", flag: "🇬🇧", label: "EN" },
  ]

  return (
    <Popover.Root>
      <Popover.Trigger
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 transition hover:bg-muted aria-expanded:bg-muted"
        aria-label={copy.title}
      >
        <span className="text-sm">{lang === "es" ? "🇪🇸" : "🇬🇧"}</span>
        <span className="text-sm leading-none">{dark ? "🌙" : "☀️"}</span>
        <span
          className="block size-3.5 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${palette[400]}, ${palette[800]})`,
            boxShadow: `0 0 0 1.5px ${palette[400]}`,
          }}
        />
        <span className="font-mono text-[10px] font-semibold text-muted-foreground">
          Aa
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-[70]"
        >
          <Popover.Popup className="w-72 origin-(--transform-origin) rounded-xl border border-border/80 bg-card/95 p-3 shadow-xl outline-none backdrop-blur-xl transition data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <Popover.Title className="mb-3 font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.title}
            </Popover.Title>

            <div className="space-y-4">
              <section>
                <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase">
                  {copy.language}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {langs.map((item) => {
                    const selected = item.id === lang
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLang(item.id)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-xs font-semibold transition hover:bg-muted",
                          selected
                            ? "border-border bg-muted"
                            : "border-transparent",
                        )}
                        aria-pressed={selected}
                      >
                        <span>{item.flag}</span>
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase">
                  {copy.theme}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { dark: true, icon: "🌙", label: copy.dark },
                      { dark: false, icon: "☀️", label: copy.light },
                    ] as const
                  ).map((item) => {
                    const selected = item.dark === dark
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setDark(item.dark)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-xs font-semibold transition hover:bg-muted",
                          selected
                            ? "border-border bg-muted"
                            : "border-transparent",
                        )}
                        aria-pressed={selected}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase">
                  {copy.color}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {ACCENT_ORDER.map((id) => {
                    const swatch = ACCENTS[id]
                    const selected = id === accent
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setAccent(id as Accent)}
                        className={cn(
                          "grid place-items-center rounded-lg border border-transparent p-1.5 transition hover:bg-muted",
                          selected && "border-border bg-muted",
                        )}
                        aria-label={id}
                        aria-pressed={selected}
                        title={id}
                      >
                        <span
                          className="block size-6 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${swatch[400]}, ${swatch[800]})`,
                            boxShadow: selected
                              ? `0 0 0 2px var(--background), 0 0 0 4px ${swatch[400]}`
                              : undefined,
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase">
                  {copy.font}
                </p>
                <div className="flex flex-col gap-0.5">
                  {FONT_ORDER.map((id) => {
                    const option = FONTS[id]
                    const selected = id === font
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFont(id as FontId)}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-muted",
                          selected && "bg-muted",
                        )}
                        style={{ fontFamily: option.family }}
                        aria-pressed={selected}
                      >
                        <span>{option.label}</span>
                        {selected ? (
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: "var(--accent-400)" }}
                          >
                            ●
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
