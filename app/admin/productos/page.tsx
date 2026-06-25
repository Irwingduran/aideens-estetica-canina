"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { Search, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ProductFormDialog } from "@/components/admin/ProductFormDialog"

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
  created_at: string
  category: { id: string; name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

const TIPO_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "convencional", label: "Convencional" },
  { value: "homeopatico", label: "Homeopático" },
  { value: "natural", label: "Natural" },
]

const tipoBadge: Record<string, { label: string; class: string }> = {
  homeopatico: { label: "Homeopático", class: "bg-emerald-100 text-emerald-800" },
  natural: { label: "Natural", class: "bg-green-100 text-green-800" },
  convencional: { label: "Conv.", class: "bg-amber-100 text-amber-800" },
}

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, pages: 0 })

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mutating, setMutating] = useState<string | null>(null)

  const limit = 10

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (categoryFilter && categoryFilter !== "all") params.set("category_id", categoryFilter)
      if (tipoFilter && tipoFilter !== "all") params.set("tipo", tipoFilter)
      params.set("page", String(page))
      params.set("limit", String(limit))

      const res = await fetch(`/api/admin/products?${params}`)
      const json = await res.json()
      setProducts(json.data ?? [])
      setPagination(json.pagination ?? { page: 1, limit, total: 0, pages: 0 })
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, tipoFilter, page])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter, tipoFilter])

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => setCategories(json.data ?? []))
      .catch(() => {})
  }, [])

  async function toggleField(id: string, field: "active" | "featured", value: boolean) {
    setMutating(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error()
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
      toast({ title: "Producto actualizado" })
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el producto", variant: "destructive" })
    } finally {
      setMutating(null)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setProducts((prev) => prev.filter((p) => p.id !== deleteId))
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }))
      setDeleteId(null)
      toast({ title: "Producto eliminado" })
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el producto", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-dark">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.total > 0
              ? `${pagination.total} producto${pagination.total !== 1 ? "s" : ""}`
              : "Gestiona el catálogo de productos"}
          </p>
        </div>
        <ProductFormDialog categories={categories} onSuccess={loadProducts} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPO_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="text-left p-3 font-medium">Producto</th>
                    <th className="text-left p-3 font-medium">Categoría</th>
                    <th className="text-left p-3 font-medium">Precio</th>
                    <th className="text-left p-3 font-medium">Stock</th>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-center p-3 font-medium">Activo</th>
                    <th className="text-center p-3 font-medium">Destacado</th>
                    <th className="text-right p-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => {
                    const badge = tipoBadge[p.tipo] ?? tipoBadge.convencional
                    return (
                      <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">/{p.slug}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {p.category?.name ?? "—"}
                        </td>
                        <td className="p-3 font-medium">${p.price}</td>
                        <td className="p-3">
                          <span className={cn(
                            p.stock <= 0 ? "text-red-600 font-medium" : "text-muted-foreground",
                            p.stock <= 5 && p.stock > 0 && "text-amber-600 font-medium"
                          )}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge className={cn("text-[10px]", badge.class)}>{badge.label}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Switch
                            checked={p.active}
                            disabled={mutating === p.id}
                            onCheckedChange={(v) => toggleField(p.id, "active", v)}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Switch
                            checked={p.featured}
                            disabled={mutating === p.id}
                            onCheckedChange={(v) => toggleField(p.id, "featured", v)}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <ProductFormDialog
                              product={p}
                              categories={categories}
                              onSuccess={loadProducts}
                              trigger={
                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              }
                            />
                            <AlertDialog open={deleteId === p.id} onOpenChange={(o) => !o && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => setDeleteId(p.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de eliminar <strong>{p.name}</strong>? Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deleting ? "Eliminando..." : "Eliminar"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {products.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                No se encontraron productos
              </p>
            )}
          </div>

          {pagination.pages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                </PaginationItem>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.pages <= 7) return true
                    if (p === 1 || p === pagination.pages) return true
                    return Math.abs(p - page) <= 1
                  })
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                    return (
                      <PaginationItem key={p}>
                        {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
