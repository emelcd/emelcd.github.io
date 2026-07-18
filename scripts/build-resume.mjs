// Generates bilingual résumé PDFs (ES/EN) from content-data.json.
// Usage:
//   node scripts/build-resume.mjs              → public/resume.pdf + public/resume-en.pdf
//   node scripts/build-resume.mjs --html-only [outDir]
//   node scripts/build-resume.mjs [outDir]     → PDFs in outDir (default: public/)
import { spawnSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const PUBLIC = resolve(ROOT, "public")

const args = process.argv.slice(2).filter((a) => a !== "--")
const htmlOnly = args.includes("--html-only")
const outDirArg = args.find((a) => !a.startsWith("--"))
const outDir = resolve(outDirArg || (htmlOnly ? "." : PUBLIC))

const contentData = JSON.parse(
  readFileSync(resolve(ROOT, "src/lib/content-data.json"), "utf8"),
)
const DATA = {
  es: contentData.es.resume,
  en: contentData.en.resume,
}

const PDF_NAMES = { es: "resume.pdf", en: "resume-en.pdf" }

const STYLES = `
  :root {
    --ink: #111111;
    --muted: #666666;
    --soft: #333333;
    --line: #d8d8d8;
    --accent: #111111;
    --accent-2: #111111;
    --bg-soft: #f4f4f4;
    --mono: "IBM Plex Mono", "SF Mono", "Cascadia Mono", Consolas, ui-monospace, monospace;
    --sans: "IBM Plex Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: var(--sans);
    color: var(--ink);
    font-size: 9.5px;
    line-height: 1.45;
    background: #fff;
  }
  a { color: var(--ink); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .page {
    width: 210mm;
    height: 297mm;
    padding: 12.5mm 14mm 11mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 14px;
    align-items: end;
    padding-bottom: 10px;
    border-bottom: 2.5px solid var(--ink);
    margin-bottom: 12px;
  }
  .brand { min-width: 0; }
  .name {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.6px;
    line-height: 1.05;
  }
  .name span { color: var(--ink); }
  .role {
    margin-top: 3px;
    font-size: 10.5px;
    color: var(--muted);
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  .header-right {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .contact {
    text-align: right;
    font-size: 8.6px;
    color: var(--muted);
    line-height: 1.55;
    font-family: var(--mono);
  }
  .contact a { color: var(--soft); }
  .logo {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    flex-shrink: 0;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }
  .logo svg { width: 20px; height: 20px; }

  .body {
    display: grid;
    grid-template-columns: 1fr 58mm;
    gap: 16px;
    flex: 1;
    min-height: 0;
  }
  aside {
    border-left: 1px solid var(--line);
    padding-left: 14px;
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .sec { margin-bottom: 12px; }
  main .sec:last-child { margin-bottom: 0; }
  .sec-title {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: var(--ink);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
    padding-bottom: 3px;
    border-bottom: 1px solid var(--line);
  }
  .sec-title::before {
    content: "";
    width: 6px;
    height: 6px;
    background: var(--ink);
    border-radius: 1px;
    transform: rotate(45deg);
    flex-shrink: 0;
  }

  .lead {
    color: var(--soft);
    font-size: 9.4px;
    line-height: 1.55;
  }

  .job { margin-bottom: 10px; }
  .job:last-child { margin-bottom: 0; }
  .job-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .job-title { font-size: 10.4px; font-weight: 700; line-height: 1.25; }
  .job-period {
    font-size: 7.8px;
    color: var(--muted);
    white-space: nowrap;
    font-weight: 600;
    font-family: var(--mono);
  }
  .job-company {
    color: var(--ink);
    font-weight: 600;
    font-size: 9px;
    margin: 1px 0 3px;
  }
  .job-company .loc { color: var(--muted); font-weight: 500; }
  ul.bul { list-style: none; }
  ul.bul li {
    position: relative;
    padding-left: 10px;
    font-size: 9px;
    line-height: 1.45;
    color: var(--soft);
    margin-bottom: 2px;
  }
  ul.bul li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 5px;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--accent-2);
  }
  .stack-line {
    margin-top: 3px;
    font-size: 7.6px;
    color: var(--muted);
    font-family: var(--mono);
    letter-spacing: 0.01em;
  }

  .proj { margin-bottom: 7px; }
  .proj:last-child { margin-bottom: 0; }
  .proj-name { font-size: 9.5px; font-weight: 700; }
  .proj-desc {
    font-size: 8.7px;
    color: var(--soft);
    line-height: 1.42;
    margin-top: 1px;
  }
  .proj-tags {
    font-size: 7.4px;
    color: var(--muted);
    font-weight: 600;
    margin-top: 1.5px;
    font-family: var(--mono);
  }

  .skill-cat { margin-bottom: 7px; }
  .skill-cat:last-child { margin-bottom: 0; }
  .skill-cat h4 {
    font-size: 8.6px;
    font-weight: 700;
    margin-bottom: 1.5px;
    color: var(--ink);
  }
  .skill-tags {
    font-size: 7.8px;
    color: var(--soft);
    line-height: 1.4;
    font-family: var(--mono);
  }

  .pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  .pill {
    font-size: 7.5px;
    padding: 1.5px 5.5px;
    border-radius: 3px;
    border: 1px solid var(--line);
    color: var(--soft);
    background: var(--bg-soft);
    line-height: 1.3;
  }

  .rowitem { margin-bottom: 5.5px; }
  .rowitem:last-child { margin-bottom: 0; }
  .rowitem .t {
    font-size: 8.6px;
    font-weight: 600;
    line-height: 1.3;
  }
  .rowitem .meta {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    font-size: 7.6px;
    color: var(--muted);
    margin-top: 0.5px;
  }
  .rowitem .meta .year {
    color: var(--accent);
    font-weight: 700;
    font-family: var(--mono);
    white-space: nowrap;
  }

  .lang-row {
    display: flex;
    justify-content: space-between;
    font-size: 8.5px;
    margin-bottom: 2.5px;
  }
  .lang-row:last-child { margin-bottom: 0; }
  .lang-row .lvl { color: var(--muted); font-family: var(--mono); font-size: 7.8px; }
`

const LOGO = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M9 10.5 15 16l-6 5.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="16.5" y="20.4" width="7" height="2.6" rx="1.3" fill="#fff"/></svg>`

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function hrefUrl(raw) {
  const s = String(raw ?? "").trim()
  if (!s) return "#"
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s
  return `https://${s}`
}

function render(d) {
  const L = d.labels
  const email = esc(d.contact.email)
  const github = esc(d.contact.github)
  const linkedin = esc(d.contact.linkedin)
  const location = esc(d.contact.location)

  return `<!doctype html>
<html lang="${esc(d.lang)}">
<head>
<meta charset="utf-8">
<title>${esc(d.name)} ${esc(d.surname)} — CV</title>
<style>${STYLES}</style>
</head>
<body>
<div class="page">
  <header>
    <div class="brand">
      <div class="name">${esc(d.name)} <span>${esc(d.surname)}</span></div>
      <div class="role">${esc(d.role)}</div>
    </div>
    <div class="header-right">
      <div class="contact">
        <div><a href="mailto:${email}">${email}</a></div>
        <div><a href="${esc(hrefUrl(d.contact.github))}">${github}</a></div>
        <div><a href="${esc(hrefUrl(d.contact.linkedin))}">${linkedin}</a></div>
        <div>${location}</div>
      </div>
      <div class="logo">${LOGO}</div>
    </div>
  </header>

  <div class="body">
    <main>
      <section class="sec">
        <div class="sec-title">${esc(L.profile)}</div>
        <p class="lead">${esc(d.summary)}</p>
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.experience)}</div>
        ${d.experience
          .map(
            (j) => `<article class="job">
          <div class="job-top">
            <div class="job-title">${esc(j.title)}</div>
            <div class="job-period">${esc(j.period)}</div>
          </div>
          <div class="job-company">${esc(j.company)} <span class="loc">· ${esc(j.location)}</span></div>
          <ul class="bul">${j.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          <div class="stack-line">${j.stack.map(esc).join(" · ")}</div>
        </article>`,
          )
          .join("")}
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.projects)}</div>
        ${d.projects
          .map(
            (p) => `<article class="proj">
          <div class="proj-name">${esc(p.name)}</div>
          <div class="proj-desc">${esc(p.desc)}</div>
          <div class="proj-tags">${p.tags.map(esc).join(" · ")}</div>
        </article>`,
          )
          .join("")}
      </section>
    </main>

    <aside>
      <section class="sec">
        <div class="sec-title">${esc(L.stack)}</div>
        ${d.skills
          .map(
            (s) => `<div class="skill-cat">
          <h4>${esc(s.cat)}</h4>
          <div class="skill-tags">${s.tags.map(esc).join(" · ")}</div>
        </div>`,
          )
          .join("")}
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.methods)}</div>
        <div class="pill-row">${d.methods.map((m) => `<span class="pill">${esc(m)}</span>`).join("")}</div>
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.certs)}</div>
        ${d.certs
          .map(
            (c) => `<div class="rowitem">
          <div class="t">${esc(c.name)}</div>
          <div class="meta"><span>${esc(c.org)}</span><span class="year">${esc(c.year)}</span></div>
        </div>`,
          )
          .join("")}
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.education)}</div>
        ${d.education
          .map(
            (e) => `<div class="rowitem">
          <div class="t">${esc(e.deg)}</div>
          <div class="meta"><span>${esc(e.inst)}</span><span class="year">${esc(e.year)}</span></div>
        </div>`,
          )
          .join("")}
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.strengths)}</div>
        <div class="pill-row">${d.strengths.map((s) => `<span class="pill">${esc(s)}</span>`).join("")}</div>
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.languages)}</div>
        ${d.languages
          .map(
            (l) => `<div class="lang-row"><span>${esc(l.name)}</span><span class="lvl">${esc(l.level)}</span></div>`,
          )
          .join("")}
      </section>

      <section class="sec">
        <div class="sec-title">${esc(L.interests)}</div>
        <div class="pill-row">${d.interests.map((s) => `<span class="pill">${esc(s)}</span>`).join("")}</div>
      </section>
    </aside>
  </div>
</div>
</body>
</html>`
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "google-chrome",
    "chromium",
    "chromium-browser",
    "google-chrome-stable",
  ].filter(Boolean)

  for (const bin of candidates) {
    const probe = spawnSync(bin, ["--version"], { encoding: "utf8" })
    if (probe.status === 0) return bin
  }
  return null
}

function htmlToPdf(chrome, htmlPath, pdfPath) {
  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--disable-extensions",
      "--no-first-run",
      `--print-to-pdf=${pdfPath}`,
      htmlPath,
    ],
    { encoding: "utf8" },
  )
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim()
    throw new Error(
      `Chrome failed writing ${pdfPath} (exit ${result.status})${detail ? `: ${detail}` : ""}`,
    )
  }
}

function main() {
  mkdirSync(outDir, { recursive: true })

  if (htmlOnly) {
    for (const key of ["es", "en"]) {
      const file = resolve(outDir, `resume-${key}.html`)
      writeFileSync(file, render(DATA[key]))
      console.log("wrote", file)
    }
    return
  }

  const chrome = findChrome()
  if (!chrome) {
    console.error(
      "No Chrome/Chromium found. Install google-chrome or chromium, or set CHROME_PATH.",
    )
    process.exit(1)
  }

  const tmp = mkdtempSync(resolve(tmpdir(), "emelcd-resume-"))
  try {
    for (const key of ["es", "en"]) {
      const htmlPath = resolve(tmp, `resume-${key}.html`)
      const pdfPath = resolve(outDir, PDF_NAMES[key])
      writeFileSync(htmlPath, render(DATA[key]))
      htmlToPdf(chrome, htmlPath, pdfPath)
      console.log("wrote", pdfPath)
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

main()
