# CLAUDE.md

Guidance for working in this repository.

## What this is

Personal portfolio site for Miguel López (`emelcd`), served at
**https://emelcd.github.io** via GitHub Pages. Single-page React app; all
visible copy is data-driven and bilingual (ES/EN).

This repo is the **frontend**. Its content comes from a separate **backend**
repo/service:

- Backend repo: `/home/malopez/emelcd.backend` (Node + Vercel serverless).
- Backend API: **https://emelcdbackend.vercel.app/api/cv** → returns
  `{ es: { portfolio, resume }, en: { portfolio, resume } }`.
- Source of truth for all CV content: `data/cv.json` in the backend repo.

## Tech stack

- **Vite 8** + **React 19** + **TypeScript**, package manager **Bun**.
- **Tailwind CSS v4** (via `@tailwindcss/vite`), shadcn-style components built on
  **`@base-ui/react`** (see `src/components/ui/`).
- Linter: **oxlint**. Fonts: Geist / Geist Mono via `@fontsource-variable`.
- Path alias: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig`).

## Commands

```bash
bun install
bun run dev            # Vite dev server
bun run fetch-content  # pull latest CV from backend into src/lib/content-data.json
bun run push-content   # dry run: diff content-data.json vs live /api/cv (--yes to push)
bun run resume         # HTML→PDF via Chrome headless → public/resume.pdf + resume-en.pdf
bun run build          # tsc -b && vite build → dist/
bun run preview        # serve dist/ locally (port 4173)
bun run lint           # oxlint
```

## Content architecture (important)

Content flows from the backend into the UI **two ways**, by design:

1. **Build time** — `scripts/fetch-content.mjs` fetches `/api/cv` and writes
   `src/lib/content-data.json`, which Vite bakes into the bundle. Runs in CI
   before `build` (see workflow). If the API is unreachable it **falls back** to
   the committed JSON, so builds never fail on a backend outage.
2. **Runtime** — `src/lib/content.ts` exports `fetchContent()`, which the
   `PreferencesProvider` (`src/context/preferences.tsx`) calls on mount. It
   renders the baked JSON first (instant paint), then swaps in fresh data from
   the API. So **editing the backend updates the live site without a rebuild**.

Consequence: site copy lives in the backend (`data/cv.json`). To change it from
here: `bun run fetch-content` (start from live data, so edits made in `/admin`
aren't lost) → edit `src/lib/content-data.json` → `bun run push-content` (dry
run lists changed paths) → `bun run push-content --yes`. That POSTs to
`/api/admin`, which commits `data/cv.json` in the backend repo; the live site
updates after the Vercel redeploy (~1 min). Password: `CV_ADMIN_PASSWORD` env var
or `.env.local` (gitignored — never commit it).

### Data → UI wiring

- `src/lib/content.ts` — types (`Content`, `Lang`, `Accent`), the baked
  `CONTENT`, `fetchContent()`, `ACCENTS`/theme palettes, and `SOCIAL_LINKS`.
- `src/context/preferences.tsx` — single source of runtime state: active
  language, theme (dark), accent color, and the current content bundle. Every
  component reads content via `usePreferences().t` (the localized bundle for the
  active lang). Add new fields to the `Content` type here.
- `src/components/sections/*` — one component per page section (`Hero`, `About`,
  `Experience`, `Skills`, `Projects`, `Education`, `Contact`, `Footer`),
  composed in `src/App.tsx`.

## Conventions

- **No hardcoded copy in components** — read it from `t` so ES/EN stay in sync.
  (Exception that exists today: the terminal card `out` strings in
  `src/components/TerminalCard.tsx` are hardcoded decoration, not `t`.)
- The résumé PDFs in `public/` (`resume.pdf`, `resume-en.pdf`) are generated
  by `bun run resume` (`scripts/build-resume.mjs`: renders `*.resume` from the
  content JSON to HTML, then Chrome headless `--print-to-pdf`). Requires
  Chrome/Chromium locally (`CHROME_PATH` override optional). Not part of CI.
  After editing resume data in the backend: `bun run fetch-content && bun run resume`.
- Match the existing component style: functional components, `@/` imports,
  Tailwind classes, base-ui primitives.

## Deployment

- **Frontend deploys to GitHub Pages** via `.github/workflows/static.yml` on push
  to `main` (or manual dispatch): checkout → Bun → `fetch-content` →
  `bun run build` → upload `dist/` → `actions/deploy-pages`. This is the only
  deploy target for this repo — it does **not** deploy to Vercel.
- The backend (Vercel) is only the data source; it is deployed from its own repo.

## Secrets

No API keys live in this repo or the shipped bundle. `/api/cv` is public,
credential-free data (CORS `*`). This was a deliberate design goal: nothing
secret is ever exposed to the browser.
