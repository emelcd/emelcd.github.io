import { useEffect, useMemo, useState } from "react"

import { BilingualSection } from "@/components/admin/BilingualSection"
import { clone, setAt, type FormPath, type JsonValue } from "@/components/admin/json-form"
import { getMode, MODES, type AdminMode } from "@/components/admin/sections"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchCvPayload, saveCvPayload, type CvPayload } from "@/lib/content"
import { cn } from "@/lib/utils"

type Status = {
  message: string
  tone: "muted" | "ok" | "err"
}

type Toast = {
  id: number
  message: string
  tone: "ok" | "err"
}

export function AdminPage() {
  const [password, setPassword] = useState("")
  const [data, setData] = useState<CvPayload | null>(null)
  const [jsonDraft, setJsonDraft] = useState("")
  const [savedSnapshot, setSavedSnapshot] = useState("")
  const [mode, setMode] = useState<AdminMode>("portfolio")
  const [activeSectionId, setActiveSectionId] = useState("identity")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [status, setStatus] = useState<Status>({
    message:
      "Edita por sección con ES y EN lado a lado. Guardar commitea data/cv.json y la web se actualiza tras el redeploy.",
    tone: "muted",
  })

  const modeDef = getMode(mode)
  const activeSection = useMemo(
    () => modeDef.sections.find((section) => section.id === activeSectionId) ?? modeDef.sections[0],
    [activeSectionId, modeDef.sections],
  )

  const dirty = useMemo(
    () => Boolean(data && jsonDraft && jsonDraft !== savedSnapshot),
    [data, jsonDraft, savedSnapshot],
  )

  async function load(force = false) {
    if (dirty && !force && !window.confirm("Hay cambios sin guardar. ¿Recargar y descartarlos?")) {
      return
    }

    setStatus({ message: "Cargando contenido actual...", tone: "muted" })
    try {
      const payload = await fetchCvPayload()
      const formatted = JSON.stringify(payload, null, 2)
      setData(payload)
      setJsonDraft(formatted)
      setSavedSnapshot(formatted)
      setStatus({ message: "Contenido cargado. Listo para editar.", tone: "ok" })
    } catch (err) {
      setStatus({
        message: `No se pudo cargar: ${err instanceof Error ? err.message : String(err)}`,
        tone: "err",
      })
    }
  }

  useEffect(() => {
    void load(true)
  }, [])

  useEffect(() => {
    const exists = modeDef.sections.some((section) => section.id === activeSectionId)
    if (!exists) setActiveSectionId(modeDef.sections[0]?.id ?? "identity")
  }, [activeSectionId, modeDef.sections])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function showToast(message: string, tone: Toast["tone"]) {
    setToast({ id: Date.now(), message, tone })
  }

  function patchData(mutator: (draft: CvPayload) => void) {
    setData((current) => {
      if (!current) return current
      const next = clone(current as JsonValue) as CvPayload
      mutator(next)
      setJsonDraft(JSON.stringify(next, null, 2))
      return next
    })
  }

  function updateData(path: FormPath, value: JsonValue) {
    patchData((draft) => setAt(draft as JsonValue, path, value))
  }

  function syncListChange(relativePath: string, esValue: JsonValue[], enValue: JsonValue[]) {
    patchData((draft) => {
      setAt(draft as JsonValue, ["es", mode, relativePath], esValue)
      setAt(draft as JsonValue, ["en", mode, relativePath], enValue)
    })
  }

  function applyJsonDraft() {
    try {
      const parsed = JSON.parse(jsonDraft) as CvPayload
      if (!parsed?.es?.portfolio || !parsed?.en?.portfolio) {
        throw new Error("Falta es.portfolio o en.portfolio.")
      }
      const formatted = JSON.stringify(parsed, null, 2)
      setData(parsed)
      setJsonDraft(formatted)
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
      setStatus({ message, tone: "err" })
      showToast(message, "err")
      return
    }

    setSaving(true)
    setStatus({ message: "Guardando y commiteando...", tone: "muted" })
    try {
      const out = await saveCvPayload(password, payload)
      const formatted = JSON.stringify(payload, null, 2)
      setData(payload)
      setJsonDraft(formatted)
      setSavedSnapshot(formatted)
      const message = `Guardado. Commit ${(out.commit || "").slice(0, 7)}. Redesplegando (~20s)...`
      setStatus({ message, tone: "ok" })
      showToast(message, "ok")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus({ message, tone: "err" })
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
          <h1 className="font-mono text-sm font-semibold">Editor CV bilingüe</h1>
          <span className="font-mono text-xs text-muted-foreground">emelcd.github.io/admin</span>
          {dirty && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
              Cambios sin guardar
            </span>
          )}
          <a
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-auto")}
          >
            ← Volver al sitio
          </a>
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
          <Button variant="outline" onClick={() => void load()}>
            Recargar actual
          </Button>
          <Button disabled={saving || !data} onClick={save}>
            {saving ? "Guardando..." : dirty ? "Guardar cambios" : "Guardar"}
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {MODES.map((modeOption) => (
            <Button
              key={modeOption.id}
              size="sm"
              variant={mode === modeOption.id ? "secondary" : "outline"}
              onClick={() => setMode(modeOption.id)}
            >
              {modeOption.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Secciones" className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
            {modeDef.sections.map((section) => (
              <Button
                className="justify-start lg:w-full"
                key={section.id}
                size="sm"
                variant={activeSection?.id === section.id ? "secondary" : "ghost"}
                onClick={() => setActiveSectionId(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </nav>

          <section>
            {data && activeSection ? (
              <BilingualSection
                data={data}
                mode={mode}
                section={activeSection}
                onChange={updateData}
                onSyncListChange={syncListChange}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-sm text-muted-foreground">
                  Cargando formulario...
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        <details className="mt-8 rounded-xl border bg-card p-4">
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
