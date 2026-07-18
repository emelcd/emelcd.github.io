type SectionHeaderProps = {
  index: string
  eyebrow: string
  title: string
  lead?: string
}

export function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
}: SectionHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:text-xs sm:tracking-[0.25em]">
        <span style={{ color: "var(--accent-400)" }}>{index}</span> — {eyebrow}
      </span>
      <h2 className="max-w-2xl text-2xl font-bold tracking-tight break-words sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {lead && (
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">{lead}</p>
      )}
    </div>
  )
}
