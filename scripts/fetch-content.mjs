import { writeFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const API_URL = process.env.VITE_API_URL || process.env.BACKEND_API_URL || "https://emelcd-backend.vercel.app"
const OUT_FILE = resolve(__dirname, "../src/lib/content-data.json")

console.log(`Fetching latest CV data from ${API_URL}/api/cv ...`)

try {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 8000)

  const res = await fetch(`${API_URL}/api/cv`, { signal: controller.signal })
  clearTimeout(id)

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const data = await res.json()

  // Basic validation to verify data structure
  if (!data.es || !data.en) {
    throw new Error("Invalid data format received from API: missing 'es' or 'en' root keys")
  }

  writeFileSync(OUT_FILE, JSON.stringify(data, null, 2))
  console.log(`Successfully updated: ${OUT_FILE}`)
} catch (err) {
  console.warn(`\n[WARNING] Failed to fetch latest content from API: ${err.message}`)
  if (existsSync(OUT_FILE)) {
    console.log(`Using existing local fallback: ${OUT_FILE}\n`)
  } else {
    console.error(`[ERROR] No fallback data found at ${OUT_FILE}. Build will fail.`)
    process.exit(1)
  }
}
