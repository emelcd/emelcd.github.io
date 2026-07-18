import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CvPayload } from "@/lib/content"
import { cn } from "@/lib/utils"

import {
  clone,
  getAt,
  isObject,
  isScalar,
  JsonValueEditor,
  type FormPath,
  type JsonValue,
  type SyncListControls,
} from "./json-form"
import { fieldLabel, type AdminMode, type SectionDef } from "./sections"

type Lang = "es" | "en"

const LANGS: Lang[] = ["es", "en"]

type BilingualSectionProps = {
  data: CvPayload
  mode: AdminMode
  section: SectionDef
  onChange: (path: FormPath, value: JsonValue) => void
  onSyncListChange: (relativePath: string, esValue: JsonValue[], enValue: JsonValue[]) => void
}

function basePath(lang: Lang, mode: AdminMode, relativePath: string): FormPath {
  return [lang, mode, relativePath]
}

function isObjectArray(value: JsonValue | undefined): value is JsonValue[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => isObject(item))
}

function isEmptyObjectArray(value: JsonValue | undefined): value is JsonValue[] {
  return Array.isArray(value) && value.length === 0
}

function needsSyncList(esValue: JsonValue | undefined, enValue: JsonValue | undefined) {
  if (isObjectArray(esValue) || isObjectArray(enValue)) return true
  if (isEmptyObjectArray(esValue) && isEmptyObjectArray(enValue)) return true
  if (isEmptyObjectArray(esValue) && isObjectArray(enValue)) return true
  if (isObjectArray(esValue) && isEmptyObjectArray(enValue)) return true
  return false
}

function LangColumn({
  lang,
  mode,
  relativePath,
  data,
  onChange,
  syncListControls,
}: {
  lang: Lang
  mode: AdminMode
  relativePath: string
  data: CvPayload
  onChange: (path: FormPath, value: JsonValue) => void
  syncListControls?: SyncListControls
}) {
  const root = data as JsonValue
  const path = basePath(lang, mode, relativePath)
  const value = getAt(root, path)

  if (value === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Campo <code className="font-mono text-xs">{relativePath}</code> no encontrado.
      </p>
    )
  }

  return (
    <JsonValueEditor
      compact
      path={path}
      rootKey={relativePath}
      syncListControls={syncListControls}
      value={value}
      onChange={onChange}
    />
  )
}

function BilingualField({
  data,
  mode,
  relativePath,
  onChange,
  onSyncListChange,
}: {
  data: CvPayload
  mode: AdminMode
  relativePath: string
  onChange: (path: FormPath, value: JsonValue) => void
  onSyncListChange: (relativePath: string, esValue: JsonValue[], enValue: JsonValue[]) => void
}) {
  const root = data as JsonValue
  const esValue = getAt(root, basePath("es", mode, relativePath))
  const enValue = getAt(root, basePath("en", mode, relativePath))
  const label = fieldLabel(relativePath)
  const sync = needsSyncList(esValue, enValue)

  const syncListControls: SyncListControls | undefined = sync
    ? {
        onAdd: () => {
          const esArr = (Array.isArray(esValue) ? esValue : []) as JsonValue[]
          const enArr = (Array.isArray(enValue) ? enValue : []) as JsonValue[]
          const esTemplate = clone(esArr.at(-1) ?? enArr.at(-1) ?? {})
          const enTemplate = clone(enArr.at(-1) ?? esArr.at(-1) ?? {})
          onSyncListChange(relativePath, [...esArr, esTemplate], [...enArr, enTemplate])
        },
        onDuplicate: (index) => {
          const esArr = [...((Array.isArray(esValue) ? esValue : []) as JsonValue[])]
          const enArr = [...((Array.isArray(enValue) ? enValue : []) as JsonValue[])]
          esArr.splice(index + 1, 0, clone(esArr[index] ?? {}))
          enArr.splice(index + 1, 0, clone(enArr[index] ?? {}))
          onSyncListChange(relativePath, esArr, enArr)
        },
        onRemove: (index) => {
          const esArr = ((Array.isArray(esValue) ? esValue : []) as JsonValue[]).filter(
            (_, i) => i !== index,
          )
          const enArr = ((Array.isArray(enValue) ? enValue : []) as JsonValue[]).filter(
            (_, i) => i !== index,
          )
          onSyncListChange(relativePath, esArr, enArr)
        },
        onMove: (from, to) => {
          const esArr = [...((Array.isArray(esValue) ? esValue : []) as JsonValue[])]
          const enArr = [...((Array.isArray(enValue) ? enValue : []) as JsonValue[])]
          const move = <T,>(items: T[]) => {
            if (to < 0 || to >= items.length || from === to) return items
            const next = [...items]
            const [item] = next.splice(from, 1)
            next.splice(to, 0, item)
            return next
          }
          onSyncListChange(relativePath, move(esArr), move(enArr))
        },
      }
    : undefined

  const isScalarField =
    (esValue !== undefined && isScalar(esValue)) || (enValue !== undefined && isScalar(enValue))

  if (isScalarField) {
    return (
      <div className="col-span-full grid gap-4 lg:grid-cols-2">
        {LANGS.map((lang) => (
          <div className="min-w-0" key={lang}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {lang}
            </p>
            <LangColumn
              data={data}
              lang={lang}
              mode={mode}
              relativePath={relativePath}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        {!sync && (
          <CardDescription>Edita cada idioma por separado.</CardDescription>
        )}
        {sync && (
          <CardDescription>
            Añadir, duplicar, eliminar y reordenar afecta a ES y EN a la vez.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        {LANGS.map((lang) => (
          <div className="min-w-0" key={lang}>
            <p
              className={cn(
                "mb-3 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                lang === "es" && "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300",
                lang === "en" && "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
              )}
            >
              {lang}
            </p>
            <LangColumn
              data={data}
              lang={lang}
              mode={mode}
              relativePath={relativePath}
              syncListControls={syncListControls}
              onChange={onChange}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function BilingualSection({
  data,
  mode,
  section,
  onChange,
  onSyncListChange,
}: BilingualSectionProps) {
  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-lg font-semibold">{section.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "portfolio" ? "Contenido del sitio" : "Contenido del PDF"} ·{" "}
          {section.paths.length} campo{section.paths.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4">
        {section.paths.map((relativePath) => (
          <BilingualField
            data={data}
            key={relativePath}
            mode={mode}
            relativePath={relativePath}
            onChange={onChange}
            onSyncListChange={onSyncListChange}
          />
        ))}
      </div>
    </div>
  )
}
