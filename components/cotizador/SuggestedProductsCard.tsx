"use client"

import Link from "next/link"
import type { ProductSuggestion } from "@/lib/quote-parser"

interface SuggestedProductsCardProps {
  products: ProductSuggestion[]
}

export function SuggestedProductsCard({ products }: SuggestedProductsCardProps) {
  return (
    <div
      className="w-full"
      style={{
        background: "rgba(201, 168, 76, 0.06)",
        border: "1px solid rgba(201, 168, 76, 0.25)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-gold mb-3">
        Productos recomendados
      </p>

      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={i}>
            <div className="flex justify-between items-start">
              <p className="font-sans text-sm font-medium text-cream">{product.nombre}</p>
              <span className="font-sans text-sm font-semibold text-gold shrink-0 ml-2">
                ${product.precio.toLocaleString("es-MX")}
              </span>
            </div>
            {product.descripcion && (
              <p className="font-sans text-xs text-cream/50 mt-0.5">{product.descripcion}</p>
            )}
            <p className="font-sans text-xs text-sage mt-1">✨ {product.razon}</p>
          </div>
        ))}
      </div>

      <Link
        href="/productos"
        className="mt-4 block w-full text-center py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-200"
        style={{
          background: "#C9A84C",
          color: "#1C1814",
        }}
      >
        Ver todos los productos →
      </Link>
    </div>
  )
}
