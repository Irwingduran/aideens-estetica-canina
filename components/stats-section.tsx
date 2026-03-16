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
    { value: 2400, suffix: "+", label: "Perros atendidos", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
        <ellipse cx="12" cy="17" rx="3.5" ry="4" />
        <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
        <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
        <ellipse cx="8" cy="7" rx="2" ry="2.5" />
        <ellipse cx="16" cy="7" rx="2" ry="2.5" />
      </svg>
    )},
    { value: 98, suffix: "%", label: "Clientes satisfechos", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    )},
    { value: 5, suffix: "★", label: "Promedio en Google", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )},
  ]

  return (
    <section className="py-16 md:py-24 bg-warm-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #C9A84C 1px, transparent 0)`,
        backgroundSize: '50px 50px',
      }} />
      
      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-gold/5 to-transparent" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent" />

      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Card with border */}
              <div className="text-center p-8 rounded-2xl border border-cream/10 bg-cream/5 backdrop-blur-sm group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-500">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                    {stat.icon}
                  </div>
                </div>
                <AnimatedStat
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  delay={index * 200}
                />
              </div>
              {/* Divider on desktop */}
              {index < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-20 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
