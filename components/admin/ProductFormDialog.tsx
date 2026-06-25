"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil } from "lucide-react"

const TIPO_OPTIONS = [
  { value: "convencional", label: "Convencional" },
  { value: "homeopatico", label: "Homeopático" },
  { value: "natural", label: "Natural" },
]

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: string
  compare_price: string
  stock: string
  unit: string
  tipo: string
  category_id: string
  featured: boolean
  active: boolean
  ai_tags: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  stock: number
  unit: string
  tipo: string
  category_id: string | null
  featured: boolean
  active: boolean
  ai_tags: string[]
  category: { id: string; name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFormDialogProps {
  product?: Product
  categories: Category[]
  onSuccess: () => void
  trigger?: React.ReactNode
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function ProductFormDialog({ product, categories, onSuccess, trigger }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const [form, setForm] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_price: "",
    stock: "0",
    unit: "pieza",
    tipo: "convencional",
    category_id: "",
    featured: false,
    active: true,
    ai_tags: "",
  })

  useEffect(() => {
    if (open && product) {
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        price: String(product.price),
        compare_price: product.compare_price ? String(product.compare_price) : "",
        stock: String(product.stock),
        unit: product.unit,
        tipo: product.tipo,
        category_id: product.category_id ?? "",
        featured: product.featured,
        active: product.active,
        ai_tags: (product.ai_tags ?? []).join(", "),
      })
      setSlugManuallyEdited(true)
    } else if (open && !product) {
      setForm({
        name: "", slug: "", description: "", price: "", compare_price: "",
        stock: "0", unit: "pieza", tipo: "convencional", category_id: "",
        featured: false, active: true, ai_tags: "",
      })
      setSlugManuallyEdited(false)
    }
  }, [open, product])

  function updateField(field: keyof ProductFormData, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "name" && !slugManuallyEdited && !product) {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres")
      return
    }
    if (!form.slug.trim()) {
      setError("El slug es requerido")
      return
    }
    const priceNum = parseFloat(form.price)
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Precio inválido")
      return
    }

    setError("")
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price: priceNum,
      compare_price: form.compare_price ? parseFloat(form.compare_price) || null : null,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
      tipo: form.tipo,
      category_id: form.category_id || null,
      featured: form.featured,
      active: form.active,
      ai_tags: form.ai_tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    }

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products"
      const method = product ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Error al guardar")
      }

      setOpen(false)
      onSuccess()
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
            Nuevo producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Modifica los datos del producto" : "Agrega un nuevo producto al catálogo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name" value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Shampoo Avena 500 ml"
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug" value={form.slug}
                onChange={(e) => { updateField("slug", e.target.value); setSlugManuallyEdited(true) }}
                placeholder="shampoo-avena-500ml"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description" value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price" type="number" min="0" step="1"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compare_price">Precio comparativa</Label>
              <Input
                id="compare_price" type="number" min="0" step="1"
                value={form.compare_price}
                onChange={(e) => updateField("compare_price", e.target.value)}
                placeholder="Ej: 399"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock" type="number" min="0" step="1"
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => updateField("tipo", v)}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={form.category_id} onValueChange={(v) => updateField("category_id", v === "none" ? "" : v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad</Label>
              <Input
                id="unit" value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                placeholder="pieza"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_tags">Tags IA (separados por coma)</Label>
            <Input
              id="ai_tags" value={form.ai_tags}
              onChange={(e) => updateField("ai_tags", e.target.value)}
              placeholder="shampoo, avena, cuidado, piel sensible"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="featured" checked={form.featured}
                onCheckedChange={(v) => updateField("featured", v)}
              />
              <Label htmlFor="featured">Destacado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active" checked={form.active}
                onCheckedChange={(v) => updateField("active", v)}
              />
              <Label htmlFor="active">Activo</Label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
