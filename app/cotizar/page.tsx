"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ChatContainer } from "@/components/cotizador/ChatContainer"

// ---------------------------------------------------------------------------
// Tipos y constantes
// ---------------------------------------------------------------------------

interface Step {
  label: string
  icon: React.ReactNode
}

const StepIcons = {
  photo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  analysis: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  quote: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
}

const STEPS: readonly Step[] = [
  { label: "Foto", icon: <StepIcons.photo /> },
  { label: "Análisis", icon: <StepIcons.analysis /> },
  { label: "Cotización", icon: <StepIcons.quote /> },
] as const

// ---------------------------------------------------------------------------
// Header integrado: ← back + brand + steps
// ---------------------------------------------------------------------------

function AppHeader({ activeStep }: { activeStep: number }) {
  return (
    <header
      className="shrink-0 flex items-center justify-between px-4 md:px-6"
      style={{
        height: 56,
        background: "rgba(28, 24, 20, 0.97)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.15)",
      }}
    >
      {/* Left: back + brand */}
      <Link
        href="/"
        className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
          <ellipse cx="12" cy="17" rx="3.5" ry="4" />
          <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
          <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
          <ellipse cx="8" cy="7" rx="2" ry="2.5" />
          <ellipse cx="16" cy="7" rx="2" ry="2.5" />
        </svg>
        <span className="hidden sm:inline font-serif text-sm text-cream/80">Aideens</span>
      </Link>

      {/* Right: step indicator */}
      <div className="flex items-center gap-1" role="list" aria-label="Progreso">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeStep
          const isCurrent = i === activeStep
          const isUpcoming = i > activeStep

          return (
            <div key={i} className="flex items-center" role="listitem">
              <div
                className={`
                  flex items-center gap-1.5 rounded-full font-sans transition-all duration-300
                  px-2 py-1 text-[11px] sm:px-2.5 sm:text-xs
                  ${isCompleted ? "bg-gold/20 text-gold font-semibold" : ""}
                  ${isCurrent ? "bg-gold/15 text-gold font-semibold ring-1 ring-gold/30" : ""}
                  ${isUpcoming ? "bg-white/5 text-cream/30" : ""}
                `}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Paso ${i + 1}: ${step.label}`}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.label}</span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`h-px mx-1 w-3 sm:w-6 transition-colors duration-300 ${
                    i < activeStep ? "bg-gold" : "bg-white/10"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function CotizarPage() {
  const [activeStep, setActiveStep] = useState(0)

  const handleStepChange = useCallback((step: number) => {
    setActiveStep(step)

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "step_reached", {
        step_number: step,
        step_name: STEPS[step]?.label,
      })
    }
  }, [])

  return (
    <main
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <AppHeader activeStep={activeStep} />

      <div className="flex-1 min-h-0">
        <ChatContainer onStepChange={handleStepChange} />
      </div>
    </main>
  )
}