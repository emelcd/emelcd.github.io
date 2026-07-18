import { usePreferences } from "@/context/preferences"
import { Reveal } from "@/components/Reveal"
import { SectionHeader } from "@/components/SectionHeader"
import { ArrowUpRightIcon } from "@/lib/icons"

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

function formatDate(iso: string, lang: "es" | "en") {
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export function Activity() {
  const { t, palette, github, lang } = usePreferences()
  const repos = github
    ? Object.values(github.repos).sort(
        (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
      )
    : []

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
              <div className="grid grid-cols-3 gap-4 font-mono text-center text-xs sm:gap-6">
                <div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: palette[400] }}
                  >
                    {github.profile.publicRepos}
                  </p>
                  <p className="text-muted-foreground">
                    {lang === "es" ? "repos" : "repos"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: palette[400] }}
                  >
                    {github.profile.followers}
                  </p>
                  <p className="text-muted-foreground">
                    {lang === "es" ? "seguidores" : "followers"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: palette[400] }}
                  >
                    {repos.reduce((sum, repo) => sum + repo.stars, 0)}
                  </p>
                  <p className="text-muted-foreground">stars</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {repos.map((repo, i) => (
              <Reveal
                key={repo.fullName}
                delay={120 + i * 60}
                className="surface group flex flex-col rounded-2xl border border-border/80 p-6"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-mono text-base font-semibold">
                    {repo.name}
                  </h3>
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={repo.fullName}
                    className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
                  >
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </a>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {repo.description ||
                    (lang === "es" ? "Sin descripción." : "No description.")}
                </p>
                <div className="mb-3 flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
                  <span className="rounded-md border border-border/80 bg-background px-2 py-0.5">
                    ★ {formatStars(repo.stars)}
                  </span>
                  {repo.forks > 0 && (
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
            ))}
          </div>
        </>
      )}
    </section>
  )
}
