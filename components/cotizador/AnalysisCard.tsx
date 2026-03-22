"use client"

interface AnalysisCardProps {
  raza: string
  tamano: string
  peso_estimado: string
  pelaje: string
  condicion: string
  corte_sugerido: string
}

export function AnalysisCard({
  raza,
  tamano,
  peso_estimado,
  pelaje,
  condicion,
  corte_sugerido,
}: AnalysisCardProps) {
  return (
    <div
      className="w-full"
      style={{
        background: "rgba(201, 168, 76, 0.08)",
        border: "1px solid rgba(201, 168, 76, 0.3)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg">🐕</span>
        <div>
          <h3 className="font-serif text-lg text-cream">{raza}</h3>
          <p className="font-sans text-[13px] text-sage">
            Tamaño {tamano} · ~{peso_estimado}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <p className="font-sans text-sm text-cream/80">
          Pelaje {pelaje} · {condicion}
        </p>
        <p className="font-sans text-sm">
          <span className="text-cream/60">Corte sugerido: </span>
          <span className="text-gold font-medium">{corte_sugerido}</span>
        </p>
      </div>
    </div>
  )
}
