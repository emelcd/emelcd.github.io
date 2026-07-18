import type { GitHubRepo, Lang } from "@/lib/content"
import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"
import { ArrowUpRightIcon } from "@/lib/icons"

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

function eventLabel(type: string, lang: Lang) {
  const labels: Record<string, { es: string; en: string }> = {
    PushEvent: { es: "Push", en: "Push" },
    CreateEvent: { es: "Creación", en: "Create" },
    DeleteEvent: { es: "Borrado", en: "Delete" },
    PullRequestEvent: { es: "Pull request", en: "Pull request" },
    IssuesEvent: { es: "Issue", en: "Issue" },
    WatchEvent: { es: "Star", en: "Star" },
    ForkEvent: { es: "Fork", en: "Fork" },
    ReleaseEvent: { es: "Release", en: "Release" },
  }
  return labels[type]?.[lang] ?? type.replace(/Event$/, "")
}

function RepoCard({
  repo,
  index,
  lang,
}: {
  repo: GitHubRepo
  index: number
  lang: Lang
}) {
  return (
    <Reveal
      delay={120 + index * 60}
      className="surface group flex flex-col rounded-2xl border border-border/80 p-6"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-mono text-base font-semibold">{repo.name}</h3>
          {repo.private && (
            <span className="shrink-0 rounded-full border border-border/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {lang === "es" ? "privado" : "private"}
            </span>
          )}
        </div>
        {!repo.private && (
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={repo.fullName}
            className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
          >
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        )}
      </div>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {repo.description ||
          (lang === "es" ? "Sin descripción." : "No description.")}
      </p>
      <div className="mb-3 flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
        {!repo.private && (
          <span className="rounded-md border border-border/80 bg-background px-2 py-0.5">
            ★ {formatStars(repo.stars)}
          </span>
        )}
        {!repo.private && repo.forks > 0 && (
          <span className="rounded-md border border-border/80 bg-background px-2 py-0.5">
            fork {repo.forks}
          </span>
        )}
        {repo.language && (
          <span className="rounded-md border border-border/80 bg-background px-2 py-0.5">
            {repo.language}
          </span>
        )}
        <span className="rounded-md border border-border/80 bg-background px-2 py-0.5">
          {lang === "es" ? "push" : "pushed"} {formatDate(repo.pushedAt, lang)}
        </span>
      </div>
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </Reveal>
  )
}

export function Activity() {
  const { t, palette, github, lang } = usePreferences()
  const repos = github
    ? Object.values(github.repos).sort(
        (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
      )
    : []
  const privateRepos = repos.filter((repo) => repo.private)
  const publicRepos = repos.filter((repo) => !repo.private)
  const events = github?.events ?? []

  return (
    <section id="activity" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
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
          <p className="mt-10 font-mono text-sm text-muted-foreground">
            {lang === "es"
              ? "No se pudo cargar la actividad de GitHub."
              : "Could not load GitHub activity."}
          </p>
        </Reveal>
      ) : (
        <>
          <Reveal delay={70}>
            <div className="surface mt-10 flex flex-col gap-5 rounded-2xl border border-border/80 p-6 sm:flex-row sm:items-center">
              <img
                src={github.profile.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-2xl border border-border/80 bg-card object-cover"
              />
              <div className="flex-1">
                <a
                  href={github.profile.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-lg font-semibold transition hover:gap-1.5"
                  style={{ color: "var(--accent-400)" }}
                >
                  @{github.profile.login}
                  <ArrowUpRightIcon className="h-4 w-4" />
                </a>
                {github.profile.name && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {github.profile.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 font-mono text-center text-xs sm:grid-cols-4 sm:gap-6">
                <div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: palette[400] }}
                  >
                    {github.profile.totalRepos}
                  </p>
                  <p className="text-muted-foreground">
                    {lang === "es" ? "total" : "total"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: palette[400] }}
                  >
                    {github.profile.privateRepos}
                  </p>
                  <p className="text-muted-foreground">
                    {lang === "es" ? "privados" : "private"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: palette[400] }}
                  >
                    {github.profile.publicRepos}
                  </p>
                  <p className="text-muted-foreground">
                    {lang === "es" ? "públicos" : "public"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: palette[400] }}
                  >
                    {publicRepos.reduce((sum, repo) => sum + repo.stars, 0)}
                  </p>
                  <p className="text-muted-foreground">stars</p>
                </div>
              </div>
            </div>
          </Reveal>

          {events.length > 0 && (
            <Reveal delay={100}>
              <div className="mt-8">
                <h3 className="mb-4 font-mono text-sm font-semibold text-muted-foreground">
                  {lang === "es" ? "Eventos recientes" : "Recent events"}
                </h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="surface flex flex-col gap-2 rounded-xl border border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                          <span
                            className="rounded-md px-2 py-0.5"
                            style={{
                              backgroundColor: `color-mix(in oklch, ${palette[400]} 12%, transparent)`,
                              color: "var(--accent-400)",
                            }}
                          >
                            {eventLabel(event.type, lang)}
                          </span>
                          {event.private && (
                            <span className="rounded-md border border-border/80 px-2 py-0.5">
                              {lang === "es" ? "privado" : "private"}
                            </span>
                          )}
                          {!event.private ? (
                            <a
                              href={event.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="transition hover:text-foreground"
                            >
                              {event.repo}
                            </a>
                          ) : (
                            <span>{event.repo}</span>
                          )}
                        </div>
                        <p className="truncate text-sm text-foreground/90">
                          {event.summary}
                        </p>
                      </div>
                      <time
                        dateTime={event.createdAt}
                        className="shrink-0 font-mono text-[11px] text-muted-foreground"
                      >
                        {formatDate(event.createdAt, lang)}
                      </time>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {privateRepos.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 font-mono text-sm font-semibold text-muted-foreground">
                {lang === "es" ? "Repos privados" : "Private repos"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {privateRepos.map((repo, i) => (
                  <RepoCard key={repo.fullName} repo={repo} index={i} lang={lang} />
                ))}
              </div>
            </div>
          )}

          {publicRepos.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 font-mono text-sm font-semibold text-muted-foreground">
                {lang === "es" ? "Repos públicos" : "Public repos"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {publicRepos.map((repo, i) => (
                  <RepoCard key={repo.fullName} repo={repo} index={i} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
