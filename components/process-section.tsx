"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const steps = [
  {
    icon: "🛁",
    title: "Baño profundo",
    description: "Shampoo premium según tipo de pelaje",
  },
  {
    icon: "✂️",
    title: "Corte personalizado",
    description: "Según estándar de raza o preferencia",
  },
  {
    icon: "💅",
    title: "Arreglo completo",
    description: "Uñas, orejas y limpieza dental",
  },
  {
    icon: "🎀",
    title: "Styling final",
    description: "Perfumado y accesorios opcionales",
  },
  {
    icon: "📸",
    title: "Foto del resultado",
    description: "Para que presumas la transformación",
  },
]

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section id="proceso" className="py-20 md:py-32 bg-blush/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
            Nuestro Proceso
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-warm-dark text-balance">
            De peludo a <span className="italic">fabuloso</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          {/* Desktop Timeline */}
          <div className="hidden md:block">
            {/* Connecting Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-warm-dark/10">
              <motion.div
                className="h-full bg-gold"
                initial={{ width: "0%" }}
                animate={isInView ? { width: "100%" } : { width: "0%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="text-center"
                >
                  {/* Icon Circle */}
                  <div className="relative inline-flex">
                    <motion.div
                      className="w-32 h-32 rounded-full bg-cream flex items-center justify-center text-4xl shadow-lg shadow-warm-dark/10 relative z-10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.icon}
                    </motion.div>
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold text-cream flex items-center justify-center font-sans text-sm font-medium z-20">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-xl text-warm-dark mt-6 mb-2">
                    {step.title}
                  </h3>
                  <p className="font-sans text-sm text-warm-dark/70 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-2xl shadow-lg shadow-warm-dark/10">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold text-cream flex items-center justify-center font-sans text-xs font-medium">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h3 className="font-serif text-lg text-warm-dark mb-1">
                    {step.title}
                  </h3>
                  <p className="font-sans text-sm text-warm-dark/70">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
