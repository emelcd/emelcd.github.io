import { useEffect, useState } from "react"
import { usePreferences } from "@/context/preferences"

const LINES = {
  es: [
    "init portfolio shell",
    "fetch /api/cv",
    "parse es · en bundles",
    "mount ui",
  ],
  en: [
    "init portfolio shell",
    "fetch /api/cv",
    "parse es · en bundles",
    "mount ui",
  ],
} as const

export function LoadingScreen() {
  const { contentLoading, lang, palette } = usePreferences()
  const [phase, setPhase] = useState<"loading" | "exit" | "hidden">("loading")
  const lines = LINES[lang]

  useEffect(() => {
    if (contentLoading) {
      setPhase("loading")
      return
    }

    setPhase("exit")
    const id = window.setTimeout(() => setPhase("hidden"), 520)
    return () => window.clearTimeout(id)
  }, [contentLoading])

  if (phase === "hidden") return null

  return (
    <div
      aria-hidden={phase === "exit"}
      aria-live="polite"
      aria-busy={phase === "loading"}
      className={`fixed inset-0 z-[100] grid place-items-center transition-opacity duration-500 ease-out ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-background/92 backdrop-blur-md" />
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />
      <div className="accent-glow pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 blur-sm" />

      <div className="relative w-[min(92vw,26rem)] overflow-hidden rounded-2xl border border-border/80 bg-[#0d1117] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-xs text-white/45">boot — emelcd.dev</span>
        </div>

        <div className="space-y-2 px-4 py-5 font-mono text-sm">
          {lines.map((line, i) => (
            <p
              key={line}
              className="boot-line text-white/70"
              style={{ animationDelay: `${120 + i * 180}ms` }}
            >
              <span className="text-white/35">$</span> {line}
              {i === lines.length - 1 && phase === "loading" && (
                <span className="cursor-blink ml-1 inline-block" />
              )}
            </p>
          ))}
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-white/40">
            <span>{lang === "es" ? "cargando" : "loading"}</span>
            <span style={{ color: palette[400] }}>
              {phase === "loading" ? "···" : "ok"}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                phase === "loading" ? "loader-bar-active" : "w-full"
              }`}
              style={{
                background: `linear-gradient(90deg, ${palette[400]}, ${palette[600]})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
