"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { MessageBubble } from "./MessageBubble"
import { AnalysisCard } from "./AnalysisCard"
import { QuoteCard } from "./QuoteCard"
import { LeadCaptureCard } from "./LeadCaptureCard"
import { LoadingDots } from "./LoadingDots"
import { QuickReplies } from "./QuickReplies"
import { InputBar } from "./InputBar"
import { SuggestedProductsCard } from "./SuggestedProductsCard"
import type { QuoteData, ProductSuggestion } from "@/lib/quote-parser"

type ChatState =
  | "IDLE"
  | "WELCOME"
  | "AWAITING_PHOTO"
  | "ANALYZING"
  | "AWAITING_LEAD"
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
  | { type: "suggested-products"; data: ProductSuggestion[] }
  | { type: "cta-photo" }
  | { type: "cta-booking" }
  | { type: "cta-login" }

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface PendingImage {
  base64: string
  mimeType: string
  previewUrl: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const COMPRESS_THRESHOLD = 1 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"]
const MAX_PHOTOS = 3

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

const LOADING_MESSAGES = [
  "📸 Fotos recibidas, analizando...",
  "🔍 Detectando raza y tamaño...",
  "🧴 Evaluando estado del pelaje...",
  "✂️ Calculando servicios y tiempo...",
]

const NUDOS_OPTIONS = ["Sí, bastantes", "Algunos", "No, está bien"]
const PHOTO_OPTIONS = ["Subir otra foto", "¡Cotizar ya!"]

export function ChatContainer({ onStepChange }: { onStepChange?: (step: number) => void }) {
  const { user } = useAuth()
  const [chatState, setChatState] = useState<ChatState>("IDLE")
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [apiHistory, setApiHistory] = useState<ChatMessage[]>([])
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [serviceHistory, setServiceHistory] = useState<string | null>(null)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const sessionIdRef = useRef<string>(crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const apiHistoryRef = useRef<ChatMessage[]>([])

  // Load service history if authenticated
  useEffect(() => {
    if (user?.clientId) {
      fetch("/api/dogs")
        .then((r) => r.json())
        .then(async (dogsJson) => {
          const dogs = dogsJson.data ?? []
          if (dogs.length > 0) {
            const res = await fetch(`/api/dogs/${dogs[0].id}`)
            const json = await res.json()
            const history = json.data?.service_history ?? []
            if (history.length > 0) {
              const entries = history
                .slice(0, 10)
                .map((s: { service_type: string; total_mxn: number; created_at: string; notes?: string }) =>
                  `- ${s.service_type} ($${s.total_mxn}) — ${new Date(s.created_at).toLocaleDateString("es-MX")}${s.notes ? ` — Notas: ${s.notes}` : ""}`
                )
                .join("\n")
              setServiceHistory(entries)
            }
          }
        })
        .catch(() => {})
    }
  }, [user?.clientId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Boot: welcome message
  useEffect(() => {
    if (chatState === "IDLE") {
      setChatState("WELCOME")
      const timer = setTimeout(() => {
        const msgs: MessageItem[] = [
          {
            type: "agent",
            content: user
              ? `¡Hola de nuevo, ${user.clientRole === "admin" ? "" : user.email?.split("@")[0] ?? ""}! 👋 Soy el groomer AI de Aideens.\nToma 1-3 fotos de tu perro (frente, lado, detrás) para una cotización más precisa.`
              : "¡Hola! 👋 Soy el groomer AI de Aideens, tu estética canina en Guadalajara.\nToma 1-3 fotos de tu perro (frente, lado, detrás) para una cotización más precisa.",
          },
        ]
        if (!user) {
          msgs.push({ type: "cta-login" })
        }
        msgs.push({ type: "cta-photo" })
        setMessages(msgs)
        setChatState("AWAITING_PHOTO")
        onStepChange?.(0)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add a photo (does NOT send to API yet) ──
  const handleAddPhoto = useCallback(
    async (file: File) => {
      if (chatState !== "AWAITING_PHOTO") return

      if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".heic")) {
        setMessages((prev) => [
          ...prev,
          { type: "agent", content: "Solo acepto imágenes JPG, PNG o WebP. ¿Intentas con otra?" },
        ])
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setMessages((prev) => [
          ...prev,
          { type: "agent", content: "La imagen es muy grande (máx 5 MB). ¿Intentas con otra más pequeña?" },
        ])
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setMessages((prev) => [
        ...prev,
        { type: "user", content: `Foto ${pendingImages.length + 1}`, imageUrl: previewUrl },
      ])

      let base64: string
      try {
        if (file.size > COMPRESS_THRESHOLD) {
          base64 = await compressImage(file, 0.8)
        } else {
          base64 = await fileToBase64(file)
        }
      } catch {
        return
      }

      const mimeType = file.type === "image/heic" ? "image/jpeg" : file.type
      const newImage: PendingImage = { base64, mimeType, previewUrl }
      const updatedPending = [...pendingImages, newImage]
      setPendingImages(updatedPending)

      if (updatedPending.length >= MAX_PHOTOS) {
        // Auto-start analysis when max photos reached
        setMessages((prev) => prev.filter((m) => m.type !== "quick-replies"))
        await handleStartAnalysis(updatedPending)
      } else {
        // Remove previous quick-replies and show new ones
        setMessages((prev) =>
          [...prev.filter((m) => m.type !== "quick-replies"),
            { type: "quick-replies" as const, options: PHOTO_OPTIONS }]
        )
      }
    },
    [chatState, pendingImages]
  )

  // ── Send all collected photos to API ──
  const handleStartAnalysis = useCallback(
    async (images: PendingImage[]) => {
      setChatState("ANALYZING")
      onStepChange?.(1)
      setIsLoading(true)

      // Remove cta-photo and quick-replies
      setMessages((prev) =>
        prev.filter((m) => m.type !== "cta-photo" && m.type !== "quick-replies")
      )

      // Show loading messages with staggered delay
      for (let i = 0; i < LOADING_MESSAGES.length; i++) {
        await new Promise((r) => setTimeout(r, 700))
        setMessages((prev) => [...prev, { type: "loading" as const, content: LOADING_MESSAGES[i] }])
      }

      const userMsg: ChatMessage = {
        role: "user",
        content: "Analiza las fotos de mi perro y dame una cotización.",
      }

      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [userMsg],
            images: images.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
            serviceHistory: serviceHistory ?? undefined,
          }),
        })

        const data = await res.json()

        const history: ChatMessage[] = [userMsg, { role: "assistant" as const, content: data.text }]
        setApiHistory(history)
        apiHistoryRef.current = history

        if (data.quoteData) {
          setQuoteData(data.quoteData)
          setMessages((prev) => [
            ...prev,
            { type: "agent", content: user?.clientId
              ? "¡Ya analicé a tu peludo! ¿Cómo se llama tu perro?"
              : "¡Ya analicé a tu peludo! Antes de mostrarte los resultados, ¿cómo se llama tu perro y cuál es tu WhatsApp?" },
            { type: "lead-capture" },
          ])
          setChatState("AWAITING_LEAD")
        } else {
          setMessages((prev) => [...prev, { type: "agent", content: data.text }])
          setChatState("AWAITING_PHOTO")
          setMessages((prev) => [...prev, { type: "cta-photo" }])
        }
      } catch {
        setMessages((prev) =>
          prev.concat({ type: "agent", content: "Algo salió mal, ¿intentamos de nuevo?" })
            .concat({ type: "cta-photo" })
        )
        setChatState("AWAITING_PHOTO")
      } finally {
        setIsLoading(false)
      }
    },
    [serviceHistory, onStepChange]
  )

  // ── Handle lead save (before showing results) ──
  const handleLeadSave = useCallback(
    async (dogName: string, whatsapp: string) => {
      // Upload images to server, which stores them in Supabase Storage
      const imageData = pendingImages.map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType,
      }))

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dog_name: dogName,
          whatsapp,
          quote_data: quoteData,
          source: "cotizador_web",
          images: imageData,
        }),
      })

      if (!res.ok) throw new Error("Failed to save lead")
      const leadResult = await res.json()
      const savedImageUrls: string[] = leadResult.images ?? []

      setMessages((prev) => prev.filter((m) => m.type !== "lead-capture"))

      if (quoteData) {
        // Build rich conversation for the admin to see
        const analysisText = `Análisis:
• Raza: ${quoteData.analisis.raza}
• Tamaño: ${quoteData.analisis.tamano}
• Peso estimado: ${quoteData.analisis.peso_estimado}
• Pelaje: ${quoteData.analisis.pelaje}
• Condición: ${quoteData.analisis.condicion}`

        const quoteText = `Cotización:
${quoteData.cotizacion.map((s) => `• ${s.servicio}: $${s.precio}`).join("\n")}
Total: $${quoteData.total}
Duración: ${quoteData.duracion_horas} horas`

        const fullHistory: ChatMessage[] = [
          ...apiHistory,
          { role: "assistant", content: analysisText },
          { role: "assistant", content: `Corte sugerido: ${quoteData.analisis.corte_sugerido}` },
          { role: "assistant", content: quoteText },
          { role: "user", content: `Lead: ${dogName}, ${whatsapp}` },
        ]

        // Save conversation + lead data + images in one call
        try {
          await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionIdRef.current,
              channel: "web",
              messages: fullHistory,
              metadata: {
                phone: whatsapp,
                dog_name: dogName,
                images: savedImageUrls,
              },
            }),
          })
        } catch {
          // Non-critical
        }

        // Store fullHistory in a ref so nudos handler can update it
        apiHistoryRef.current = fullHistory

        setMessages((prev) => [
          ...prev,
          { type: "agent", content: `¡Gracias, ${dogName}! 🐾 Aquí está el análisis:` },
          { type: "analysis", data: quoteData.analisis },
          { type: "agent", content: "¿El análisis de tu perrito es correcto? Puedes corregir cualquier detalle antes de continuar." },
          { type: "quick-replies", options: ["Sí, está bien"] },
        ])
        setChatState("QUOTE_SHOWN")
        onStepChange?.(2)
      }
    },
    [quoteData, apiHistory, pendingImages, onStepChange]
  )

  // ── Handle quick reply ──
  const handleQuickReply = useCallback(
    async (option: string) => {
      setMessages((prev) => prev.filter((m) => m.type !== "quick-replies"))

      if (chatState === "AWAITING_PHOTO") {
        if (option === "Subir otra foto") {
          setMessages((prev) => [...prev, { type: "cta-photo" as const }])
          return
        }
        if (option === "¡Cotizar ya!") {
          await handleStartAnalysis(pendingImages)
          return
        }
        return
      }

      if (chatState !== "QUOTE_SHOWN" || !quoteData) return

      setMessages((prev) => [...prev, { type: "user", content: option }])

      // First question: confirm analysis
      if (option === "Sí, está bien") {
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            content: `Basado en el análisis, recomiendo un corte **${quoteData.analisis.corte_sugerido}**.`,
          },
          { type: "quote", data: quoteData },
          { type: "agent", content: "¿Tu perro tiene nudos o pelaje enredado?" },
          { type: "quick-replies", options: NUDOS_OPTIONS },
        ])
        return
      }

      setChatState("REFINING")
      setIsLoading(true)

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

      const adjustedQuote: QuoteData = {
        ...quoteData,
        cotizacion: adjustment > 0
          ? [...quoteData.cotizacion, { servicio: "Desenredo", precio: adjustment }]
          : quoteData.cotizacion,
        total: quoteData.total + adjustment,
      }

      const userMsg: ChatMessage = { role: "user", content: option }
      const newHistory = [...apiHistory, userMsg]

      let suggestions: ProductSuggestion[] | null = null
      let assistantMsg: ChatMessage | null = null
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newHistory,
            serviceHistory: serviceHistory ?? undefined,
          }),
        })
        const data = await res.json()
        assistantMsg = { role: "assistant", content: data.text }
        setApiHistory([...newHistory, assistantMsg])
        if (data.productSuggestions) suggestions = data.productSuggestions
      } catch {
        // Continue with local adjustment if API fails
      }

      setQuoteData(adjustedQuote)
      if (suggestions) setProductSuggestions(suggestions)

      const updatedMessages: MessageItem[] = [
        { type: "agent", content: adjustmentText + "\nAquí está tu cotización final:" },
        { type: "quote", data: adjustedQuote, isFinal: true },
      ]

      if (suggestions && suggestions.length > 0) {
        updatedMessages.push(
          { type: "agent", content: "También te recomiendo estos productos para tu peludo:" },
          { type: "suggested-products", data: suggestions },
        )
      }

      updatedMessages.push(
        { type: "agent", content: "Tu cotización ya está guardada. Cuando quieras agendar, haz clic aquí:" },
        { type: "cta-booking" },
      )

      setMessages((prev) => [...prev, ...updatedMessages])
      setChatState("FINAL_QUOTE")
      setIsLoading(false)

      // Update conversation in DB with nudos response
      try {
        const finalMessages = assistantMsg
          ? [...apiHistoryRef.current, userMsg, assistantMsg]
          : [...apiHistoryRef.current, userMsg]
        await fetch("/api/conversations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            messages: finalMessages,
          }),
        })
      } catch {
        // Non-critical
      }
    },
    [chatState, quoteData, apiHistory, serviceHistory, pendingImages, handleStartAnalysis]
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
        setMessages((prev) => [...prev, { type: "agent", content: "Algo salió mal, ¿intentamos de nuevo?" }])
      } finally {
        setIsLoading(false)
      }
    },
    [apiHistory, isLoading]
  )

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
            onSave={(updated) => {
              setQuoteData((prev) => {
                if (!prev) return prev
                return { ...prev, analisis: { ...updated, corte_sugerido: prev.analisis.corte_sugerido } }
              })
            }}
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
        return (
          <LeadCaptureCard
            key={index}
            onSubmit={handleLeadSave}
            defaultPhone={user?.phone ?? undefined}
            hidePhone={!!(user?.clientId && user?.phone)}
          />
        )
      case "suggested-products":
        return <SuggestedProductsCard key={index} products={item.data} />
      case "cta-photo":
        return (
          <div key={index} className="flex justify-center">
            <label className="cursor-pointer px-8 py-4 rounded-full font-sans text-base font-medium bg-gold text-warm-dark hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] transition-all duration-300 inline-flex items-center gap-2">
              {pendingImages.length === 0 ? "📷 Subir foto" : "📷 Subir otra foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAddPhoto(file)
                  e.target.value = ""
                }}
                className="hidden"
              />
            </label>
          </div>
        )
      case "cta-login":
        return (
          <div key={index} className="flex justify-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal"))}
              className="px-6 py-2.5 rounded-full font-sans text-sm font-medium border border-gold/40 text-gold hover:bg-gold/10 transition-all duration-300 inline-flex items-center gap-2"
            >
              🔑 Ya soy cliente — Iniciar sesión
            </button>
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
        onSendImage={handleAddPhoto}
        disabled={isLoading || chatState === "LEAD_SAVED" || chatState === "AWAITING_LEAD"}
      />
    </div>
  )
}
