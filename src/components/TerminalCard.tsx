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
  answerQuiz,
  createGuessGame,
  createQuizGame,
  createSnakeGame,
  gameCopy,
  guessNumber,
  renderSnake,
  setSnakeDir,
  snakeDirFromKey,
  tickSnake,
  type ActiveGame,
} from "@/lib/terminal-games"
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

function asOutput(text: string): TerminalLine {
  return { kind: "output", text }
}

function asInput(command: string): TerminalLine {
  return { kind: "input", command, text: command }
}

const QUIT_CMDS = new Set(["quit", "exit", "stop"])

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
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null)
  const [gameLines, setGameLines] = useState<string[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gameOverShown = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history, gameLines])

  const stopGame = useCallback(
    (lines: TerminalLine[] = []) => {
      setActiveGame(null)
      setGameLines([])
      gameOverShown.current = false
      if (lines.length > 0) {
        setHistory((prev) => [...prev, ...lines])
      }
    },
    [],
  )

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
            stopGame()
            setHistory(bootLines(lang))
            break
          case "startGame":
            gameOverShown.current = false
            if (effect.game === "snake") {
              const game = createSnakeGame()
              setActiveGame(game)
              setGameLines(renderSnake(game))
            } else if (effect.game === "guess") {
              setActiveGame(createGuessGame())
              setGameLines([])
            } else {
              setActiveGame(createQuizGame(lang))
              setGameLines([])
            }
            break
          case "stopGame":
            stopGame()
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
      stopGame,
    ],
  )

  useEffect(() => {
    if (!activeGame || activeGame.type !== "snake" || activeGame.gameOver) return

    const id = window.setInterval(() => {
      setActiveGame((prev) => {
        if (!prev || prev.type !== "snake" || prev.gameOver) return prev
        const next = tickSnake(prev)
        setGameLines(renderSnake(next))
        if (next.gameOver && !gameOverShown.current) {
          gameOverShown.current = true
          const c = gameCopy(lang)
          setGameLines((lines) => [...lines, c.snakeOver(next.score)])
        }
        return next
      })
    }, 140)

    return () => window.clearInterval(id)
  }, [activeGame, lang])

  const appendHistory = useCallback((lines: TerminalLine[]) => {
    if (lines.length > 0) setHistory((prev) => [...prev, ...lines])
  }, [])

  const finishInput = useCallback((trimmed: string) => {
    setCmdHistory((prev) => [...prev, trimmed])
    setCmdIndex(-1)
    setInput("")
  }, [])

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return

      const lower = trimmed.toLowerCase()

      if (activeGame && QUIT_CMDS.has(lower)) {
        appendHistory([
          asInput(trimmed),
          asOutput(gameCopy(lang).quit),
        ])
        stopGame()
        finishInput(trimmed)
        return
      }

      if (activeGame?.type === "guess") {
        const result = guessNumber(lang, activeGame, trimmed)
        appendHistory([
          asInput(trimmed),
          ...result.lines.map(asOutput),
        ])
        setActiveGame(result.game)
        finishInput(trimmed)
        return
      }

      if (activeGame?.type === "quiz") {
        const result = answerQuiz(lang, activeGame, trimmed)
        appendHistory([
          asInput(trimmed),
          ...result.lines.map(asOutput),
        ])
        setActiveGame(result.game)
        finishInput(trimmed)
        return
      }

      if (activeGame?.type === "snake") {
        appendHistory([
          asInput(trimmed),
          asOutput(
            lang === "es"
              ? "snake activo — usa flechas o 'quit' para salir"
              : "snake running — use arrows or 'quit' to exit",
          ),
        ])
        finishInput(trimmed)
        return
      }

      const result = executeCommand(trimmed, { lang, dark, accent, t })
      const hasClear = result.effects.some((e) => e.type === "clear")

      if (hasClear) {
        stopGame()
        setHistory(bootLines(lang))
      } else if (result.lines.length > 0) {
        appendHistory(result.lines)
      }

      applyEffects(result.effects.filter((e) => e.type !== "clear"))
      finishInput(trimmed)
    },
    [
      activeGame,
      lang,
      dark,
      accent,
      t,
      applyEffects,
      appendHistory,
      finishInput,
      stopGame,
    ],
  )

  const handleSnakeKey = useCallback(
    (key: string) => {
      if (activeGame?.type !== "snake") return false

      if (key === "q" || key === "Q") {
        appendHistory([asOutput(gameCopy(lang).quit)])
        stopGame()
        return true
      }

      const dir = snakeDirFromKey(key)
      if (!dir) return false

      setActiveGame((prev) => {
        if (!prev || prev.type !== "snake") return prev
        return setSnakeDir(prev, dir)
      })
      return true
    },
    [activeGame, lang, appendHistory, stopGame],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    runCommand(input)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (handleSnakeKey(e.key)) {
      e.preventDefault()
      return
    }

    if (e.key === "Escape") {
      if (activeGame) {
        appendHistory([asOutput(gameCopy(lang).quit)])
        stopGame()
      } else {
        setInput("")
        setCmdIndex(-1)
      }
      return
    }

    if (e.key === "ArrowUp" && !activeGame) {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const next =
        cmdIndex < 0 ? cmdHistory.length - 1 : Math.max(0, cmdIndex - 1)
      setCmdIndex(next)
      setInput(cmdHistory[next] ?? "")
      return
    }

    if (e.key === "ArrowDown" && !activeGame) {
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
        className="absolute -inset-4 rounded-3xl opacity-50 blur-3xl"
        style={{
          background: `linear-gradient(135deg, ${palette[400]}99, ${palette[600]}40 40%, transparent 72%)`,
        }}
      />
      <div
        className="absolute -inset-1 rounded-2xl opacity-60 blur-xl"
        style={{
          background: `linear-gradient(160deg, ${palette[400]}33, transparent 60%)`,
        }}
      />
      <div
        role="region"
        aria-label="Terminal interactiva"
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.16_0_0)] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-12px_rgba(0,0,0,0.55),0_12px_24px_-8px_rgba(0,0,0,0.4)]"
        onClick={focusInput}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-xs text-white/40">
            miguel@dev — zsh
            {activeGame ? ` · ${activeGame.type}` : ""}
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

          {gameLines.length > 0 && (
            <div
              className="rounded border border-white/10 bg-black/30 p-3 text-xs leading-tight text-white/80"
              aria-live="polite"
            >
              {gameLines.map((line, i) => (
                <div key={`game-${i}-${line.slice(0, 12)}`} className="whitespace-pre">
                  {line}
                </div>
              ))}
            </div>
          )}

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
