"use client"

interface QuoteCardProps {
  items: { servicio: string; precio: number }[]
  total: number
  duracion_horas: number
  isFinal?: boolean
}

export function QuoteCard({ items, total, duracion_horas, isFinal }: QuoteCardProps) {
  return (
    <div
      className="w-full"
      style={{
        background: isFinal
          ? "rgba(201, 168, 76, 0.08)"
          : "rgba(255, 255, 255, 0.04)",
        border: isFinal
          ? "1px solid rgba(201, 168, 76, 0.3)"
          : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      {isFinal && (
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-gold mb-3">
          Cotización Final
        </p>
      )}

      {/* Header */}
      <div className="flex justify-between font-sans text-[11px] uppercase tracking-wider text-cream/50 mb-2">
        <span>Servicio</span>
        <span>Precio</span>
      </div>

      <div className="h-px bg-white/10 mb-2" />

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between font-sans text-sm text-cream/90">
            <span>{item.servicio}</span>
            <span>${item.precio.toLocaleString("es-MX")}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-white/10 my-2" />

      {/* Total */}
      <div className="flex justify-between font-sans text-sm font-bold text-gold">
        <span>TOTAL estimado</span>
        <span>${total.toLocaleString("es-MX")}</span>
      </div>

      {/* Duration */}
      <p className="font-sans text-xs text-sage mt-2">
        ⏱ Duración aprox. {duracion_horas} {duracion_horas === 1 ? "hr" : "hrs"}
      </p>
    </div>
  )
}
