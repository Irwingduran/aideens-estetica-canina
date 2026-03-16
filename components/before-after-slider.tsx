"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import Image from "next/image"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
  initialPosition?: number
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Antes del grooming",
  afterAlt = "Después del grooming",
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const handleControls = useAnimation()

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percentage)
  }, [])

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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

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

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setPosition((p) => Math.max(0, p - 5))
      setHasInteracted(true)
    } else if (e.key === "ArrowRight") {
      setPosition((p) => Math.min(100, p + 5))
      setHasInteracted(true)
    }
  }, [])

  // Auto-sweep animation hint after 2s of idle
  useEffect(() => {
    if (hasInteracted) return
    const timer = setTimeout(async () => {
      await handleControls.start({
        x: [-20, 20, 0],
        transition: { duration: 1.2, ease: "easeInOut" }
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [hasInteracted, handleControls])

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("touchend", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("touchend", handleGlobalMouseUp)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
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
      aria-valuenow={Math.round(position)}
      aria-label="Comparación antes y después"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Labels */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-6 left-6 z-10"
      >
        <span className="px-4 py-2 text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-cream bg-warm-dark/50 backdrop-blur-md rounded-full">
          Antes
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-6 right-6 z-10"
      >
        <span className="px-4 py-2 text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-cream bg-warm-dark/50 backdrop-blur-md rounded-full">
          Después
        </span>
      </motion.div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gold z-20"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          boxShadow: "0 0 12px rgba(201,168,76,0.6)",
        }}
      />

      {/* Handle */}
      <motion.div
        animate={handleControls}
        className="absolute top-1/2 z-30"
        style={{
          left: `${position}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isDragging ? 1.2 : 1,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.3,
          }}
          className="relative"
        >
          {/* Pulse animation */}
          {!isDragging && !hasInteracted && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gold"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: 56, height: 56 }}
            />
          )}
          
          {/* Handle Circle */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full bg-cream border-[3px] border-gold"
            style={{
              boxShadow: "0 4px 20px rgba(28,24,20,0.25)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gold"
            >
              <path
                d="M8 6L4 12L8 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 6L20 12L16 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
