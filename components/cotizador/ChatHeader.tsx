"use client"

export function ChatHeader() {
  return (
    <div
      className="flex items-center gap-3 px-6 shrink-0"
      style={{
        height: 64,
        background: "rgba(28, 24, 20, 0.95)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
      }}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
          <ellipse cx="12" cy="17" rx="3.5" ry="4" />
          <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
          <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
          <ellipse cx="8" cy="7" rx="2" ry="2.5" />
          <ellipse cx="16" cy="7" rx="2" ry="2.5" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-sans text-sm font-medium text-cream">Groomer AI</span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-cream/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          En línea
        </span>
      </div>
    </div>
  )
}
