"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/CartContext"
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
}

const tipoConfig: Record<string, { label: string; class: string }> = {
  homeopatico: { label: "Homeopático", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  natural: { label: "Natural", class: "bg-green-100 text-green-800 border-green-200" },
  convencional: { label: "Convencional", class: "bg-amber-100 text-amber-800 border-amber-200" },
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const config = tipoConfig[product.tipo] ?? tipoConfig.convencional
  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/productos/${product.slug}`} className="block aspect-square relative overflow-hidden bg-muted">
        {product.image_urls[0] ? (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Sin imagen
          </div>
        )}
        <Badge className={cn("absolute top-2 left-2 text-[10px] font-medium border", config.class)}>
          {config.label}
        </Badge>
        {discount && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">
            -{discount}%
          </Badge>
        )}
      </Link>
      <div className="flex flex-col gap-1 p-3 flex-1">
        <Link href={`/productos/${product.slug}`} className="text-sm font-medium leading-tight hover:text-gold transition-colors line-clamp-2">
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <span className="text-base font-bold text-warm-dark">${product.price}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">${product.compare_price}</span>
          )}
        </div>
        <Button
          size="sm"
          className="mt-2 w-full"
          disabled={product.stock <= 0}
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
        >
          {product.stock <= 0 ? "Agotado" : "Agregar"}
        </Button>
      </div>
    </div>
  )
}
