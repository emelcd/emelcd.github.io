import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { usePreferences } from "@/context/preferences"
import {
  bootLines,
  executeCommand,
  type TerminalEffect,
  type TerminalLine,
} from "@/lib/terminal"

function lineColor(kind: TerminalLine["kind"]) {
  if (kind === "error") return "text-[#ff6b6b]"
  if (kind === "boot") return "text-white/50"
  return "text-white/70"
}

export function TerminalCard() {
  const {
    palette,
    lang,
    dark,
    accent,
    t,
    resumeHref,
    setLang,
    setDark,
    setAccent,
    toggleLang,
    toggleTheme,
    cycleAccent,
  } = usePreferences()

  const [history, setHistory] = useState<TerminalLine[]>(() => bootLines(lang))
  const [input, setInput] = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [cmdIndex, setCmdIndex] = useState(-1)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])

  const applyEffects = useCallback(
    (effects: TerminalEffect[]) => {
      for (const effect of effects) {
        switch (effect.type) {
          case "setLang":
            setLang(effect.lang)
            break
          case "toggleLang":
            toggleLang()
            break
          case "setDark":
            setDark(effect.dark)
            break
          case "toggleTheme":
            toggleTheme()
            break
          case "setAccent":
            setAccent(effect.accent)
            break
          case "cycleAccent":
            cycleAccent()
            break
          case "scrollTo":
            document
              .querySelector(`#${effect.sectionId}`)
              ?.scrollIntoView({ behavior: "smooth" })
            break
          case "openResume":
            window.open(resumeHref, "_blank", "noopener,noreferrer")
            break
          case "clear":
            setHistory(bootLines(lang))
            break
        }
      }
    },
    [
      lang,
      resumeHref,
      setLang,
      setDark,
      setAccent,
      toggleLang,
      toggleTheme,
      cycleAccent,
    ],
  )

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return

      const result = executeCommand(trimmed, { lang, dark, accent, t })
      const hasClear = result.effects.some((e) => e.type === "clear")

      if (hasClear) {
        setHistory(bootLines(lang))
      } else if (result.lines.length > 0) {
        setHistory((prev) => [...prev, ...result.lines])
      }

      applyEffects(result.effects.filter((e) => e.type !== "clear"))

      setCmdHistory((prev) => [...prev, trimmed])
      setCmdIndex(-1)
      setInput("")
    },
    [lang, dark, accent, t, applyEffects],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    runCommand(input)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setInput("")
      setCmdIndex(-1)
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const next =
        cmdIndex < 0 ? cmdHistory.length - 1 : Math.max(0, cmdIndex - 1)
      setCmdIndex(next)
      setInput(cmdHistory[next] ?? "")
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (cmdIndex < 0) return
      const next = cmdIndex + 1
      if (next >= cmdHistory.length) {
        setCmdIndex(-1)
        setInput("")
      } else {
        setCmdIndex(next)
        setInput(cmdHistory[next] ?? "")
      }
    }
  }

  const focusInput = () => inputRef.current?.focus()

  return (
    <div className="relative">
      <div
        className="absolute -inset-3 rounded-3xl opacity-40 blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${palette[400]}, transparent 70%)`,
        }}
      />
      <div
        ref={cardRef}
        role="region"
        aria-label="Terminal interactiva"
        className="relative overflow-hidden rounded-xl border border-border bg-[oklch(0.16_0_0)] shadow-2xl"
        onClick={focusInput}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-xs text-white/40">
            miguel@dev — zsh
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex max-h-80 flex-col gap-2 overflow-y-auto p-5 font-mono text-sm leading-relaxed"
        >
          {history.map((line, i) => (
            <div key={`${line.kind}-${i}-${line.text.slice(0, 24)}`}>
              {line.kind === "input" ? (
                <p className="text-white/90">
                  <span style={{ color: palette[400] }}>➜</span>{" "}
                  <span className="text-white/50">~</span> {line.command}
                </p>
              ) : (
                <p className={lineColor(line.kind)}>{line.text}</p>
              )}
            </div>
          ))}

          <form onSubmit={onSubmit} className="text-white/90">
            <label className="flex items-baseline gap-0">
              <span style={{ color: palette[400] }}>➜</span>
              <span className="mx-1 text-white/50">~</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Comando de terminal"
                className="min-w-0 flex-1 bg-transparent text-white/90 outline-none placeholder:text-white/30"
              />
              {!input && (
                <span className="pointer-events-none -ml-px cursor-blink" />
              )}
            </label>
          </form>
        </div>
      </div>
    </div>
  )
}
