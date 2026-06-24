"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/context/CartContext"
import { cn } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  image_urls: string[]
  tipo: string
  stock: number
}

const tipoBadge: Record<string, { label: string; class: string }> = {
  homeopatico: { label: "🌿 Homeopático", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  natural: { label: "🌱 Natural", class: "bg-green-100 text-green-800 border-green-200" },
  convencional: { label: "🧴 Convencional", class: "bg-amber-100 text-amber-800 border-amber-200" },
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products?featured=true&limit=8")
        const json = await res.json()
        setProducts(json.data ?? [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  if (!loading && products.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-warm-dark">Productos Destacados</h2>
            <p className="text-muted-foreground text-sm mt-2">Lo más vendido para el cuidado de tu perro</p>
          </div>
          <Link
            href="/productos"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-gold hover:underline font-medium"
          >
            Ver catálogo completo →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => {
              const badge = tipoBadge[product.tipo] ?? tipoBadge.convencional
              return (
                <div key={product.id} className="group bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md">
                  <Link href={`/productos/${product.slug}`} className="block aspect-square relative overflow-hidden bg-muted">
                    {product.image_urls[0] ? (
                      <Image
                        src={product.image_urls[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">Sin imagen</div>
                    )}
                    <Badge className={cn("absolute top-2 left-2 text-[10px] font-medium border", badge.class)}>
                      {badge.label}
                    </Badge>
                  </Link>
                  <div className="p-3">
                    <Link href={`/productos/${product.slug}`} className="text-sm font-medium leading-tight line-clamp-2 hover:text-gold transition-colors">
                      {product.name}
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-warm-dark">${product.price}</span>
                      <button
                        onClick={() =>
                          addItem({
                            product_id: product.id,
                            slug: product.slug,
                            name: product.name,
                            price: product.price,
                            image_url: product.image_urls[0] ?? "",
                            tipo: product.tipo,
                          })
                        }
                        disabled={product.stock <= 0}
                        className="p-1.5 rounded-full bg-warm-dark text-cream hover:bg-gold transition-colors disabled:opacity-30"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/productos">Ver catálogo completo →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
