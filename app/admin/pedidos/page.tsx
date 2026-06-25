"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface OrderItem {
  id: string
  product_name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  status: string
  total_mxn: number
  total_items: number
  created_at: string
  source: string | null
  notes: string | null
  client: { id: string; name: string; phone: string } | null
  items: OrderItem[]
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pendiente: { label: "Pendiente", class: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", class: "bg-blue-100 text-blue-800" },
  listo: { label: "Listo", class: "bg-green-100 text-green-800" },
  entregado: { label: "Entregado", class: "bg-emerald-100 text-emerald-800" },
  cancelado: { label: "Cancelado", class: "bg-red-100 text-red-800" },
}

const statusFlow: Record<string, string[]> = {
  pendiente: ["confirmado"],
  confirmado: ["listo", "cancelado"],
  listo: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { setPage(1) }, [statusFilter])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.set("status", statusFilter)
        params.set("page", String(page))
        const res = await fetch(`/api/admin/orders?${params}`)
        const json = await res.json()
        setOrders(json.data ?? [])
        setPagination(json.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 })
      } catch {
        toast({ title: "Error", description: "No se pudieron cargar los pedidos", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [statusFilter, page])

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
      toast({ title: `Pedido ${statusConfig[newStatus]?.label.toLowerCase() ?? newStatus}` })
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-dark">Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.total > 0
              ? `${pagination.total} pedido${pagination.total !== 1 ? "s" : ""}`
              : "Gestiona las órdenes de los clientes"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="listo">Listo</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No hay pedidos</p>
          <p className="text-xs text-muted-foreground mt-1">
            {statusFilter !== "all" ? "No hay pedidos con ese estado" : "Los pedidos aparecerán aquí cuando los clientes compren"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status] ?? { label: order.status, class: "bg-gray-100 text-gray-800" }
            const expanded = expandedId === order.id
            return (
              <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedId(expanded ? null : order.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className="text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.client?.name ?? "—"} {order.client?.phone ? `— ${order.client.phone}` : ""}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("text-[10px]", config.class)}>{config.label}</Badge>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5 ml-7">
                    {order.items?.slice(0, 3).map((item) => (
                      <p key={item.id}>{item.product_name} x{item.quantity} — ${item.price * item.quantity}</p>
                    ))}
                    {(order.items?.length ?? 0) > 3 && (
                      <p className="text-[10px] text-muted-foreground/60">+{order.items.length - 3} items más</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm ml-7">
                    <span className="font-semibold">${order.total_mxn}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-MX", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                        {order.source === "whatsapp" && " — WhatsApp"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 ml-7">
                    {(statusFlow[order.status] ?? []).length > 0 && (
                      (statusFlow[order.status] ?? []).map((nextStatus) => (
                        <Button
                          key={nextStatus}
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order.id}
                          onClick={() => handleStatusChange(order.id, nextStatus)}
                          className={cn(
                            "text-xs h-7 px-3",
                            nextStatus === "cancelado" && "text-red-600 border-red-200 hover:bg-red-50"
                          )}
                        >
                          {updatingId === order.id ? "..." : {
                            confirmado: "Confirmar",
                            listo: "Marcar listo",
                            entregado: "Entregar",
                            cancelado: "Cancelar",
                          }[nextStatus] ?? nextStatus}
                        </Button>
                      ))
                    )}
                  </div>
                </div>

                {expanded && order.items && (
                  <div className="border-t border-border bg-muted/10 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Items</p>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.product_name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                          <span className="font-medium">${item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>${order.total_mxn}</span>
                      </div>
                    </div>
                    {order.notes && (
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                        Notas: {order.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
            </PaginationItem>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => {
                if (pagination.pages <= 7) return true
                if (p === 1 || p === pagination.pages) return true
                return Math.abs(p - page) <= 1
              })
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                return (
                  <PaginationItem key={p}>
                    {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                    <PaginationLink isActive={p === page} onClick={() => setPage(p)}>{p}</PaginationLink>
                  </PaginationItem>
                )
              })}
            <PaginationItem>
              <Button variant="ghost" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
