"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  status: string
  total_mxn: number
  total_items: number
  created_at: string
  source: string | null
  notes: string | null
  client: { id: string; name: string; phone: string } | null
  items: { id: string; product_name: string; price: number; quantity: number }[]
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pendiente: { label: "Pendiente", class: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", class: "bg-blue-100 text-blue-800" },
  listo: { label: "Listo", class: "bg-green-100 text-green-800" },
  entregado: { label: "Entregado", class: "bg-emerald-100 text-emerald-800" },
  cancelado: { label: "Cancelado", class: "bg-red-100 text-red-800" },
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        const json = await res.json()
        setOrders(json.recentOrders ?? [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-dark">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona las órdenes de los clientes</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
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
                      {order.client?.name ?? "—"} — {order.client?.phone ?? "—"}
                    </p>
                  </div>
                  <Badge className={cn("text-[10px]", config.class)}>{config.label}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {order.items?.slice(0, 3).map((item) => (
                    <p key={item.id}>{item.product_name} x{item.quantity} — ${item.price * item.quantity}</p>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm">
                  <span className="font-semibold">${order.total_mxn}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("es-MX")}
                    {order.source === "whatsapp" && " — WhatsApp"}
                  </span>
                </div>
              </div>
            )
          })}
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Sin pedidos</p>
          )}
        </div>
      )}
    </div>
  )
}
