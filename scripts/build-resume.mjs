// Generates the bilingual résumé HTML (ES/EN) that is printed to PDF.
// Usage: node scripts/build-resume.mjs <outDir>
// Writes <outDir>/resume-es.html and <outDir>/resume-en.html
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const outDir = process.argv[2] || "."

const contentData = JSON.parse(
  readFileSync(new URL("../src/lib/content-data.json", import.meta.url), "utf8")
)
const DATA = {
  es: contentData.es.resume,
  en: contentData.en.resume,
}

const STYLES = `
  :root {
    --ink:#15171c; --muted:#5b6270; --soft:#3a404a;
    --line:#e4e7eb; --accent:#2b6cb0; --accent-2:#4299E1;
    --accent-light:#eaf2fb; --bg-soft:#f7f8fa;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size:A4; margin:0; }
  html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { font-family:"Helvetica Neue",Arial,"Segoe UI",Roboto,sans-serif; color:var(--ink); }
  .page { width:210mm; height:297mm; padding:14mm 15mm; display:flex; flex-direction:column; }
  a { color:var(--accent); text-decoration:none; }

  header { display:flex; justify-content:space-between; align-items:flex-start;
    padding-bottom:12px; border-bottom:2px solid var(--ink); margin-bottom:13px; }
  .name { font-size:29px; font-weight:800; letter-spacing:-0.5px; line-height:1.02; }
  .name span { color:var(--accent); }
  .role { margin-top:3px; font-size:11px; color:var(--muted); font-weight:600; }
  .right { display:flex; gap:13px; align-items:flex-start; }
  .contact { text-align:right; font-size:9px; color:var(--muted); line-height:1.55; margin-top:6px; }
  .logo { width:40px; height:40px; border-radius:9px; flex-shrink:0;
    background:linear-gradient(135deg,#4299E1,#2C5282); display:flex; align-items:center; justify-content:center; }
  .logo svg { width:25px; height:25px; }

  .body { display:grid; grid-template-columns:1fr 60mm; gap:18px; flex:1; min-height:0; }
  aside { border-left:1px solid var(--line); padding-left:16px;
    display:flex; flex-direction:column; justify-content:space-between; }
  aside .sec { margin-bottom:0; }

  .sec { margin-bottom:15px; }
  .sec:last-child { margin-bottom:0; }
  .sec-title { font-size:8px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase;
    color:var(--accent); margin-bottom:9px; display:flex; align-items:center; gap:5px; }
  .sec-title::before { content:"›"; font-size:12px; line-height:1; font-weight:800; }

  .lead { color:var(--soft); font-size:9.9px; line-height:1.6; }

  .job { margin-bottom:13px; }
  .job:last-child { margin-bottom:0; }
  .job-top { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
  .job-title { font-size:11px; font-weight:700; }
  .job-period { font-size:8.4px; color:var(--muted); white-space:nowrap; font-weight:600;
    font-family:"SF Mono","JetBrains Mono",Consolas,ui-monospace,monospace; }
  .job-company { color:var(--accent); font-weight:600; font-size:9.4px; margin:1px 0 4px; }
  .job-company .loc { color:var(--muted); font-weight:500; }
  ul.bul { list-style:none; }
  ul.bul li { position:relative; padding-left:11px; font-size:9.5px; line-height:1.5; color:var(--soft); margin-bottom:2.5px; }
  ul.bul li::before { content:""; position:absolute; left:0; top:5.5px; width:3.5px; height:3.5px;
    border-radius:1px; background:var(--accent-2); transform:rotate(45deg); }
  .chips { margin-top:4px; display:flex; flex-wrap:wrap; gap:3.5px; }
  .chip { font-size:7.6px; padding:1px 5.5px; border:1px solid var(--line); border-radius:4px;
    color:var(--muted); background:var(--bg-soft);
    font-family:"SF Mono",Consolas,ui-monospace,monospace; }

  .proj { margin-bottom:9.5px; }
  .proj:last-child { margin-bottom:0; }
  .proj-name { font-size:9.9px; font-weight:700; }
  .proj-desc { font-size:9.2px; color:var(--soft); line-height:1.48; margin-top:1.5px; }
  .proj-tags { font-size:7.8px; color:var(--accent); font-weight:600; margin-top:2px;
    font-family:"SF Mono",Consolas,ui-monospace,monospace; }

  .skill-cat { margin-bottom:9px; }
  .skill-cat h4 { font-size:9.2px; font-weight:700; margin-bottom:3.5px; }
  .tags { display:flex; flex-wrap:wrap; gap:3px; }
  .tag { font-size:7.6px; padding:1.5px 6px; border-radius:4px;
    background:var(--accent-light); color:var(--accent); font-weight:600; }

  .methods { display:flex; flex-wrap:wrap; gap:3px; }
  .method { font-size:8px; padding:1.5px 6px; border-radius:4px; border:1px solid var(--line);
    color:var(--soft); background:#fff; }

  .rowitem { margin-bottom:7px; }
  .rowitem:last-child { margin-bottom:0; }
  .rowitem .t { font-size:9.2px; font-weight:600; line-height:1.3; }
  .rowitem .s { font-size:8.2px; color:var(--muted); }
  .rowitem .s b { color:var(--accent); font-weight:700;
    font-family:"SF Mono",Consolas,ui-monospace,monospace; }

  .lang-row { display:flex; justify-content:space-between; font-size:9px; margin-bottom:3.5px; }
  .lang-row .lvl { color:var(--muted); }
`

const LOGO = `<svg viewBox="0 0 32 32" fill="none"><path d="M9 10.5 15 16l-6 5.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="16.5" y="20.4" width="7" height="2.6" rx="1.3" fill="#fff"/></svg>`

function render(d) {
  const L = d.labels
  return `<!doctype html><html lang="${d.lang}"><head><meta charset="utf-8">
<title>${d.name} ${d.surname} — CV</title><style>${STYLES}</style></head><body>
<div class="page">
  <header>
    <div>
      <div class="name">${d.name} <span>${d.surname}</span></div>
      <div class="role">${d.role}</div>
    </div>
    <div class="right">
      <div class="contact">
        <div><a href="mailto:${d.contact.email}">${d.contact.email}</a></div>
        <div><a href="https://${d.contact.github}">${d.contact.github}</a></div>
        <div><a href="https://${d.contact.linkedin}">${d.contact.linkedin}</a></div>
        <div>${d.contact.location}</div>
      </div>
      <div class="logo">${LOGO}</div>
    </div>
  </header>

  <div class="body">
    <main>
      <div class="sec">
        <div class="sec-title">${L.profile}</div>
        <p class="lead">${d.summary}</p>
      </div>

      <div class="sec">
        <div class="sec-title">${L.experience}</div>
        ${d.experience
          .map(
            (j) => `<div class="job">
          <div class="job-top"><div class="job-title">${j.title}</div><div class="job-period">${j.period}</div></div>
          <div class="job-company">${j.company} <span class="loc">· ${j.location}</span></div>
          <ul class="bul">${j.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
          <div class="chips">${j.stack.map((s) => `<span class="chip">${s}</span>`).join("")}</div>
        </div>`,
          )
          .join("")}
      </div>

      <div class="sec">
        <div class="sec-title">${L.projects}</div>
        ${d.projects
          .map(
            (p) => `<div class="proj">
          <div class="proj-name">${p.name}</div>
          <div class="proj-desc">${p.desc}</div>
          <div class="proj-tags">${p.tags.join("  ·  ")}</div>
        </div>`,
          )
          .join("")}
      </div>
    </main>

    <aside>
      <div class="sec">
        <div class="sec-title">${L.stack}</div>
        ${d.skills
          .map(
            (s) => `<div class="skill-cat"><h4>${s.cat}</h4>
          <div class="tags">${s.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div></div>`,
          )
          .join("")}
      </div>

      <div class="sec">
        <div class="sec-title">${L.methods}</div>
        <div class="methods">${d.methods.map((m) => `<span class="method">${m}</span>`).join("")}</div>
      </div>

      <div class="sec">
        <div class="sec-title">${L.certs}</div>
        ${d.certs
          .map(
            (c) => `<div class="rowitem"><div class="t">${c.name}</div>
          <div class="s">${c.org} · <b>${c.year}</b></div></div>`,
          )
          .join("")}
      </div>

      <div class="sec">
        <div class="sec-title">${L.education}</div>
        ${d.education
          .map(
            (e) => `<div class="rowitem"><div class="t">${e.deg}</div>
          <div class="s">${e.inst} · <b>${e.year}</b></div></div>`,
          )
          .join("")}
      </div>

      <div class="sec">
        <div class="sec-title">${L.strengths}</div>
        <div class="methods">${d.strengths.map((s) => `<span class="method">${s}</span>`).join("")}</div>
      </div>

      <div class="sec">
        <div class="sec-title">${L.languages}</div>
        ${d.languages
          .map(
            (l) => `<div class="lang-row"><span>${l.name}</span><span class="lvl">${l.level}</span></div>`,
          )
          .join("")}
      </div>

      <div class="sec">
        <div class="sec-title">${L.interests}</div>
        <div class="methods">${d.interests.map((s) => `<span class="method">${s}</span>`).join("")}</div>
      </div>
    </aside>
  </div>
</div>
</body></html>`
}

for (const key of ["es", "en"]) {
  const file = resolve(outDir, `resume-${key}.html`)
  writeFileSync(file, render(DATA[key]))
  console.log("wrote", file)
}
