"use client"

import { useState } from "react"

interface LeadCaptureCardProps {
  onSubmit: (dogName: string, whatsapp: string) => Promise<void>
}

export function LeadCaptureCard({ onSubmit }: LeadCaptureCardProps) {
  const [dogName, setDogName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const isValid = dogName.trim().length >= 2 && whatsapp.replace(/\D/g, "").length >= 10

  async function handleSubmit() {
    if (!isValid || isSubmitting) return
    setError("")
    setIsSubmitting(true)
    try {
      await onSubmit(dogName.trim(), whatsapp.trim())
      setSaved(true)
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (saved) {
    return (
      <div
        className="w-full"
        style={{
          background: "rgba(201, 168, 76, 0.06)",
          border: "1px solid rgba(201, 168, 76, 0.25)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <p className="font-sans text-sm text-gold">
          ✓ ¡Guardado! Te contactamos pronto, {dogName}.
        </p>
      </div>
    )
  }

  return (
    <div
      className="w-full"
      style={{
        background: "rgba(201, 168, 76, 0.06)",
        border: "1px solid rgba(201, 168, 76, 0.25)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <p className="font-sans text-sm font-medium text-cream mb-3">
        ¿A dónde te mando tu cotización?
      </p>

      <div className="space-y-3">
        <div>
          <label className="font-sans text-xs text-cream/60 mb-1 block">
            Nombre del perro
          </label>
          <input
            type="text"
            placeholder="Rex, Mochi..."
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg font-sans text-sm bg-white/10 border border-white/10 text-cream placeholder:text-cream/30 outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div>
          <label className="font-sans text-xs text-cream/60 mb-1 block">
            Tu WhatsApp
          </label>
          <input
            type="tel"
            placeholder="+52 33 ..."
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full px-3 py-2 rounded-lg font-sans text-sm bg-white/10 border border-white/10 text-cream placeholder:text-cream/30 outline-none focus:border-gold/50 transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="font-sans text-xs text-red-400 mt-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className="mt-4 w-full py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: isValid ? "#C9A84C" : "rgba(201, 168, 76, 0.3)",
          color: "#1C1814",
        }}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Guardando...
          </span>
        ) : (
          "Guardar cotización →"
        )}
      </button>
    </div>
  )
}
