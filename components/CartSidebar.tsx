"use client"

import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AuthModal } from "@/components/AuthModal"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export function CartSidebar() {
  const { items, totalItems, subtotal, removeItem, updateQuantity } = useCart()
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative p-2 text-warm-dark/80 hover:text-warm-dark transition-colors" aria-label="Carrito">
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gold text-[10px] font-bold text-warm-dark flex items-center justify-center">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Tu Pedido
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingBag className="w-12 h-12 opacity-30" />
            <p className="text-sm">Tu carrito está vacío</p>
            <Button variant="outline" asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">?</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.slug}`}
                      className="text-sm font-medium leading-tight line-clamp-2 hover:text-gold transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ${item.price} x {item.quantity}
                    </p>
                    <p className="text-sm font-semibold mt-1">${item.price * item.quantity}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${subtotal}</span>
              </div>
              {user ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">Confirmar pedido →</Link>
                </Button>
              ) : (
                <AuthModal
                  open={authOpen}
                  onOpenChange={setAuthOpen}
                  trigger={
                    <Button className="w-full" size="lg">
                      Iniciar sesión y confirmar pedido →
                    </Button>
                  }
                />
              )}
              <p className="text-xs text-muted-foreground text-center">
                🐾 Recoges en Otilio Montaño 510-local 141, Jardines de Guadalupe
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
