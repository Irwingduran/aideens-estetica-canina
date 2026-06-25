"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Search, ChevronDown, ChevronUp, ExternalLink, MessageCircle, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ConversationItem {
  id: string
  session_id: string | null
  channel: string
  phone: string
  dog_name: string | null
  total_mxn: number | null
  contacted: boolean
  message_count: number
  last_message: string | null
  messages: { role: string; content: string }[]
  lead_id: string | null
  created_at: string
  updated_at: string
}

export default function AdminConversaciones() {
  const [items, setItems] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set("q", search)
        const res = await fetch(`/api/admin/conversations?${params}`)
        const json = await res.json()
        setItems(json.data ?? [])
      } catch {
        toast({ title: "Error", description: "No se pudieron cargar las conversaciones", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search])

  async function markContacted(id: string, leadId: string | null, current: boolean) {
    if (!leadId) return
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacted: !current }),
      })
      if (!res.ok) throw new Error()
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, contacted: !current } : i)))
      toast({ title: current ? "Marcada como no contactada" : "Marcada como contactada" })
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-dark">Conversaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length > 0 ? `${items.length} conversacione${items.length !== 1 ? "s" : ""}` : "Chats y leads del cotizador"}
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No hay conversaciones aún</p>
          <p className="text-xs text-muted-foreground mt-1">
            Las conversaciones del cotizador aparecerán aquí automáticamente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ConversationCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onMarkContacted={() => markContacted(item.id, item.lead_id, item.contacted)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ConversationCard({
  item,
  expanded,
  onToggle,
  onMarkContacted,
}: {
  item: ConversationItem
  expanded: boolean
  onToggle: () => void
  onMarkContacted: () => void
}) {
  const waLink = item.phone
    ? `https://wa.me/${item.phone.replace(/\s+/g, "").replace(/^\+/, "")}`
    : null

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <div className="min-w-0">
            <p className="font-medium truncate">{item.dog_name ?? "—"}</p>
            {item.phone && (
              <p className="text-xs text-muted-foreground truncate">{item.phone}</p>
            )}
          </div>
          {item.total_mxn != null && (
            <p className="font-medium text-sm">${item.total_mxn}</p>
          )}
          <div className="flex items-center gap-2">
            {item.contacted ? (
              <Badge className="bg-green-100 text-green-700 text-[10px]">Contactado</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 text-[10px]">Nuevo</Badge>
            )}
            {item.message_count > 0 && (
              <span className="text-xs text-muted-foreground">{item.message_count} msgs</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {new Date(item.created_at).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {item.messages.length > 0 ? (
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto bg-muted/20">
              {item.messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-sm p-3 rounded-lg max-w-[80%]",
                    msg.role === "user"
                      ? "bg-gold/20 text-warm-dark ml-auto"
                      : "bg-card border border-border"
                  )}
                >
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase font-medium">
                    {msg.role === "user" ? "Cliente" : "Asistente"}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Sin historial de mensajes
              {item.lead_id && (
                <p className="text-xs mt-1">
                  Cotización guardada — {item.dog_name ?? "sin nombre"}, ${item.total_mxn ?? "—"}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 p-3 border-t border-border bg-muted/10">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
            {item.lead_id && (
              <button
                onClick={onMarkContacted}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
                  item.contacted
                    ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                    : "text-green-600 hover:text-green-700 hover:bg-green-50"
                )}
              >
                <Check className="w-3.5 h-3.5" />
                {item.contacted ? "Marcar como nuevo" : "Marcar contactado"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
