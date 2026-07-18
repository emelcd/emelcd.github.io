import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { fieldLabel } from "./sections"

export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export type FormPath = Array<string | number>

export function isObject(value: JsonValue | undefined): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

export function isScalar(value: JsonValue): value is JsonPrimitive {
  return value === null || ["string", "number", "boolean"].includes(typeof value)
}

export function clone<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function getAt(root: JsonValue, path: FormPath): JsonValue | undefined {
  return path.reduce<JsonValue | undefined>((value, key) => {
    if (!value || typeof value !== "object") return undefined
    return (value as JsonObject | JsonValue[])[key as never]
  }, root)
}

export function setAt(root: JsonValue, path: FormPath, value: JsonValue) {
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

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length || from === to) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

const inputClass =
  "rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-(--accent-400) focus:ring-3 focus:ring-[color-mix(in_oklch,var(--accent-400)_18%,transparent)]"

const textareaClass = cn(inputClass, "min-h-24 leading-relaxed")

type JsonValueEditorProps = {
  path: FormPath
  value: JsonValue
  onChange: (path: FormPath, value: JsonValue) => void
  /** Oculta el path técnico bajo el campo. */
  compact?: boolean
  /** Título raíz cuando el valor es objeto/array de primer nivel. */
  rootKey?: string | number
  embedded?: boolean
  /** Controles de lista sincronizada entre idiomas (solo arrays de objetos). */
  syncListControls?: SyncListControls
}

export type SyncListControls = {
  onAdd: () => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onMove: (from: number, to: number) => void
}

function ScalarField({
  path,
  fieldKey,
  value,
  onChange,
  compact,
}: {
  path: FormPath
  fieldKey: string | number
  value: JsonPrimitive
  onChange: (path: FormPath, value: JsonValue) => void
  compact?: boolean
}) {
  const type = scalarType(value)
  const label = fieldLabel(fieldKey)
  const longText = typeof value === "string" && (value.length > 90 || value.includes("\n"))

  if (type === "boolean") {
    return (
      <label className="flex items-center gap-3 rounded-lg border bg-background/60 px-3 py-2 text-sm">
        <input
          checked={Boolean(value)}
          className="size-4 accent-(--accent-400)"
          type="checkbox"
          onChange={(event) => onChange(path, event.target.checked)}
        />
        <span className="font-medium">{label}</span>
      </label>
    )
  }

  return (
    <label className={cn("flex flex-col gap-1.5", longText && "col-span-full")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {longText ? (
        <textarea
          className={textareaClass}
          value={String(value ?? "")}
          onChange={(event) => onChange(path, coerce(event.target.value, type))}
        />
      ) : (
        <input
          className={inputClass}
          value={String(value ?? "")}
          onChange={(event) => onChange(path, coerce(event.target.value, type))}
        />
      )}
      {!compact && (
        <span className="font-mono text-[10px] text-muted-foreground/70" title={path.join(".")}>
          {path.at(-1)}
        </span>
      )}
    </label>
  )
}

function ObjectListItemControls({
  index,
  total,
  syncListControls,
}: {
  index: number
  total: number
  syncListControls?: SyncListControls
}) {
  if (!syncListControls) return null

  const { onDuplicate, onRemove, onMove } = syncListControls

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        disabled={index === 0}
        size="xs"
        variant="outline"
        onClick={() => onMove(index, index - 1)}
      >
        Subir
      </Button>
      <Button
        disabled={index >= total - 1}
        size="xs"
        variant="outline"
        onClick={() => onMove(index, index + 1)}
      >
        Bajar
      </Button>
      <Button size="xs" variant="outline" onClick={() => onDuplicate(index)}>
        Duplicar
      </Button>
      <Button size="xs" variant="destructive" onClick={() => onRemove(index)}>
        Eliminar
      </Button>
    </div>
  )
}

function ArrayField({
  path,
  fieldKey,
  value,
  onChange,
  compact,
  syncListControls,
}: {
  path: FormPath
  fieldKey: string | number
  value: JsonValue[]
  onChange: (path: FormPath, value: JsonValue) => void
  compact?: boolean
  syncListControls?: SyncListControls
}) {
  const allScalar = value.every(isScalar)
  const label = fieldLabel(fieldKey)

  if (allScalar) {
    const sample = value.find((item) => item !== null)
    const type = sample === undefined ? "string" : typeof sample
    return (
      <Card className="col-span-full" key={path.join(".")}>
        <CardHeader>
          <CardTitle className="text-base">{label}</CardTitle>
          <CardDescription>Una línea por elemento.</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className={cn(inputClass, "min-h-28 w-full font-mono")}
            value={value.map(String).join("\n")}
            onChange={(event) => {
              const next = event.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => coerce(item, type))
              onChange(path, next)
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const addItem = () => {
    if (syncListControls) {
      syncListControls.onAdd()
      return
    }
    onChange(path, [...value, clone(value.at(-1) ?? {})])
  }

  return (
    <Card className="col-span-full" key={path.join(".")}>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        {!compact && (
          <CardDescription className="font-mono text-[11px]">{String(fieldKey)}</CardDescription>
        )}
        <CardAction>
          <Button size="sm" variant="outline" onClick={addItem}>
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
                {syncListControls ? (
                  <ObjectListItemControls
                    index={index}
                    syncListControls={syncListControls}
                    total={value.length}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        const next = [...value]
                        next.splice(index + 1, 0, clone(item))
                        onChange(path, next)
                      }}
                    >
                      Duplicar
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={index === 0}
                      onClick={() => onChange(path, moveItem(value, index, index - 1))}
                    >
                      Subir
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={index >= value.length - 1}
                      onClick={() => onChange(path, moveItem(value, index, index + 1))}
                    >
                      Bajar
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() =>
                        onChange(
                          path,
                          value.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
              <JsonValueEditor
                compact
                embedded
                path={path.concat(index)}
                rootKey={`Elemento ${index + 1}`}
                syncListControls={syncListControls}
                value={item}
                onChange={onChange}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function ObjectField({
  path,
  fieldKey,
  value,
  onChange,
  compact,
  embedded,
  syncListControls,
}: {
  path: FormPath
  fieldKey: string | number
  value: JsonObject
  onChange: (path: FormPath, value: JsonValue) => void
  compact?: boolean
  embedded?: boolean
  syncListControls?: SyncListControls
}) {
  const label = fieldLabel(fieldKey)
  const fields = Object.entries(value).map(([childKey, childValue]) => (
    <JsonValueEditor
      compact={compact}
      embedded
      key={path.concat(childKey).join(".")}
      path={path.concat(childKey)}
      rootKey={childKey}
      syncListControls={syncListControls}
      value={childValue}
      onChange={onChange}
    />
  ))

  if (embedded) {
    return <div className="grid gap-3 sm:grid-cols-2">{fields}</div>
  }

  return (
    <Card className="col-span-full" key={path.join(".")}>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">{fields}</CardContent>
    </Card>
  )
}

export function JsonValueEditor({
  path,
  value,
  onChange,
  compact = false,
  rootKey,
  embedded = false,
  syncListControls,
}: JsonValueEditorProps) {
  const key = rootKey ?? path.at(-1) ?? "field"

  if (Array.isArray(value)) {
    return (
      <ArrayField
        compact={compact}
        fieldKey={key}
        path={path}
        syncListControls={syncListControls}
        value={value}
        onChange={onChange}
      />
    )
  }

  if (isObject(value)) {
    return (
      <ObjectField
        compact={compact}
        embedded={embedded}
        fieldKey={key}
        path={path}
        syncListControls={syncListControls}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <ScalarField
      compact={compact}
      fieldKey={key}
      path={path}
      value={value}
      onChange={onChange}
    />
  )
}
