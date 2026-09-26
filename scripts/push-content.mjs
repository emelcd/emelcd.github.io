// Push src/lib/content-data.json to the backend (POST /api/admin), the same
// endpoint the /admin editor uses. The backend commits it as data/cv.json, so
// the live site picks it up without a rebuild.
//
//   bun run push-content          # dry run: show what differs from the live API
//   bun run push-content --yes    # actually push
//
// Password: CV_ADMIN_PASSWORD env var, or a line `CV_ADMIN_PASSWORD=...` in
// .env.local (gitignored). Never commit it.
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const ROOT = resolve(__dirname, "..")
const API_URL = process.env.VITE_API_URL || process.env.BACKEND_API_URL || "https://emelcdbackend.vercel.app"
const IN_FILE = resolve(ROOT, "src/lib/content-data.json")
const apply = process.argv.includes("--yes")

function readPassword() {
  if (process.env.CV_ADMIN_PASSWORD) return process.env.CV_ADMIN_PASSWORD
  const envFile = resolve(ROOT, ".env.local")
  if (!existsSync(envFile)) return null
  const line = readFileSync(envFile, "utf8")
    .split("\n")
    .find((l) => l.startsWith("CV_ADMIN_PASSWORD="))
  return line ? line.slice("CV_ADMIN_PASSWORD=".length).trim().replace(/^["']|["']$/g, "") : null
}

/** List the JSON paths whose values differ between `a` and `b`. */
function diffPaths(a, b, path = "") {
  if (JSON.stringify(a) === JSON.stringify(b)) return []
  const bothObjects = a && b && typeof a === "object" && typeof b === "object"
  if (!bothObjects || Array.isArray(a) !== Array.isArray(b)) return [path || "(root)"]
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].flatMap((k) => diffPaths(a[k], b[k], path ? `${path}.${k}` : k))
}

const local = JSON.parse(readFileSync(IN_FILE, "utf8"))
if (!local.es?.portfolio || !local.en?.portfolio || !local.es?.resume || !local.en?.resume) {
  console.error("[ERROR] content-data.json must have es/en → portfolio + resume")
  process.exit(1)
}

const res = await fetch(`${API_URL}/api/cv`)
if (!res.ok) {
  console.error(`[ERROR] could not read live content: HTTP ${res.status}`)
  process.exit(1)
}
const remote = await res.json()

const changed = diffPaths(remote, local)
if (changed.length === 0) {
  console.log("Live content already matches content-data.json. Nothing to push.")
  process.exit(0)
}
console.log(`${changed.length} path(s) differ from ${API_URL}/api/cv:`)
for (const p of changed) console.log(`  - ${p}`)

if (!apply) {
  console.log("\nDry run. Re-run with --yes to push.")
  process.exit(0)
}

const password = readPassword()
if (!password) {
  console.error("\n[ERROR] set CV_ADMIN_PASSWORD (env var or .env.local)")
  process.exit(1)
}

const post = await fetch(`${API_URL}/api/admin`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password, data: local }),
})
const out = await post.json().catch(() => ({}))
if (!post.ok) {
  console.error(`\n[ERROR] push failed: ${out.error || `HTTP ${post.status}`}`)
  process.exit(1)
}
console.log(`\nPushed.${out.commit ? ` Backend commit: ${out.commit}` : ""}${out.url ? `\n${out.url}` : ""}`)
