"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  image_urls: string[]
  tipo: string
  stock: number
  category: { id: string; name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const TIPO_FILTERS = [
  { value: "", label: "Todos" },
  { value: "convencional", label: "Convencional" },
  { value: "homeopatico", label: "Homeopático" },
  { value: "natural", label: "Natural" },
]

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductosPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)

  const tipo = searchParams.get("tipo") ?? ""
  const categoryId = searchParams.get("category_id") ?? ""
  const q = searchParams.get("q") ?? ""
  const page = parseInt(searchParams.get("page") ?? "1", 10)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const json = await res.json()
        setCategories(json.data ?? [])
      } catch {}
    }
    fetchCategories()
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tipo) params.set("tipo", tipo)
      if (categoryId) params.set("category_id", categoryId)
      if (q) params.set("q", q)
      params.set("page", String(page))
      params.set("limit", "20")

      const res = await fetch(`/api/products?${params.toString()}`)
      const json = await res.json()
      setProducts(json.data ?? [])
      setPagination(json.pagination ?? null)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [tipo, categoryId, q, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    if (updates.tipo !== undefined || updates.category_id !== undefined || updates.q !== undefined) {
      params.delete("page")
    }
    router.push(`/productos?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-3xl md:text-4xl text-warm-dark mb-2">Productos</h1>
        <p className="text-muted-foreground text-sm mb-6">Todo para el cuidado de tu perro</p>

        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={q}
              onChange={(e) => updateParams({ q: e.target.value })}
              className="pl-9 pr-9"
            />
            {q && (
              <button
                onClick={() => updateParams({ q: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {TIPO_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => updateParams({ tipo: f.value })}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  tipo === f.value
                    ? "bg-warm-dark text-cream border-warm-dark"
                    : "bg-card text-muted-foreground border-border hover:border-warm-dark/30"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateParams({ category_id: "" })}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  !categoryId
                    ? "bg-warm-dark text-cream border-warm-dark"
                    : "bg-card text-muted-foreground border-border hover:border-warm-dark/30"
                )}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParams({ category_id: cat.id })}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-colors",
                    categoryId === cat.id
                      ? "bg-gold text-warm-dark border-gold"
                      : "bg-card text-muted-foreground border-border hover:border-gold/50"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No encontramos productos con esos filtros</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/productos")}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        </div>
        <Footer />
      </main>
    }>
      <ProductosPageContent />
    </Suspense>
  )
}
