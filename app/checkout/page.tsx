"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { ShoppingBag, MapPin, Truck, CheckCircle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface Dog {
  id: string
  name: string
  breed: string | null
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, subtotal, clearCart } = useCart()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [dogsLoading, setDogsLoading] = useState(true)
  const [selectedDogId, setSelectedDogId] = useState("")
  const [notes, setNotes] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [orderCreated, setOrderCreated] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/?auth=required")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const fetchDogs = async () => {
      try {
        const res = await fetch("/api/dogs")
        const json = await res.json()
        setDogs(json.data ?? [])
        if (json.data?.length > 0) setSelectedDogId(json.data[0].id)
      } catch {
        setDogs([])
      } finally {
        setDogsLoading(false)
      }
    }
    fetchDogs()
  }, [user])

  const deliveryFee = deliveryMethod === "delivery" ? 50 : 0
  const total = subtotal + deliveryFee

  const handleSubmit = useCallback(async () => {
    if (items.length === 0) return
    setSubmitting(true)
    setError("")

    try {
      const clientRes = await fetch("/api/clients/me")
      if (!clientRes.ok) throw new Error("Error al obtener perfil")
      const clientJson = await clientRes.json()
      const clientId = clientJson.data?.id
      if (!clientId) throw new Error("Cliente no encontrado")

      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          dog_id: selectedDogId || null,
          items: orderItems,
          notes: deliveryMethod === "delivery"
            ? `Envío a domicilio. ${notes}`.trim()
            : `Recoger en sucursal. ${notes}`.trim(),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al crear orden")
      }

      clearCart()
      setOrderCreated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear orden")
    } finally {
      setSubmitting(false)
    }
  }, [items, selectedDogId, notes, deliveryMethod, clearCart])

  if (authLoading) {
    return (
      <main className="min-h-screen bg-cream">
        <Navbar />
        <CheckoutSkeleton />
        <Footer />
      </main>
    )
  }

  if (orderCreated) {
    return (
      <main className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-warm-dark mb-2">¡Pedido confirmado!</h1>
          <p className="text-sm text-muted-foreground mb-2">Te notificaremos cuando esté listo.</p>
          <p className="text-xs text-muted-foreground mb-6">
            🐾 Recoges en Otilio Montaño 510-local 141, Jardines de Guadalupe
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/mi-cuenta">Ver en Mis Pedidos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/productos">Seguir comprando</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-warm-dark mb-2">Tu carrito está vacío</h1>
          <Button asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-warm-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir comprando
        </Link>

        <h1 className="font-serif text-3xl text-warm-dark mb-8">Confirmar Pedido</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-warm-dark mb-1">Contacto</h2>
              <p className="text-sm text-muted-foreground">{user?.email || user?.phone || "Usuario"}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-warm-dark mb-3">¿Para qué perro es el pedido?</h2>
              {dogsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : dogs.length > 0 ? (
                <Select value={selectedDogId} onValueChange={setSelectedDogId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un perro" />
                  </SelectTrigger>
                  <SelectContent>
                    {dogs.map((dog) => (
                      <SelectItem key={dog.id} value={dog.id}>
                        🐕 {dog.name}{dog.breed ? ` — ${dog.breed}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no has registrado perros.{/* TODO: modal para registrar perro */}
                </p>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-warm-dark mb-3">Método de entrega</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                    deliveryMethod === "pickup"
                      ? "border-gold bg-gold/5"
                      : "border-border hover:border-gold/50"
                  )}
                >
                  <MapPin className={cn("w-5 h-5 mt-0.5", deliveryMethod === "pickup" ? "text-gold" : "text-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium">Recoger en sucursal</p>
                    <p className="text-xs text-muted-foreground">Otilio Montaño 510-local 141, Jardines de Guadalupe — Sin costo</p>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMethod("delivery")}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                    deliveryMethod === "delivery"
                      ? "border-gold bg-gold/5"
                      : "border-border hover:border-gold/50"
                  )}
                >
                  <Truck className={cn("w-5 h-5 mt-0.5", deliveryMethod === "delivery" ? "text-gold" : "text-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium">Envío a domicilio</p>
                    <p className="text-xs text-muted-foreground">Zona GDL/Zapopan/Tlaquepaque</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-warm-dark mb-2">Nota (opcional)</h2>
              <Textarea
                placeholder="Alguna instrucción especial..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-24 space-y-4">
              <h2 className="text-sm font-semibold text-warm-dark">Resumen del pedido</h2>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">?</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span>{deliveryFee === 0 ? "Gratis" : `$${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-warm-dark pt-1 border-t border-border">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                💰 Pago en efectivo contra entrega
              </p>

              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Creando orden..." : "Confirmar pedido"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
