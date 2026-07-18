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
    <div className="flex flex-col gap-3">
      <span className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
        <span style={{ color: "var(--accent-400)" }}>{index}</span> — {eyebrow}
      </span>
      <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {lead && <p className="max-w-xl text-base text-muted-foreground">{lead}</p>}
    </div>
  )
}
