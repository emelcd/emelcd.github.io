import type { GitHubEvent, GitHubRepo, Lang } from "@/lib/content"
import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"
import { ArrowUpRightIcon } from "@/lib/icons"

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

function formatDate(iso: string, lang: Lang, style: "short" | "long" = "short") {
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: style === "short" ? "short" : "long",
    ...(style === "long" ? { year: "numeric" } : {}),
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
    <li className="relative grid gap-1 pb-4 pl-6 last:pb-0">
      <span
        className="absolute top-1.5 left-0 h-2 w-2 rounded-full"
        style={{ backgroundColor: palette[400] }}
      />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
        <span style={{ color: "var(--accent-400)" }}>{eventLabel(event.type, lang)}</span>
        <span className="text-border">·</span>
        {!event.private ? (
          <a
            href={event.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate transition hover:text-foreground"
          >
            {repoShortName(event.repo)}
          </a>
        ) : (
          <span className="truncate">{repoShortName(event.repo)}</span>
        )}
        {event.private && (
          <>
            <span className="text-border">·</span>
            <span>{lang === "es" ? "privado" : "private"}</span>
          </>
        )}
        <span className="ml-auto shrink-0">{formatDate(event.createdAt, lang)}</span>
      </div>
      <p className="truncate text-sm text-foreground/85">{event.summary}</p>
    </li>
  )
}

function RepoRow({ repo, lang }: { repo: GitHubRepo; lang: Lang }) {
  return (
    <li className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {repo.private ? (
            <span className="font-mono text-xs text-muted-foreground" title={lang === "es" ? "Privado" : "Private"}>
              🔒
            </span>
          ) : (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate font-mono text-sm font-medium transition hover:text-[var(--accent-400)]"
            >
              {repo.name}
            </a>
          )}
          {repo.private && (
            <span className="truncate font-mono text-sm font-medium">{repo.name}</span>
          )}
        </div>
        {repo.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{repo.description}</p>
        )}
      </div>
      <div className="hidden shrink-0 items-center gap-2 font-mono text-[11px] text-muted-foreground sm:flex">
        {repo.language && <span>{repo.language}</span>}
        {!repo.private && repo.stars > 0 && <span>★ {formatStars(repo.stars)}</span>}
        <span>{formatDate(repo.pushedAt, lang)}</span>
      </div>
      {!repo.private && (
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={repo.fullName}
          className="shrink-0 text-muted-foreground transition hover:text-foreground"
        >
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </a>
      )}
    </li>
  )
}

export function Activity() {
  const { t, palette, github, lang } = usePreferences()
  const repos = github
    ? Object.values(github.repos).sort(
        (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
      )
    : []
  const events = (github?.events ?? []).slice(0, 8)
  const totalStars = repos.filter((r) => !r.private).reduce((n, r) => n + r.stars, 0)

  const copy = {
    recent: lang === "es" ? "Reciente" : "Recent",
    repos: lang === "es" ? "Repos" : "Repos",
    empty: lang === "es" ? "Sin actividad reciente." : "No recent activity.",
    loadError:
      lang === "es"
        ? "No se pudo cargar la actividad de GitHub."
        : "Could not load GitHub activity.",
    stat: (n: number, label: string) => `${n} ${label}`,
    labels: {
      total: lang === "es" ? "repos" : "repos",
      private: lang === "es" ? "privados" : "private",
      public: lang === "es" ? "públicos" : "public",
    },
  }

  return (
    <section id="activity" className="section-band border-y">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <SectionHeader
            index="05"
            eyebrow={t.nav.activity}
            title={t.headings.activity}
            lead={t.headings.activityLead}
          />
        </Reveal>

        {!github?.profile ? (
          <Reveal delay={80}>
            <p className="mt-10 font-mono text-sm text-muted-foreground">{copy.loadError}</p>
          </Reveal>
        ) : (
          <div className="mt-10 space-y-6">
            <Reveal delay={60}>
              <div className="surface flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border/80 px-4 py-3">
                <a
                  href={github.profile.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 transition hover:opacity-90"
                >
                  <img
                    src={github.profile.avatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-lg border border-border/80 object-cover"
                  />
                  <span className="font-mono text-sm font-semibold" style={{ color: "var(--accent-400)" }}>
                    @{github.profile.login}
                  </span>
                </a>
                <span className="hidden h-4 w-px bg-border/80 sm:block" />
                <p className="font-mono text-xs text-muted-foreground">
                  {[
                    copy.stat(github.profile.totalRepos, copy.labels.total),
                    copy.stat(github.profile.privateRepos, copy.labels.private),
                    copy.stat(github.profile.publicRepos, copy.labels.public),
                    totalStars > 0 ? `★ ${formatStars(totalStars)}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </Reveal>

            <div className="grid gap-6 lg:grid-cols-2">
              <Reveal delay={90}>
                <div className="surface h-full rounded-xl border border-border/80 p-4 md:p-5">
                  <h3 className="mb-4 font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {copy.recent}
                  </h3>
                  {events.length === 0 ? (
                    <p className="font-mono text-xs text-muted-foreground">{copy.empty}</p>
                  ) : (
                    <ol className="relative ml-0.5">
                      <div
                        className="pointer-events-none absolute top-2 bottom-2 left-[3px] w-px bg-border/80"
                        aria-hidden
                      />
                      {events.map((event) => (
                        <EventRow key={event.id} event={event} lang={lang} palette={palette} />
                      ))}
                    </ol>
                  )}
                </div>
              </Reveal>

              <Reveal delay={110}>
                <div className="surface h-full rounded-xl border border-border/80 p-4 md:p-5">
                  <h3 className="mb-2 font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {copy.repos}
                    <span className="ml-2 font-normal normal-case text-muted-foreground/70">
                      ({repos.length})
                    </span>
                  </h3>
                  <ul>
                    {repos.map((repo) => (
                      <RepoRow key={repo.fullName} repo={repo} lang={lang} />
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
