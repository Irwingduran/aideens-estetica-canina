"use client"

import { useRef, useState } from "react"

interface InputBarProps {
  onSendMessage: (text: string) => void
  onSendImage: (file: File) => void
  disabled?: boolean
}

export function InputBar({ onSendMessage, onSendImage, disabled }: InputBarProps) {
  const [text, setText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSendMessage(text.trim())
    setText("")
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onSendImage(file)
    // Reset so same file can be re-selected
    e.target.value = ""
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 px-4 shrink-0"
      style={{
        height: 72,
        background: "rgba(28, 24, 20, 0.98)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Attach button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-cream/50 hover:text-gold transition-colors disabled:opacity-30"
        aria-label="Subir imagen"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe un mensaje..."
        disabled={disabled}
        className="flex-1 px-4 py-2.5 rounded-full font-sans text-sm bg-white/10 border border-white/8 text-cream placeholder:text-cream/30 outline-none focus:border-gold/40 transition-colors disabled:opacity-30"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="p-2.5 rounded-full bg-gold text-warm-dark transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(201,168,76,0.4)]"
        aria-label="Enviar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  )
}
