"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

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

interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminClientes() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, pages: 0 })
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const debounceSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300)
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedSearch) params.set("q", debouncedSearch)
        params.set("page", String(page))
        const res = await fetch(`/api/admin/clients?${params}`)
        const json = await res.json()
        setClients(json.data ?? [])
        setPagination(json.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 })
      } catch {
        toast({ title: "Error", description: "No se pudieron cargar los clientes", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [debouncedSearch, page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-dark">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pagination.total > 0
            ? `${pagination.total} cliente${pagination.total !== 1 ? "s" : ""}`
            : "Gestiona los clientes registrados"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); debounceSearch(e.target.value) }}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No hay clientes</p>
          <p className="text-xs text-muted-foreground mt-1">
            {debouncedSearch ? "No se encontraron clientes con ese criterio" : "Los clientes aparecerán aquí cuando se registren"}
          </p>
        </div>
      ) : (
        <>
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
          </div>

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
        </>
      )}
    </div>
  )
}
