"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

// Types
type QuoteData = {
  analisis: {
    raza: string
    tamano: string
    pelaje: string
    condicion: string
    corte_sugerido: string
  }
  cotizacion: { servicio: string; precio: number }[]
  total: number
  duracion_horas: number
  nota: string
}

type Message = {
  id: string
  role: "user" | "agent"
  content: string
  imageUrl?: string
  quoteData?: QuoteData | null
  isLoading?: boolean
  loadingStep?: number
}

type FlowState = "idle" | "analyzing" | "quote_shown" | "refining" | "final_cta"

const LOADING_MESSAGES = [
  "Analizando raza...",
  "Evaluando estado del pelaje...",
  "Calculando tiempo de grooming...",
  "Preparando tu cotizacion personalizada...",
]

// Quote Card Component
function QuoteCard({ quoteData, onBooking }: { quoteData: QuoteData; onBooking: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl overflow-hidden border border-gold/30 bg-warm-dark/50"
    >
      {/* Analysis Header */}
      <div className="p-4 border-b border-gold/20 bg-gold/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                <ellipse cx="12" cy="17" rx="3.5" ry="4" />
                <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
                <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
                <ellipse cx="8" cy="7" rx="2" ry="2.5" />
                <ellipse cx="16" cy="7" rx="2" ry="2.5" />
              </svg>
            </div>
            <div>
              <span className="text-cream font-semibold">{quoteData.analisis.raza}</span>
              <span className="ml-2 px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full capitalize">
                {quoteData.analisis.tamano}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="text-cream/70">
            <span className="text-cream/50">Pelaje:</span> {quoteData.analisis.pelaje}
          </div>
          <div className="text-cream/70">
            <span className="text-cream/50">Condicion:</span> {quoteData.analisis.condicion}
          </div>
          <div className="text-cream/70 col-span-2">
            <span className="text-cream/50">Corte sugerido:</span> {quoteData.analisis.corte_sugerido}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="p-4">
        <table className="w-full text-sm">
          <tbody>
            {quoteData.cotizacion.map((item, idx) => (
              <tr key={idx} className="border-b border-cream/10 last:border-0">
                <td className="py-2 text-cream/80">{item.servicio}</td>
                <td className="py-2 text-right text-gold font-medium">${item.precio}</td>
              </tr>
            ))}
            <tr className="border-t border-gold/30">
              <td className="py-3 text-cream font-semibold">Total estimado</td>
              <td className="py-3 text-right text-gold font-bold text-lg">${quoteData.total}</td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-3 flex items-center gap-2 text-cream/60 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Duracion aprox: {quoteData.duracion_horas} hrs
        </div>

        {/* CTA Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={onBooking}
            className="w-full py-3 bg-gold text-warm-dark font-semibold rounded-lg hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Agendar cita
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Loading Indicator
function LoadingIndicator({ step }: { step: number }) {
  return (
    <div className="space-y-2">
      {LOADING_MESSAGES.slice(0, step + 1).map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: idx === step ? 1 : 0.5, x: 0 }}
          className="flex items-center gap-2 text-sm text-cream/80"
        >
          {idx < step ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : idx === step ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full"
            />
          ) : null}
          <span>{msg}</span>
        </motion.div>
      ))}
    </div>
  )
}

// Message Bubble
function MessageBubble({ message, onBooking }: { message: Message; onBooking: () => void }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 ${
          isUser
            ? "bg-gold text-warm-dark rounded-[18px_18px_4px_18px]"
            : "bg-white/8 border border-white/12 text-cream rounded-[18px_18px_18px_4px]"
        }`}
      >
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden">
            <Image
              src={message.imageUrl}
              alt="Foto de mascota"
              width={200}
              height={200}
              className="object-cover"
            />
          </div>
        )}
        
        {message.isLoading ? (
          <LoadingIndicator step={message.loadingStep || 0} />
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            {message.quoteData && (
              <QuoteCard quoteData={message.quoteData} onBooking={onBooking} />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

// Main QuoteChat Component
export function QuoteChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [flowState, setFlowState] = useState<FlowState>("idle")
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Welcome message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: "welcome",
          role: "agent",
          content: "Hola! Soy el asistente de grooming de Aideens Estetica Canina.\n\nTomale una foto a tu perro tal como esta ahora mismo — sin arreglar, sin peinar — y te digo exactamente que necesita y cuanto cuesta.",
        },
      ])
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBooking = () => {
    const bookingSection = document.getElementById("contacto")
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    setFlowState("analyzing")

    // Create image preview URL
    const imageUrl = URL.createObjectURL(file)

    // Add user message with image
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Analiza esta foto de mi perro",
      imageUrl,
    }
    setMessages((prev) => [...prev, userMessage])

    // Add loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: "agent",
      content: "",
      isLoading: true,
      loadingStep: 0,
    }
    setMessages((prev) => [...prev, loadingMessage])

    // Animate through loading steps
    for (let i = 0; i < LOADING_MESSAGES.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessage.id ? { ...m, loadingStep: i } : m
        )
      )
    }

    // Convert file to base64
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = async () => {
      const base64String = reader.result as string
      const base64Data = base64String.split(",")[1]
      const mimeType = file.type

      try {
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType,
          }),
        })

        const data = await response.json()

        // Remove loading message and add response
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== loadingMessage.id)
          return [
            ...filtered,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              content: data.text || "Aqui esta tu cotizacion personalizada:",
              quoteData: data.quoteData,
            },
          ]
        })

        setFlowState("quote_shown")
      } catch (error) {
        // Remove loading and show error
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== loadingMessage.id)
          return [
            ...filtered,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              content: "Lo siento, hubo un problema al analizar la imagen. Por favor intenta de nuevo.",
            },
          ]
        })
        setFlowState("idle")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file)
    }
  }

  return (
    <div className="flex flex-col h-[520px] bg-warm-dark/80 rounded-2xl overflow-hidden border border-cream/10 shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cream/10 bg-warm-dark">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
              <ellipse cx="12" cy="17" rx="3.5" ry="4" />
              <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
              <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
              <ellipse cx="8" cy="7" rx="2" ry="2.5" />
              <ellipse cx="16" cy="7" rx="2" ry="2.5" />
            </svg>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sage rounded-full border-2 border-warm-dark" />
        </div>
        <div>
          <div className="font-sans font-medium text-cream text-sm">Groomer AI</div>
          <div className="font-sans text-xs text-sage">En linea</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cream/10">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onBooking={scrollToBooking} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-cream/10 bg-warm-dark">
        {flowState === "idle" || flowState === "quote_shown" ? (
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 py-3 bg-gold text-warm-dark font-sans font-semibold rounded-xl hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              {flowState === "quote_shown" ? "Subir otra foto" : "Tomar foto / subir imagen"}
            </button>
          </div>
        ) : (
          <div className="text-center text-cream/50 text-sm py-2">
            Analizando tu foto...
          </div>
        )}
      </div>
    </div>
  )
}
