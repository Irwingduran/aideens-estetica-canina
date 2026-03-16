"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

interface StatProps {
  value: number
  suffix: string
  label: string
  delay?: number
}

function AnimatedStat({ value, suffix, label, delay = 0 }: StatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(interval)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [isInView, value, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="font-serif text-5xl md:text-6xl lg:text-7xl text-cream mb-2">
        {suffix === "+" && "+"}
        {count.toLocaleString()}
        {suffix !== "+" && suffix}
      </div>
      <div className="font-sans text-sm md:text-base text-cream/70 uppercase tracking-[0.15em]">
        {label}
      </div>
    </motion.div>
  )
}

export function StatsSection() {
  const stats = [
    { value: 2400, suffix: "+", label: "Perros atendidos" },
    { value: 98, suffix: "%", label: "Clientes satisfechos" },
    { value: 5, suffix: "★", label: "Promedio en Google" },
  ]

  return (
    <section className="py-16 md:py-24 bg-warm-dark">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={index * 200}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
