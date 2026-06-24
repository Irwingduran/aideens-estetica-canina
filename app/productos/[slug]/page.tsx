"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/context/CartContext"
import { cn } from "@/lib/utils"
import { Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react"

interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  compare_price: number | null
  stock: number
  unit: string
  image_urls: string[]
  tipo: string
  ai_tags: string[]
  category: { id: string; name: string; slug: string } | null
}

const tipoConfig: Record<string, { label: string; class: string }> = {
  homeopatico: { label: "🌿 Homeopático", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  natural: { label: "🌱 Natural", class: "bg-green-100 text-green-800 border-green-200" },
  convencional: { label: "🧴 Convencional", class: "bg-amber-100 text-amber-800 border-amber-200" },
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-5 w-48 mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${slug}`)
        if (!res.ok) {
          router.push("/productos")
          return
        }
        const json = await res.json()
        setProduct(json.data)
      } catch {
        router.push("/productos")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <Navbar />
        <ProductDetailSkeleton />
        <Footer />
      </main>
    )
  }

  if (!product) return null

  const config = tipoConfig[product.tipo] ?? tipoConfig.convencional
  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image_url: product.image_urls[0] ?? "",
      tipo: product.tipo,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-warm-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-3">
            <div className="aspect-square relative rounded-xl overflow-hidden bg-muted">
              {product.image_urls[selectedImage] ? (
                <Image
                  src={product.image_urls[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>
            {product.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.image_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors",
                      i === selectedImage ? "border-gold" : "border-border hover:border-gold/50"
                    )}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Badge className={cn("w-fit text-xs font-medium border", config.class)}>
              {config.label}
            </Badge>

            <h1 className="font-serif text-2xl md:text-3xl text-warm-dark">{product.name}</h1>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-warm-dark">${product.price}</span>
              {discount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">${product.compare_price}</span>
                  <Badge variant="destructive" className="text-xs">-{discount}%</Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-700 font-medium">En existencia</span>
                  <span className="text-muted-foreground">({product.stock} disponibles)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-red-600 font-medium">Agotado</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-muted transition-colors disabled:opacity-30"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                size="lg"
                className={cn("flex-1 transition-all", added && "bg-green-600 hover:bg-green-600")}
                disabled={product.stock <= 0}
                onClick={handleAdd}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {added ? "¡Agregado!" : "Agregar al pedido"}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-1">
              💰 Pago en efectivo contra entrega o al recoger en sucursal
            </div>

            {product.description && (
              <div className="pt-4 border-t border-border">
                <h2 className="text-sm font-semibold text-warm-dark mb-2">Descripción</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Link
                href="/cotizar"
                className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors font-medium"
              >
                🤖 ¿No sabes si es el adecuado? Pregúntale al groomer AI
              </Link>
            </div>

            {product.ai_tags.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {product.ai_tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
