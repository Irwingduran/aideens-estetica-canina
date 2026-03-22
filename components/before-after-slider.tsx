"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, useAnimation, useMotionValue, useTransform, animate } from "framer-motion"
import Image from "next/image"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
  initialPosition?: number
  /** Ángulo diagonal del divider en grados (0 = vertical, ~8° recomendado) */
  dividerAngle?: number
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Antes del grooming",
  afterAlt = "Después del grooming",
  initialPosition = 50,
  dividerAngle = 8,
}: BeforeAfterSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const handleControls = useAnimation()

  // Usar MotionValue para que el clip-path se actualice sin re-render
  const position = useMotionValue(initialPosition)
  const [displayPosition, setDisplayPosition] = useState(initialPosition)

  // Offset diagonal: el borde se inclina `dividerAngle` grados
  // Se calcula el desfase horizontal equivalente a la tangente del ángulo
  const diagOffset = useTransform(position, (p) => {
    // porcentaje como número (0-100)
    return p
  })

  // Clip-path diagonal: crea un polígono inclinado
  const clipPathValue = useTransform(position, (p) => {
    // offsetTop/offsetBottom en % relativos al ancho del contenedor
    // tan(angle) * 100 da el desplazamiento horizontal en % cuando alto == ancho
    // Usamos una aproximación fija en px luego convertida
    const angleDeg = dividerAngle
    const rad = (angleDeg * Math.PI) / 180
    // Para un contenedor típico 16:9, ajustamos el offset
    const offsetPercent = Math.tan(rad) * 56 // 56% = approx half-height/width ratio para 16:9
    const left = Math.max(0, p - offsetPercent / 2)
    const right = Math.min(100, p + offsetPercent / 2)
    return `polygon(0 0, ${right}% 0, ${left}% 100%, 0 100%)`
  })

  // Posición del divider (línea y handle)
  const dividerLeft = useTransform(position, (p) => `${p}%`)

  // Glow dinámico según distancia al centro
  const glowOpacity = useTransform(position, (p) => {
    const dist = Math.abs(p - 50) / 50
    return 0.35 + dist * 0.55
  })
  const glowSize = useTransform(position, (p) => {
    const dist = Math.abs(p - 50) / 50
    return `${6 + dist * 22}px`
  })

  // Blur en la imagen "después" cuando slider está muy a la izquierda
  const afterBlur = useTransform(position, (p) => {
    if (p > 25) return "blur(0px)"
    return `blur(${(25 - p) * 0.18}px)`
  })

  // Labels que se mueven con el divider
  const labelBeforeLeft = useTransform(position, (p) => `${Math.max(2, p - 6)}%`)
  const labelAfterLeft = useTransform(position, (p) => `${Math.min(95, p + 2)}%`)
  const labelBeforeOpacity = useTransform(position, (p) => (p < 8 ? 0 : 1))
  const labelAfterOpacity = useTransform(position, (p) => (p > 92 ? 0 : 1))

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    position.set(pct)
    setDisplayPosition(pct)
  }, [position])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setHasInteracted(true)
    updatePosition(e.clientX)
  }, [updatePosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    updatePosition(e.clientX)
  }, [isDragging, updatePosition])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    setHasInteracted(true)
    updatePosition(e.touches[0].clientX)
  }, [updatePosition])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    updatePosition(e.touches[0].clientX)
  }, [isDragging, updatePosition])

  const handleTouchEnd = useCallback(() => setIsDragging(false), [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5
    if (e.key === "ArrowLeft") {
      position.set(Math.max(0, position.get() - step))
      setHasInteracted(true)
    } else if (e.key === "ArrowRight") {
      position.set(Math.min(100, position.get() + step))
      setHasInteracted(true)
    }
  }, [position])

  // Sweep automático dramático: recorre de izquierda a derecha
  useEffect(() => {
    if (hasInteracted) return
    const timer = setTimeout(async () => {
      // Animar el MotionValue directamente para que el reveal sea visible
      await animate(position, 25, { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] })
      await animate(position, 75, { duration: 1.0, ease: [0.25, 0.1, 0.25, 1] })
      await animate(position, initialPosition, { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] })
    }, 1800)
    return () => clearTimeout(timer)
  }, [hasInteracted, position, initialPosition])

  // Global mouse/touch up
  useEffect(() => {
    const up = () => setIsDragging(false)
    window.addEventListener("mouseup", up)
    window.addEventListener("touchend", up)
    return () => {
      window.removeEventListener("mouseup", up)
      window.removeEventListener("touchend", up)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none focus:outline-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(displayPosition)}
      aria-label="Comparación antes y después"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* After Image — con blur cuando slider está muy a la izquierda */}
      <motion.div className="absolute inset-0" style={{ filter: afterBlur }}>
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Before Image — clip diagonal */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: clipPathValue }}
      >
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Label "Antes" — flota a la izquierda del divider */}
      <motion.div
        className="absolute bottom-6 z-10 pointer-events-none"
        style={{
          left: labelBeforeLeft,
          opacity: labelBeforeOpacity,
          translateX: "-100%",
          paddingRight: "10px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <span className="px-3 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-cream bg-warm-dark/55 backdrop-blur-md rounded-full whitespace-nowrap">
          Antes
        </span>
      </motion.div>

      {/* Label "Después" — flota a la derecha del divider */}
      <motion.div
        className="absolute bottom-6 z-10 pointer-events-none"
        style={{
          left: labelAfterLeft,
          opacity: labelAfterOpacity,
          paddingLeft: "10px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <span className="px-3 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-cream bg-warm-dark/55 backdrop-blur-md rounded-full whitespace-nowrap">
          Después
        </span>
      </motion.div>

      {/* Divider Line — inclinada con transform */}
      <motion.div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{
          left: dividerLeft,
          translateX: "-50%",
          width: "2px",
          background: "rgba(201,168,76,1)",
          transform: `translateX(-50%) rotate(${dividerAngle}deg)`,
          transformOrigin: "center center",
          scaleY: 1.15, // compensa el recorte por la rotación
          boxShadow: "0 0 14px rgba(201,168,76,0.5)",
        }}
      />

      {/* Handle */}
      <motion.div
        className="absolute top-1/2 z-30"
        style={{
          left: dividerLeft,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isDragging ? 1.18 : 1,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 18,
            opacity: { delay: 0.3, duration: 0.3 },
          }}
          className="relative flex items-center justify-center"
        >
          {/* Pulse ring */}
          {!isDragging && !hasInteracted && (
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 58,
                height: 58,
                background: "rgba(201,168,76,0.25)",
                border: "1.5px solid rgba(201,168,76,0.5)",
              }}
              animate={{
                scale: [1, 1.45, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Handle circle con ícono de tijeras */}
          <div
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-cream border-[2.5px] border-gold"
            style={{
              boxShadow: "0 4px 24px rgba(28,24,20,0.28)",
            }}
          >
            <motion.div
              animate={{
                rotate: isDragging ? 20 : 0,
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ScissorsIcon className="text-gold" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

/** Ícono de tijeras custom — más coherente con contexto de grooming */
function ScissorsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Aro izquierdo */}
      <circle cx="6" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      {/* Aro derecho */}
      <circle cx="6" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      {/* Hoja superior */}
      <line
        x1="8.2"
        y1="8.2"
        x2="21"
        y2="3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Hoja inferior */}
      <line
        x1="8.2"
        y1="15.8"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Cruce en el pivote */}
      <line
        x1="8.2"
        y1="8.2"
        x2="8.2"
        y2="15.8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  )
}