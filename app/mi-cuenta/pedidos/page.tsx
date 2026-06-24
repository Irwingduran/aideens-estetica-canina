"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { Package, ArrowLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  status: string
  total_mxn: number
  total_items: number
  created_at: string
  source: string | null
  dog: { id: string; name: string; breed: string } | null
  items: { id: string; product_name: string; price: number; quantity: number }[]
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pendiente: { label: "Pendiente", class: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", class: "bg-blue-100 text-blue-800" },
  listo: { label: "Listo", class: "bg-green-100 text-green-800" },
  entregado: { label: "Entregado", class: "bg-emerald-100 text-emerald-800" },
  cancelado: { label: "Cancelado", class: "bg-red-100 text-red-800" },
}

function OrdersSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  )
}

export default function PedidosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push("/?auth=required")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const profileRes = await fetch("/api/clients/me")
        if (!profileRes.ok) return
        const profileJson = await profileRes.json()
        const clientId = profileJson.data?.id
        if (!clientId) return

        const res = await fetch(`/api/orders?client_id=${clientId}`)
        const json = await res.json()
        setOrders(json.data ?? [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  if (authLoading || loading) return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <OrdersSkeleton />
      <Footer />
    </main>
  )

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/mi-cuenta" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-warm-dark transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Cuenta
        </Link>

        <h1 className="font-serif text-3xl text-warm-dark mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Aún no tienes pedidos</p>
            <Button asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const config = statusConfig[order.status] ?? { label: order.status, class: "bg-gray-100 text-gray-800" }
              return (
                <div key={order.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-MX", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                        {order.source === "whatsapp" && " — WhatsApp"}
                      </p>
                    </div>
                    <Badge className={cn("text-[10px] font-medium", config.class)}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {order.items?.slice(0, 3).map((item) => (
                      <p key={item.id} className="text-xs text-muted-foreground">
                        {item.product_name} x{item.quantity} — ${item.price * item.quantity}
                      </p>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{order.items.length - 3} más</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-sm font-bold">${order.total_mxn}</span>
                    {order.dog && (
                      <span className="text-xs text-muted-foreground">🐕 {order.dog.name}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
