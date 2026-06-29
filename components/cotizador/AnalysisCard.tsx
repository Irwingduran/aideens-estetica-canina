"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface AnalysisData {
  raza: string
  tamano: "chico" | "mediano" | "grande" | "xl"
  peso_estimado: string
  pelaje: string
  condicion: string
}

interface AnalysisCardProps {
  raza: string
  tamano: "chico" | "mediano" | "grande" | "xl"
  peso_estimado: string
  pelaje: string
  condicion: string
  onSave?: (data: AnalysisData) => void
}

const TAMANO_OPTIONS = ["chico", "mediano", "grande", "xl"] as const
const PELAJE_OPTIONS = ["corto", "medio", "largo", "muy largo"]
const CONDICION_OPTIONS = ["saludable", "maltratado", "enredado", "seco", "grasoso"]

export function AnalysisCard(props: AnalysisCardProps) {
  const { onSave, ...initial } = props
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AnalysisData>(initial)
  const [saved, setSaved] = useState(false)

  const display = saved ? draft : initial

  if (!editing) {
    return (
      <div
        className="w-full relative group"
        style={{
          background: "rgba(201, 168, 76, 0.08)",
          border: "1px solid rgba(201, 168, 76, 0.3)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {onSave && (
          <button
            onClick={() => {
              setDraft(display)
              setEditing(true)
            }}
            className="absolute top-2 right-2 text-xs font-mono text-gold bg-gold/10 hover:bg-gold/20 border border-gold/30 px-2 py-0.5 rounded-md transition-all"
          >
            ✏️ Corregir
          </button>
        )}
        <div className="flex items-start gap-2 mb-2">
          <span className="text-lg">🐕</span>
          <div>
            <h3 className="font-serif text-lg text-cream">{display.raza}</h3>
            <p className="font-sans text-[13px] text-sage">
              Tamaño {display.tamano} · ~{display.peso_estimado}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <p className="font-sans text-sm text-cream/80">
            Pelaje {display.pelaje} · {display.condicion}
          </p>
          {saved && (
            <p className="text-[10px] text-gold/60 font-medium mt-1">✓ Corregido</p>
          )}
        </div>
      </div>
    )
  }

  function handleSave() {
    onSave?.(draft)
    setSaved(true)
    setEditing(false)
  }

  return (
    <div
      className="w-full"
      style={{
        background: "rgba(201, 168, 76, 0.08)",
        border: "1px solid rgba(201, 168, 76, 0.3)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h4 className="font-serif text-sm text-cream mb-4">Editar análisis</h4>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-cream/60">Raza</Label>
            <Input
              value={draft.raza}
              onChange={(e) => setDraft({ ...draft, raza: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-cream/60">Peso estimado</Label>
            <Input
              value={draft.peso_estimado}
              onChange={(e) => setDraft({ ...draft, peso_estimado: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-cream/60">Tamaño</Label>
          <div className="flex gap-1.5 mt-1">
            {TAMANO_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setDraft({ ...draft, tamano: t })}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  draft.tamano === t
                    ? "bg-gold text-warm-dark"
                    : "bg-white/5 text-cream/60 hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs text-cream/60">Pelaje</Label>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {PELAJE_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setDraft({ ...draft, pelaje: p })}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  draft.pelaje === p
                    ? "bg-gold text-warm-dark"
                    : "bg-white/5 text-cream/60 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs text-cream/60">Condición</Label>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {CONDICION_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setDraft({ ...draft, condicion: c })}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  draft.condicion === c
                    ? "bg-gold text-warm-dark"
                    : "bg-white/5 text-cream/60 hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            className="h-8 text-xs bg-gold text-warm-dark hover:bg-gold/90"
          >
            Guardar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraft(initial)
              setEditing(false)
            }}
            className="h-8 text-xs"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
