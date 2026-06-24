"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  role: string
  archived: boolean
  created_at: string
  last_seen: string | null
}

export default function AdminClientes() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true)
      try {
        const params = search ? `?q=${encodeURIComponent(search)}` : ""
        const res = await fetch(`/api/admin/clients${params}`)
        const json = await res.json()
        setClients(json.data ?? [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadClients()
  }, [search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-dark">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona los clientes registrados</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Contacto</th>
                  <th className="text-left p-3 font-medium">Rol</th>
                  <th className="text-left p-3 font-medium">Registro</th>
                  <th className="text-left p-3 font-medium">Última vez</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((c) => (
                  <tr key={c.id} className={cn("hover:bg-muted/50 transition-colors", c.archived && "opacity-50")}>
                    <td className="p-3">
                      <p className="font-medium">{c.name}</p>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        {c.phone && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" /> {c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" /> {c.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={cn("text-[10px]", c.role === "admin" ? "bg-gold/20 text-gold" : "bg-blue-100 text-blue-800")}>
                        {c.role}
                      </Badge>
                      {c.archived && <Badge className="ml-1 text-[10px] bg-red-100 text-red-800">Archivado</Badge>}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("es-MX")}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {c.last_seen ? new Date(c.last_seen).toLocaleDateString("es-MX") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No hay clientes</p>
          )}
        </div>
      )}
    </div>
  )
}
