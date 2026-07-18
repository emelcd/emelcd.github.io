import { usePreferences } from "@/context/preferences"

/** Signature hero element: a faux terminal that boots up line by line. */
export function TerminalCard() {
  const { palette, t } = usePreferences()

  const lines = [
    {
      prompt: "whoami",
      out: `${t.name.toLowerCase()}_${t.surname.toLowerCase()}`,
    },
    { prompt: "cat role.txt", out: "full stack engineer · backend-focused" },
    { prompt: "ls ~/stack", out: "python  fastapi  kafka  vue  gcp  docker" },
    { prompt: "./status --now", out: `● ${t.status.available.toLowerCase()}` },
  ]

  return (
    <div className="relative">
      <div
        className="absolute -inset-3 rounded-3xl opacity-40 blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${palette[400]}, transparent 70%)`,
        }}
      />
      <div className="relative overflow-hidden rounded-xl border border-border bg-[oklch(0.16_0_0)] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-xs text-white/40">
            miguel@dev — zsh
          </span>
        </div>
        <div className="flex flex-col gap-3 p-5 font-mono text-sm leading-relaxed">
          {lines.map((line, i) => (
            <div
              key={line.prompt}
              className="boot-line"
              style={{ animationDelay: `${0.3 + i * 0.5}s` }}
            >
              <p className="text-white/90">
                <span style={{ color: palette[400] }}>➜</span>{" "}
                <span className="text-white/50">~</span> {line.prompt}
              </p>
              <p className="text-white/70">{line.out}</p>
            </div>
          ))}
          <p
            className="boot-line text-white/90"
            style={{ animationDelay: `${0.3 + lines.length * 0.5}s` }}
          >
            <span style={{ color: palette[400] }}>➜</span>{" "}
            <span className="text-white/50">~</span>{" "}
            <span className="cursor-blink" />
          </p>
        </div>
      </div>
    </div>
  )
}
