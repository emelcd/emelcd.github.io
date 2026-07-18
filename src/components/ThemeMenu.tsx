import { Popover } from "@base-ui/react/popover"
import { usePreferences } from "@/context/preferences"
import {
  ACCENT_ORDER,
  ACCENTS,
  FONT_ORDER,
  FONTS,
  type Accent,
  type FontId,
} from "@/lib/content"
import { cn } from "@/lib/utils"

export function ThemeMenu() {
  const { lang, accent, font, palette, setAccent, setFont } = usePreferences()

  const copy =
    lang === "es"
      ? { title: "Apariencia", color: "Color", font: "Fuente" }
      : { title: "Appearance", color: "Color", font: "Font" }

  return (
    <Popover.Root>
      <Popover.Trigger
        className="rounded-md p-2 transition hover:bg-muted aria-expanded:bg-muted"
        aria-label={copy.title}
      >
        <span
          className="block h-4 w-4 rounded-full ring-2 ring-offset-2 ring-offset-background"
          style={{
            backgroundColor: palette[400],
            boxShadow: `0 0 0 2px ${palette[400]}`,
          }}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-[70]">
          <Popover.Popup className="w-64 origin-(--transform-origin) rounded-xl border border-border/80 bg-card/95 p-3 shadow-xl outline-none backdrop-blur-xl transition data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <Popover.Title className="mb-3 font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.title}
            </Popover.Title>

            <div className="space-y-4">
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
