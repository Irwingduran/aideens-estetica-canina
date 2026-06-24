"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/context/CartContext"
import { ShoppingBag, Leaf } from "lucide-react"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  image_urls: string[]
  stock: number
}

export function HomeopathySection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products?tipo=homeopatico&limit=4")
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-emerald-50/40">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-10">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-warm-dark">
              Medicina Alternativa para tu Peludo
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Productos homeopáticos y naturales — libres de químicos agresivos, ideales para la salud y el bienestar de tu perro.
            </p>
          </div>
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
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="group bg-white/70 rounded-xl border border-emerald-200/50 overflow-hidden backdrop-blur-sm transition-shadow hover:shadow-md">
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
                    <div className="flex items-center justify-center h-full text-emerald-400 text-xs">🌿</div>
                  )}
                </Link>
                <div className="p-3">
                  <Link
                    href={`/productos/${product.slug}`}
                    className="text-sm font-medium leading-tight line-clamp-2 hover:text-emerald-700 transition-colors"
                  >
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
                          tipo: "homeopatico",
                        })
                      }
                      disabled={product.stock <= 0}
                      className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-30"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <p className="text-sm text-muted-foreground italic">
            💡 &ldquo;Lo natural también cura. Pregúntale a nuestro groomer AI qué necesita tu peludo.&rdquo;
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Button asChild>
            <Link href="/cotizar">🤖 Cotizar con foto</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/productos?tipo=homeopatico">Ver todo →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
