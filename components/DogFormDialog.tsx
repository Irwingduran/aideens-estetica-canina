"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

const SIZES = [
  { value: "chico", label: "Chico (<10 kg)" },
  { value: "mediano", label: "Mediano (10-20 kg)" },
  { value: "grande", label: "Grande (20-35 kg)" },
  { value: "xl", label: "XL (>35 kg)" },
]

interface DogFormData {
  name: string
  breed: string
  size: string
  birth_date: string
  notes: string
}

interface DogFormDialogProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function DogFormDialog({ onSuccess, trigger }: DogFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<DogFormData>({
    name: "",
    breed: "",
    size: "",
    birth_date: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function updateField(field: keyof DogFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres")
      return
    }
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Error al guardar")
      }
      setForm({ name: "", breed: "", size: "", birth_date: "", notes: "" })
      setOpen(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Registrar perro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Registrar perro</DialogTitle>
          <DialogDescription>
            Agrega los datos de tu peludo para que podamos atenderlo mejor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Rex, Mochi..."
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Raza</Label>
            <Input
              id="breed"
              placeholder="Ej: Labrador, Criollo..."
              value={form.breed}
              onChange={(e) => updateField("breed", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Tamaño</Label>
            <Select value={form.size} onValueChange={(v) => updateField("size", v)}>
              <SelectTrigger id="size">
                <SelectValue placeholder="Selecciona tamaño" />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de nacimiento</Label>
            <Input
              id="birth_date"
              type="date"
              value={form.birth_date}
              onChange={(e) => updateField("birth_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Alergias, comportamiento, cuidados especiales..."
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
