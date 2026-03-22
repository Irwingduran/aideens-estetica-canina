"use client"

export function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div
        className="px-4 py-3 flex items-center gap-1"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: "4px 18px 18px 18px",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}
