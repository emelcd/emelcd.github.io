import type { GitHubEvent, GitHubRepo, Lang } from "@/lib/content"
import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"
import { ArrowUpRightIcon } from "@/lib/icons"

const MAX_EVENTS = 5
const MAX_REPOS = 5

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso))
}

function eventLabel(type: string, lang: Lang) {
  const labels: Record<string, { es: string; en: string }> = {
    PushEvent: { es: "push", en: "push" },
    CreateEvent: { es: "create", en: "create" },
    DeleteEvent: { es: "delete", en: "delete" },
    PullRequestEvent: { es: "pr", en: "pr" },
    IssuesEvent: { es: "issue", en: "issue" },
    WatchEvent: { es: "star", en: "star" },
    ForkEvent: { es: "fork", en: "fork" },
    ReleaseEvent: { es: "release", en: "release" },
  }
  return labels[type]?.[lang] ?? type.replace(/Event$/, "").toLowerCase()
}

function repoShortName(fullName: string) {
  return fullName.split("/")[1] ?? fullName
}

function uniqueRecentEvents(events: GitHubEvent[], limit: number) {
  const seen = new Set<string>()
  const out: GitHubEvent[] = []
  for (const event of events) {
    const key = `${event.repo}:${event.type}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(event)
    if (out.length >= limit) break
  }
  return out
}

function EventRow({
  event,
  lang,
  palette,
}: {
  event: GitHubEvent
  lang: Lang
  palette: { 400: string }
}) {
  return (
    <li className="relative py-1.5 pl-5 font-mono text-[11px] text-muted-foreground">
      <span
        className="absolute top-2.5 left-0 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: palette[400] }}
      />
      <span style={{ color: "var(--accent-400)" }}>{eventLabel(event.type, lang)}</span>
      <span className="px-1 text-border">·</span>
      <span className="text-foreground/80">{repoShortName(event.repo)}</span>
      {event.private && (
        <>
          <span className="px-1 text-border">·</span>
          <span>{lang === "es" ? "priv" : "priv"}</span>
        </>
      )}
      <span className="px-1 text-border">·</span>
      <span className="text-foreground/70">{event.summary}</span>
      <span className="px-1 text-border">·</span>
      <span>{formatDate(event.createdAt, lang)}</span>
    </li>
  )
}

function RepoRow({ repo, lang }: { repo: GitHubRepo; lang: Lang }) {
  const meta = [
    repo.private ? "🔒" : null,
    repo.language,
    !repo.private && repo.stars > 0 ? `★${formatStars(repo.stars)}` : null,
    formatDate(repo.pushedAt, lang),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <li className="flex items-center gap-2 border-b border-border/50 py-1.5 last:border-0">
      {!repo.private ? (
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate font-mono text-xs font-medium transition hover:text-(--accent-400)"
        >
          {repo.name}
        </a>
      ) : (
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium">{repo.name}</span>
      )}
      <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">
        {meta}
      </span>
      {!repo.private && (
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={repo.fullName}
          className="shrink-0 text-muted-foreground transition hover:text-foreground"
        >
          <ArrowUpRightIcon className="h-3 w-3" />
        </a>
      )}
    </li>
  )
}

export function Activity() {
  const { t, palette, github, lang } = usePreferences()
  const allRepos = github
    ? Object.values(github.repos).sort(
        (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
      )
    : []
  const repos = allRepos.slice(0, MAX_REPOS)
  const events = uniqueRecentEvents(github?.events ?? [], MAX_EVENTS)
  const totalStars = allRepos.filter((r) => !r.private).reduce((n, r) => n + r.stars, 0)
  const hiddenRepos = Math.max(allRepos.length - repos.length, 0)

  const copy = {
    recent: lang === "es" ? "Reciente" : "Recent",
    repos: lang === "es" ? "Repos activos" : "Active repos",
    empty: lang === "es" ? "Sin actividad reciente." : "No recent activity.",
    loadError:
      lang === "es"
        ? "No se pudo cargar la actividad de GitHub."
        : "Could not load GitHub activity.",
    viewAll: lang === "es" ? "Ver todos en GitHub" : "View all on GitHub",
    moreRepos: (n: number) =>
      lang === "es" ? `+${n} repos más en GitHub` : `+${n} more repos on GitHub`,
  }

  return (
    <section id="activity" className="section-band border-y">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <Reveal>
          <SectionHeader
            index="05"
            eyebrow={t.nav.activity}
            title={t.headings.activity}
            lead={t.headings.activityLead}
          />
        </Reveal>

        {!github?.profile ? (
          <Reveal delay={60}>
            <p className="mt-6 font-mono text-xs text-muted-foreground">{copy.loadError}</p>
          </Reveal>
        ) : (
          <Reveal delay={60}>
            <div className="surface mt-6 overflow-hidden rounded-xl border border-border/80">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 px-3 py-2.5">
                <a
                  href={github.profile.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:opacity-90"
                >
                  <img
                    src={github.profile.avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-md border border-border/80 object-cover"
                  />
                  <span className="font-mono text-xs font-semibold" style={{ color: "var(--accent-400)" }}>
                    @{github.profile.login}
                  </span>
                </a>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {github.profile.totalRepos} repos · {github.profile.privateRepos}{" "}
                  {lang === "es" ? "priv" : "priv"} · {github.profile.publicRepos}{" "}
                  {lang === "es" ? "publ" : "pub"}
                  {totalStars > 0 ? ` · ★${formatStars(totalStars)}` : ""}
                </span>
                <a
                  href={github.profile.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] transition hover:text-foreground"
                  style={{ color: "var(--accent-400)" }}
                >
                  {copy.viewAll}
                  <ArrowUpRightIcon className="h-3 w-3" />
                </a>
              </div>

              <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-border/60">
                <div className="px-3 py-2.5">
                  <h3 className="mb-2 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {copy.recent}
                  </h3>
                  {events.length === 0 ? (
                    <p className="font-mono text-[10px] text-muted-foreground">{copy.empty}</p>
                  ) : (
                    <ol className="space-y-0.5">
                      {events.map((event) => (
                        <EventRow key={event.id} event={event} lang={lang} palette={palette} />
                      ))}
                    </ol>
                  )}
                </div>

                <div className="border-t border-border/60 px-3 py-2.5 lg:border-t-0">
                  <h3 className="mb-2 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {copy.repos}
                  </h3>
                  <ul>
                    {repos.map((repo) => (
                      <RepoRow key={repo.fullName} repo={repo} lang={lang} />
                    ))}
                  </ul>
                  {hiddenRepos > 0 && (
                    <a
                      href={github.profile.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block font-mono text-[10px] text-muted-foreground transition hover:text-foreground"
                    >
                      {copy.moreRepos(hiddenRepos)}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
