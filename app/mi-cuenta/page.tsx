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
import { PawPrint, Package, Scissors, MessageSquare, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Dog {
  id: string
  name: string
  breed: string | null
  size: string | null
  avatar_url: string | null
  notes: string | null
}

interface Order {
  id: string
  status: string
  total_mxn: number
  total_items: number
  created_at: string
  dog: { id: string; name: string; breed: string } | null
}

interface ServiceRecord {
  id: string
  service_type: string
  total_mxn: number
  created_at: string
  dog: { name: string; breed: string | null } | null
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pendiente: { label: "Pendiente", class: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", class: "bg-blue-100 text-blue-800" },
  listo: { label: "Listo", class: "bg-green-100 text-green-800" },
  entregado: { label: "Entregado", class: "bg-emerald-100 text-emerald-800" },
  cancelado: { label: "Cancelado", class: "bg-red-100 text-red-800" },
}

function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}

export default function MiCuentaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<{ id: string; name: string; phone: string | null; email: string | null; dogs: Dog[] } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/?auth=required")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const profileRes = await fetch("/api/clients/me")
        if (!profileRes.ok) return
        const profileJson = await profileRes.json()
        setProfile(profileJson.data)

        if (profileJson.data?.id) {
          const ordersRes = await fetch(`/api/orders?client_id=${profileJson.data.id}&limit=5`)
          const ordersJson = await ordersRes.json()
          setOrders((ordersJson.data ?? []).slice(0, 5))

          const servicesRes = await fetch("/api/service-history?limit=5")
          const servicesJson = await servicesRes.json()
          setServices(servicesJson.data ?? [])
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-cream">
        <Navbar />
        <DashboardSkeleton />
        <Footer />
      </main>
    )
  }

  if (!profile) return null

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-warm-dark">Mi Cuenta</h1>
            <p className="text-sm text-muted-foreground mt-1">{profile.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link href="/mi-cuenta/perros" className="bg-card rounded-xl border border-border p-4 hover:border-gold/50 transition-colors">
            <PawPrint className="w-5 h-5 text-gold mb-2" />
            <p className="text-2xl font-bold">{profile.dogs?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Perros</p>
          </Link>
          <Link href="/mi-cuenta/pedidos" className="bg-card rounded-xl border border-border p-4 hover:border-gold/50 transition-colors">
            <Package className="w-5 h-5 text-gold mb-2" />
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Pedidos</p>
          </Link>
          <div className="bg-card rounded-xl border border-border p-4">
            <Scissors className="w-5 h-5 text-gold mb-2" />
            <p className="text-2xl font-bold">{services.length}</p>
            <p className="text-xs text-muted-foreground">Servicios</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <MessageSquare className="w-5 h-5 text-gold mb-2" />
            <p className="text-2xl font-bold">{services.length}</p>
            <p className="text-xs text-muted-foreground">Cotizaciones</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-warm-dark">Mis Perros</h2>
              <Link href="/mi-cuenta/perros" className="text-xs text-gold hover:underline">
                Ver todos
              </Link>
            </div>
            {profile.dogs && profile.dogs.length > 0 ? (
              <div className="space-y-3">
                {profile.dogs.slice(0, 3).map((dog) => (
                  <div key={dog.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blush/30 flex items-center justify-center text-sm font-bold text-warm-dark">
                        {dog.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{dog.name}</p>
                        <p className="text-xs text-muted-foreground">{dog.breed || dog.size || "Sin raza"}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
                {profile.dogs.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{profile.dogs.length - 3} más
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">Aún no has registrado perros</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/mi-cuenta/perros">
                    <Plus className="w-4 h-4 mr-1" />
                    Registrar perro
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-warm-dark">Últimos Pedidos</h2>
              <Link href="/mi-cuenta/pedidos" className="text-xs text-gold hover:underline">
                Ver todos
              </Link>
            </div>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => {
                  const config = statusConfig[order.status] ?? { label: order.status, class: "bg-gray-100 text-gray-800" }
                  return (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          ${order.total_mxn} — {order.dog?.name ?? "General"}
                        </p>
                      </div>
                      <Badge className={cn("text-[10px] font-medium", config.class)}>
                        {config.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Aún no tienes pedidos</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/productos">Ver productos</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {services.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-warm-dark">Historial de Servicios</h2>
            </div>
            <div className="space-y-3">
              {services.map((svc) => (
                <div key={svc.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{svc.service_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {svc.dog?.name ?? "General"} — {new Date(svc.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">${svc.total_mxn?.toLocaleString("es-MX") ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
