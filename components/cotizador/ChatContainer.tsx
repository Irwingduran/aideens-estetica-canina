"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageBubble } from "./MessageBubble"
import { AnalysisCard } from "./AnalysisCard"
import { QuoteCard } from "./QuoteCard"
import { LeadCaptureCard } from "./LeadCaptureCard"
import { LoadingDots } from "./LoadingDots"
import { QuickReplies } from "./QuickReplies"
import { InputBar } from "./InputBar"
import type { QuoteData } from "@/lib/quote-parser"

// ── State machine ──
type ChatState =
  | "IDLE"
  | "WELCOME"
  | "AWAITING_PHOTO"
  | "ANALYZING"
  | "QUOTE_SHOWN"
  | "REFINING"
  | "FINAL_QUOTE"
  | "LEAD_SAVED"

type MessageItem =
  | { type: "agent"; content: string }
  | { type: "user"; content: string; imageUrl?: string }
  | { type: "analysis"; data: QuoteData["analisis"] }
  | { type: "quote"; data: QuoteData; isFinal?: boolean }
  | { type: "quick-replies"; options: string[] }
  | { type: "lead-capture" }
  | { type: "loading"; content: string }
  | { type: "cta-photo" }
  | { type: "cta-booking" }

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// ── Helpers ──
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const COMPRESS_THRESHOLD = 1 * 1024 * 1024 // 1 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"]

function compressImage(file: File, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas not supported"))
        ctx.drawImage(img, 0, 0)
        // Get base64 without the data:... prefix
        const dataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(dataUrl.split(",")[1])
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Loading messages sequence ──
const LOADING_MESSAGES = [
  "📸 Foto recibida, analizando...",
  "🔍 Detectando raza y tamaño...",
  "🧴 Evaluando estado del pelaje...",
  "✂️ Calculando servicios y tiempo...",
]

// ── Nudos adjustment options ──
const NUDOS_OPTIONS = ["Sí, bastantes", "Algunos", "No, está bien"]

export function ChatContainer({ onStepChange }: { onStepChange?: (step: number) => void }) {
  const [chatState, setChatState] = useState<ChatState>("IDLE")
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [apiHistory, setApiHistory] = useState<ChatMessage[]>([])
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Boot: welcome message
  useEffect(() => {
    if (chatState === "IDLE") {
      setChatState("WELCOME")
      const timer = setTimeout(() => {
        setMessages([
          {
            type: "agent",
            content:
              "¡Hola! 👋 Soy el groomer AI de Aideens, tu estética canina en Guadalajara.\nTómale foto a tu perro tal como está — sin arreglar — y te cotizo al instante.",
          },
          { type: "cta-photo" },
        ])
        setChatState("AWAITING_PHOTO")
        onStepChange?.(0)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send image to API ──
  const handleSendImage = useCallback(
    async (file: File) => {
      if (chatState !== "AWAITING_PHOTO") return

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".heic")) {
        setMessages((prev) => [
          ...prev,
          { type: "agent", content: "Solo acepto imágenes JPG, PNG o WebP. ¿Intentas con otra?" },
        ])
        return
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setMessages((prev) => [
          ...prev,
          { type: "agent", content: "La imagen es muy grande (máx 5 MB). ¿Intentas con otra más pequeña?" },
        ])
        return
      }

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file)
      setMessages((prev) => [
        ...prev,
        { type: "user", content: "", imageUrl: previewUrl },
      ])

      // Start analyzing state
      setChatState("ANALYZING")
      onStepChange?.(1)
      setIsLoading(true)

      // Show loading messages with staggered delay
      for (let i = 0; i < LOADING_MESSAGES.length; i++) {
        await new Promise((r) => setTimeout(r, 700))
        setMessages((prev) => [...prev, { type: "loading", content: LOADING_MESSAGES[i] }])
      }

      // Compress if needed & convert
      let base64: string
      try {
        if (file.size > COMPRESS_THRESHOLD) {
          base64 = await compressImage(file, 0.8)
        } else {
          base64 = await fileToBase64(file)
        }
      } catch {
        setMessages((prev) =>
          prev
            .filter((m) => m.type !== "loading")
            .concat({ type: "agent", content: "No pude procesar la imagen. ¿Intentas con otra?" })
        )
        setChatState("AWAITING_PHOTO")
        setIsLoading(false)
        return
      }

      const mimeType = file.type === "image/heic" ? "image/jpeg" : file.type
      const userMsg: ChatMessage = {
        role: "user",
        content: "Analiza esta foto de mi perro y dame una cotización.",
      }

      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [userMsg],
            imageBase64: base64,
            mimeType,
          }),
        })

        const data = await res.json()

        // Remove loading messages
        setMessages((prev) => prev.filter((m) => m.type !== "loading"))

        // Update API history
        const assistantMsg: ChatMessage = { role: "assistant", content: data.text }
        setApiHistory([userMsg, assistantMsg])

        if (data.quoteData) {
          setQuoteData(data.quoteData)
          setMessages((prev) => [
            ...prev,
            { type: "agent", content: "¡Listo! Aquí está el análisis de tu peludo:" },
            { type: "analysis", data: data.quoteData.analisis },
            { type: "quote", data: data.quoteData },
            { type: "agent", content: "¿Tu perro tiene nudos o pelaje enredado?" },
            { type: "quick-replies", options: NUDOS_OPTIONS },
          ])
          setChatState("QUOTE_SHOWN")
          onStepChange?.(2)
        } else {
          setMessages((prev) => [...prev, { type: "agent", content: data.text }])
          // If no quote data, go back to awaiting photo
          setChatState("AWAITING_PHOTO")
          setMessages((prev) => [...prev, { type: "cta-photo" }])
        }
      } catch {
        setMessages((prev) =>
          prev
            .filter((m) => m.type !== "loading")
            .concat({ type: "agent", content: "Algo salió mal, ¿intentamos de nuevo?" })
            .concat({ type: "cta-photo" })
        )
        setChatState("AWAITING_PHOTO")
      } finally {
        setIsLoading(false)
      }
    },
    [chatState, onStepChange]
  )

  // ── Handle quick reply (nudos) ──
  const handleQuickReply = useCallback(
    async (option: string) => {
      if (chatState !== "QUOTE_SHOWN" || !quoteData) return

      // Remove quick-replies from messages
      setMessages((prev) => prev.filter((m) => m.type !== "quick-replies"))

      // Show user selection
      setMessages((prev) => [...prev, { type: "user", content: option }])

      setChatState("REFINING")
      setIsLoading(true)

      // Adjust quote based on selection
      let adjustment = 0
      let adjustmentText = ""
      if (option === "Sí, bastantes") {
        adjustment = 150
        adjustmentText = "Entendido, como tiene bastantes nudos agregamos $150 por desenredo severo."
      } else if (option === "Algunos") {
        adjustment = 80
        adjustmentText = "Ok, por algunos nudos agregamos $80 por desenredo leve."
      } else {
        adjustmentText = "¡Perfecto! Sin nudos, el precio se mantiene igual."
      }

      // Build adjusted quote
      const adjustedQuote: QuoteData = {
        ...quoteData,
        cotizacion: adjustment > 0
          ? [...quoteData.cotizacion, { servicio: "Desenredo", precio: adjustment }]
          : quoteData.cotizacion,
        total: quoteData.total + adjustment,
      }

      // Also send to API for conversational response
      const userMsg: ChatMessage = { role: "user", content: option }
      const newHistory = [...apiHistory, userMsg]

      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newHistory }),
        })
        const data = await res.json()
        const assistantMsg: ChatMessage = { role: "assistant", content: data.text }
        setApiHistory([...newHistory, assistantMsg])
      } catch {
        // Continue with local adjustment if API fails
      }

      setQuoteData(adjustedQuote)
      setMessages((prev) => [
        ...prev,
        { type: "agent", content: adjustmentText + "\nAquí está tu cotización final:" },
        { type: "quote", data: adjustedQuote, isFinal: true },
        { type: "agent", content: "¿A dónde te mando el resumen?" },
        { type: "lead-capture" },
      ])
      setChatState("FINAL_QUOTE")
      setIsLoading(false)
    },
    [chatState, quoteData, apiHistory]
  )

  // ── Handle lead save ──
  const handleLeadSave = useCallback(
    async (dogName: string, whatsapp: string) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dog_name: dogName,
          whatsapp,
          quote_data: quoteData,
          source: "cotizador_web",
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save lead")
      }

      setChatState("LEAD_SAVED")
      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          content: `¡Listo ${dogName}! 🎉 Te guardé la cotización.\nCuando quieras agendar, haz clic aquí:`,
        },
        { type: "cta-booking" },
      ])
    },
    [quoteData]
  )

  // ── Handle free text message ──
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return

      setMessages((prev) => [...prev, { type: "user", content: text }])
      setIsLoading(true)

      const userMsg: ChatMessage = { role: "user", content: text }
      const newHistory = [...apiHistory, userMsg]

      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newHistory }),
        })
        const data = await res.json()
        const assistantMsg: ChatMessage = { role: "assistant", content: data.text }
        setApiHistory([...newHistory, assistantMsg])
        setMessages((prev) => [...prev, { type: "agent", content: data.text }])
      } catch {
        setMessages((prev) => [
          ...prev,
          { type: "agent", content: "Algo salió mal, ¿intentamos de nuevo?" },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [apiHistory, isLoading]
  )

  // ── Render messages ──
  function renderItem(item: MessageItem, index: number) {
    switch (item.type) {
      case "agent":
        return <MessageBubble key={index} role="agent" content={item.content} />
      case "user":
        return <MessageBubble key={index} role="user" content={item.content} imageUrl={item.imageUrl} />
      case "loading":
        return <MessageBubble key={index} role="agent" content={item.content} />
      case "analysis":
        return (
          <AnalysisCard
            key={index}
            raza={item.data.raza}
            tamano={item.data.tamano}
            peso_estimado={item.data.peso_estimado}
            pelaje={item.data.pelaje}
            condicion={item.data.condicion}
            corte_sugerido={item.data.corte_sugerido}
          />
        )
      case "quote":
        return (
          <QuoteCard
            key={index}
            items={item.data.cotizacion}
            total={item.data.total}
            duracion_horas={item.data.duracion_horas}
            isFinal={item.isFinal}
          />
        )
      case "quick-replies":
        return <QuickReplies key={index} options={item.options} onSelect={handleQuickReply} />
      case "lead-capture":
        return <LeadCaptureCard key={index} onSubmit={handleLeadSave} />
      case "cta-photo":
        return (
          <div key={index} className="flex justify-center">
            <label className="cursor-pointer px-8 py-4 rounded-full font-sans text-base font-medium bg-gold text-warm-dark hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] transition-all duration-300 inline-flex items-center gap-2">
              📷 Tomar foto o subir imagen
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleSendImage(file)
                  e.target.value = ""
                }}
                className="hidden"
              />
            </label>
          </div>
        )
      case "cta-booking":
        return (
          <div key={index} className="flex justify-center">
            <a
              href="/#contacto"
              className="px-8 py-3 rounded-full font-sans text-sm font-medium bg-gold text-warm-dark hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] transition-all duration-300 inline-flex items-center gap-2"
            >
              📅 Agendar cita →
            </a>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        style={{ background: "#1C1814" }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((item, i) => renderItem(item, i))}
          {isLoading && messages.every((m) => m.type !== "loading") && <LoadingDots />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <InputBar
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        disabled={isLoading || chatState === "LEAD_SAVED"}
      />
    </div>
  )
}
