import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchCvPayload, saveCvPayload, type CvPayload } from "@/lib/content"
import { cn } from "@/lib/utils"

type JsonPrimitive = string | number | boolean | null
type JsonObject = { [key: string]: JsonValue }
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
type FormPath = Array<string | number>

type AdminSection = {
  label: string
  path: FormPath
}

type Status = {
  message: string
  tone: "muted" | "ok" | "err"
}

type Toast = {
  id: number
  message: string
  tone: "ok" | "err"
}

const SECTIONS: AdminSection[] = [
  { label: "ES · Portfolio", path: ["es", "portfolio"] },
  { label: "ES · Resume", path: ["es", "resume"] },
  { label: "EN · Portfolio", path: ["en", "portfolio"] },
  { label: "EN · Resume", path: ["en", "resume"] },
]

function isObject(value: JsonValue | undefined): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function isScalar(value: JsonValue): value is JsonPrimitive {
  return value === null || ["string", "number", "boolean"].includes(typeof value)
}

function clone<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function labelize(key: string | number) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
}

function getAt(root: JsonValue, path: FormPath): JsonValue | undefined {
  return path.reduce<JsonValue | undefined>((value, key) => {
    if (!value || typeof value !== "object") return undefined
    return (value as JsonObject | JsonValue[])[key as never]
  }, root)
}

function setAt(root: JsonValue, path: FormPath, value: JsonValue) {
  const parent = getAt(root, path.slice(0, -1))
  const last = path[path.length - 1]
  if (Array.isArray(parent) && typeof last === "number") parent[last] = value
  if (isObject(parent) && typeof last === "string") parent[last] = value
}

function coerce(value: string | boolean, type: string): JsonPrimitive {
  if (type === "number") return Number(value)
  if (type === "boolean") return value === true || value === "true"
  return String(value)
}

function scalarType(value: JsonPrimitive) {
  if (value === null) return "string"
  return typeof value
}

function fieldChrome(path: FormPath) {
  return (
    <span className="font-mono text-[11px] text-muted-foreground">
      {path.join(".")}
    </span>
  )
}

export function AdminPage() {
  const [password, setPassword] = useState("")
  const [data, setData] = useState<CvPayload | null>(null)
  const [active, setActive] = useState(0)
  const [jsonDraft, setJsonDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [status, setStatus] = useState<Status>({
    message:
      "Editas y pulsas Guardar: se commitea data/cv.json y la web se actualiza tras el redeploy.",
    tone: "muted",
  })

  const root = data as JsonValue | null
  const currentSection = SECTIONS[active]
  const currentValue = useMemo(
    () => (root ? getAt(root, currentSection.path) : undefined),
    [currentSection.path, root],
  )

  async function load() {
    setStatus({ message: "Cargando contenido actual...", tone: "muted" })
    try {
      const payload = await fetchCvPayload()
      setData(payload)
      setJsonDraft(JSON.stringify(payload, null, 2))
      setStatus({ message: "Contenido cargado. Listo para editar.", tone: "ok" })
    } catch (err) {
      setStatus({
        message: `No se pudo cargar: ${err instanceof Error ? err.message : String(err)}`,
        tone: "err",
      })
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function showToast(message: string, tone: Toast["tone"]) {
    setToast({ id: Date.now(), message, tone })
  }

  function updateData(path: FormPath, value: JsonValue) {
    setData((current) => {
      if (!current) return current
      const next = clone(current as JsonValue) as CvPayload
      setAt(next as JsonValue, path, value)
      setJsonDraft(JSON.stringify(next, null, 2))
      return next
    })
  }

  function renderScalar(path: FormPath, key: string | number, value: JsonPrimitive) {
    const type = scalarType(value)
    const label = labelize(key)
    const longText = typeof value === "string" && (value.length > 90 || value.includes("\n"))

    if (type === "boolean") {
      return (
        <label className="flex items-center gap-3 rounded-lg border bg-background/60 px-3 py-2 text-sm">
          <input
            checked={Boolean(value)}
            className="size-4 accent-(--accent-400)"
            type="checkbox"
            onChange={(event) => updateData(path, event.target.checked)}
          />
          <span className="flex flex-col">
            <span className="font-medium">{label}</span>
            {fieldChrome(path)}
          </span>
        </label>
      )
    }

    return (
      <label className={cn("flex flex-col gap-1.5", longText && "md:col-span-2")}>
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        {longText ? (
          <textarea
            className="min-h-24 rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition focus:border-(--accent-400) focus:ring-3 focus:ring-[color-mix(in_oklch,var(--accent-400)_18%,transparent)]"
            value={String(value ?? "")}
            onChange={(event) => updateData(path, coerce(event.target.value, type))}
          />
        ) : (
          <input
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-(--accent-400) focus:ring-3 focus:ring-[color-mix(in_oklch,var(--accent-400)_18%,transparent)]"
            value={String(value ?? "")}
            onChange={(event) => updateData(path, coerce(event.target.value, type))}
          />
        )}
        {fieldChrome(path)}
      </label>
    )
  }

  function renderArray(path: FormPath, key: string | number, value: JsonValue[]) {
    const allScalar = value.every(isScalar)

    if (allScalar) {
      const sample = value.find((item) => item !== null)
      const type = sample === undefined ? "string" : typeof sample
      return (
        <Card className="md:col-span-2" key={path.join(".")}>
          <CardHeader>
            <CardTitle>{labelize(key)}</CardTitle>
            <CardDescription>Una línea por elemento.</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm outline-none transition focus:border-(--accent-400) focus:ring-3 focus:ring-[color-mix(in_oklch,var(--accent-400)_18%,transparent)]"
              value={value.map(String).join("\n")}
              onChange={(event) => {
                const next = event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item) => coerce(item, type))
                updateData(path, next)
              }}
            />
            <div className="mt-2">{fieldChrome(path)}</div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="md:col-span-2" key={path.join(".")}>
        <CardHeader>
          <CardTitle>{labelize(key)}</CardTitle>
          <CardDescription>{fieldChrome(path)}</CardDescription>
          <CardAction>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateData(path, [...value, clone(value.at(-1) ?? {})])}
            >
              Añadir
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3">
          {value.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Lista vacía.
            </div>
          ) : (
            value.map((item, index) => (
              <div className="rounded-xl border bg-background/60 p-3" key={index}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{index + 1}</span>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        const next = [...value]
                        next.splice(index + 1, 0, clone(item))
                        updateData(path, next)
                      }}
                    >
                      Duplicar
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => updateData(path, value.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
                {renderValue(path.concat(index), `Elemento ${index + 1}`, item, true)}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    )
  }

  function renderObject(path: FormPath, key: string | number, value: JsonObject, embedded = false) {
    const fields = Object.entries(value).map(([childKey, childValue]) =>
      renderValue(path.concat(childKey), childKey, childValue),
    )

    if (embedded) {
      return <div className="grid gap-3 md:grid-cols-2">{fields}</div>
    }

    return (
      <Card className="md:col-span-2" key={path.join(".")}>
        <CardHeader>
          <CardTitle>{labelize(key)}</CardTitle>
          <CardDescription>{fieldChrome(path)}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">{fields}</CardContent>
      </Card>
    )
  }

  function renderValue(path: FormPath, key: string | number, value: JsonValue, embedded = false) {
    if (Array.isArray(value)) return renderArray(path, key, value)
    if (isObject(value)) return renderObject(path, key, value, embedded)
    return <div key={path.join(".")}>{renderScalar(path, key, value)}</div>
  }

  function applyJsonDraft() {
    try {
      const parsed = JSON.parse(jsonDraft) as CvPayload
      if (!parsed?.es?.portfolio || !parsed?.en?.portfolio) {
        throw new Error("Falta es.portfolio o en.portfolio.")
      }
      setData(parsed)
      setJsonDraft(JSON.stringify(parsed, null, 2))
      setStatus({ message: "JSON aplicado al formulario.", tone: "ok" })
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "err",
      })
    }
  }

  async function save() {
    if (!password) {
      const message = "Introduce la contraseña."
      setStatus({ message, tone: "err" })
      showToast(message, "err")
      return
    }

    let payload = data
    try {
      payload = JSON.parse(jsonDraft) as CvPayload
      if (!payload?.es?.portfolio || !payload?.en?.portfolio) {
        throw new Error("Falta es.portfolio o en.portfolio.")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus({
        message,
        tone: "err",
      })
      showToast(message, "err")
      return
    }

    setSaving(true)
    setStatus({ message: "Guardando y commiteando...", tone: "muted" })
    try {
      const out = await saveCvPayload(password, payload)
      setData(payload)
      const message = `Guardado. Commit ${(out.commit || "").slice(0, 7)}. Redesplegando (~20s)...`
      setStatus({
        message,
        tone: "ok",
      })
      showToast(message, "ok")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus({
        message,
        tone: "err",
      })
      showToast(message, "err")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {toast && (
        <div
          aria-live="polite"
          className={cn(
            "fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border bg-card p-4 text-sm shadow-2xl ring-1 ring-foreground/10",
            toast.tone === "ok" && "border-teal-500/40",
            toast.tone === "err" && "border-destructive/50",
          )}
          key={toast.id}
          role="status"
        >
          <span
            className={cn(
              "mt-1 size-2.5 shrink-0 rounded-full",
              toast.tone === "ok" && "bg-teal-500",
              toast.tone === "err" && "bg-destructive",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {toast.tone === "ok" ? "Guardado correctamente" : "No se pudo guardar"}
            </p>
            <p className="mt-1 wrap-break-word text-muted-foreground">{toast.message}</p>
          </div>
          <button
            aria-label="Cerrar notificación"
            className="rounded-md px-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            type="button"
            onClick={() => setToast(null)}
          >
            x
          </button>
        </div>
      )}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
          <span className="size-2.5 rounded-full bg-(--accent-400)" />
          <h1 className="font-mono text-sm font-semibold">cv.json form editor</h1>
          <span className="font-mono text-xs text-muted-foreground">emelcd.github.io/admin</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5">
        <div className="sticky top-0 z-10 -mx-4 mb-5 flex flex-wrap items-center gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur">
          <input
            autoComplete="current-password"
            className="min-w-56 flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-(--accent-400) focus:ring-3 focus:ring-[color-mix(in_oklch,var(--accent-400)_18%,transparent)]"
            placeholder="Contraseña de administración"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button variant="outline" onClick={load}>
            Recargar actual
          </Button>
          <Button disabled={saving || !data} onClick={save}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Edita el contenido desde el frontend. Las listas simples usan una línea por elemento; las
          listas de bloques permiten añadir, duplicar o eliminar entradas.
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {SECTIONS.map((section, index) => (
            <Button
              key={section.label}
              size="sm"
              variant={active === index ? "secondary" : "outline"}
              onClick={() => setActive(index)}
            >
              {section.label}
            </Button>
          ))}
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {data && currentValue ? (
            renderValue(currentSection.path, currentSection.label, currentValue)
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="py-8 text-sm text-muted-foreground">
                Cargando formulario...
              </CardContent>
            </Card>
          )}
        </section>

        <details className="mt-5 rounded-xl border bg-card p-4">
          <summary className="cursor-pointer font-medium">JSON avanzado</summary>
          <textarea
            className="mt-4 min-h-96 w-full resize-y rounded-lg border bg-background px-3 py-2 font-mono text-sm leading-relaxed outline-none transition focus:border-(--accent-400) focus:ring-3 focus:ring-[color-mix(in_oklch,var(--accent-400)_18%,transparent)]"
            spellCheck={false}
            value={jsonDraft}
            onChange={(event) => setJsonDraft(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={applyJsonDraft}>
              Aplicar JSON al formulario
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                try {
                  setJsonDraft(JSON.stringify(JSON.parse(jsonDraft), null, 2))
                  setStatus({ message: "JSON formateado.", tone: "ok" })
                } catch (err) {
                  setStatus({
                    message: err instanceof Error ? err.message : String(err),
                    tone: "err",
                  })
                }
              }}
            >
              Formatear JSON
            </Button>
          </div>
        </details>

        <div
          className={cn(
            "mt-4 min-h-5 whitespace-pre-wrap font-mono text-sm",
            status.tone === "ok" && "text-teal-500",
            status.tone === "err" && "text-destructive",
            status.tone === "muted" && "text-muted-foreground",
          )}
        >
          {status.message}
        </div>
      </main>
    </div>
  )
}
