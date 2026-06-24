"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, ShoppingBag, Package, DollarSign, AlertCircle, Phone, Clock } from "lucide-react"

interface Stats {
  total_clientes: number
  total_ordenes: number
  ordenes_pendientes: number
  ordenes_completadas: number
  ingresos_totales: number
  total_perros: number
  servicios_realizados: number
  leads_pendientes: number
  productos_agotados: number
}

interface Order {
  id: string
  status: string
  total_mxn: number
  created_at: string
  client: { id: string; name: string; phone: string } | null
}

interface Lead {
  id: string
  dog_name: string
  whatsapp: string
  total_mxn: number | null
  created_at: string
  contacted: boolean
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pendiente: { label: "Pendiente", class: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", class: "bg-blue-100 text-blue-800" },
  listo: { label: "Listo", class: "bg-green-100 text-green-800" },
  entregado: { label: "Entregado", class: "bg-emerald-100 text-emerald-800" },
  cancelado: { label: "Cancelado", class: "bg-red-100 text-red-800" },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        const json = await res.json()
        setStats(json.stats)
        setOrders(json.recentOrders ?? [])
        setLeads(json.recentLeads ?? [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )

  const statCards = [
    { label: "Clientes", value: stats?.total_clientes ?? 0, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Órdenes totales", value: stats?.total_ordenes ?? 0, icon: ShoppingBag, color: "text-purple-600 bg-purple-100" },
    { label: "Pendientes", value: stats?.ordenes_pendientes ?? 0, icon: Clock, color: "text-amber-600 bg-amber-100" },
    { label: "Ingresos", value: `$${stats?.ingresos_totales ?? 0}`, icon: DollarSign, color: "text-green-600 bg-green-100" },
    { label: "Perros", value: stats?.total_perros ?? 0, icon: Users, color: "text-emerald-600 bg-emerald-100" },
    { label: "Leads", value: stats?.leads_pendientes ?? 0, icon: Phone, color: "text-rose-600 bg-rose-100" },
    { label: "Agotados", value: stats?.productos_agotados ?? 0, icon: AlertCircle, color: "text-red-600 bg-red-100" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-warm-dark">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del negocio</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-card rounded-xl border border-border p-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", card.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-warm-dark mb-4">Últimas Órdenes</h2>
          <div className="space-y-3">
            {orders.map((order) => {
              const config = statusConfig[order.status] ?? { label: order.status, class: "bg-gray-100 text-gray-800" }
              return (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.client?.name ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium">${order.total_mxn}</span>
                    <Badge className={cn("text-[10px]", config.class)}>{config.label}</Badge>
                  </div>
                </div>
              )
            })}
            {orders.length === 0 && <p className="text-sm text-muted-foreground">Sin órdenes recientes</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-warm-dark mb-4">Leads Recientes</h2>
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{lead.dog_name}</p>
                  <p className="text-xs text-muted-foreground">{lead.whatsapp}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {lead.total_mxn && <span className="text-xs font-medium">${lead.total_mxn}</span>}
                  <Badge className={cn("text-[10px]", lead.contacted ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
                    {lead.contacted ? "Contactado" : "Nuevo"}
                  </Badge>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="text-sm text-muted-foreground">Sin leads recientes</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
