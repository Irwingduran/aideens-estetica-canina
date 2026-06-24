"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Search, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  tipo: string
  active: boolean
  featured: boolean
  created_at: string
}

const tipoBadge: Record<string, { label: string; class: string }> = {
  homeopatico: { label: "Homeopático", class: "bg-emerald-100 text-emerald-800" },
  natural: { label: "Natural", class: "bg-green-100 text-green-800" },
  convencional: { label: "Conv.", class: "bg-amber-100 text-amber-800" },
}

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`/api/products${search ? `?q=${search}` : ""}`)
        const json = await res.json()
        setProducts(json.data ?? [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-dark">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona el catálogo de productos</p>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-1" />
          Nuevo producto
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Precio</th>
                  <th className="text-left p-3 font-medium">Stock</th>
                  <th className="text-left p-3 font-medium">Tipo</th>
                  <th className="text-left p-3 font-medium">Estado</th>
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
                      <td className="p-3 font-medium">${p.price}</td>
                      <td className="p-3">
                        <span className={cn(p.stock <= 0 ? "text-red-600 font-medium" : "text-muted-foreground")}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={cn("text-[10px]", badge.class)}>{badge.label}</Badge>
                      </td>
                      <td className="p-3">
                        {p.active ? (
                          <span className="text-green-600 text-xs font-medium">Activo</span>
                        ) : (
                          <span className="text-red-600 text-xs font-medium">Inactivo</span>
                        )}
                        {p.featured && <Badge className="ml-2 text-[10px] bg-gold/20 text-gold">Destacado</Badge>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No hay productos</p>
          )}
        </div>
      )}
    </div>
  )
}
