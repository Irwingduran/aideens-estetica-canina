"use client"

import { motion } from "framer-motion"
import { QuoteChat } from "./quote-chat"

const features = [
  "Analisis de raza y tamano",
  "Evaluacion del estado del pelaje",
  "Sugerencia de corte personalizada",
  "Precio desglosado por servicio",
]

export function QuoterSection() {
  return (
    <section id="cotizador" className="py-20 md:py-32 bg-warm-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #C9A84C 1px, transparent 0)`,
        backgroundSize: '50px 50px',
      }} />
      
      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-gold/5 to-transparent" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent" />

      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center">
          {/* Left Content - 40% */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em]">
              Cotizador AI
            </span>
            
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-tight text-balance">
              Tu cotizacion en{" "}
              <span className="italic text-gold">30 segundos</span>
            </h2>
            
            <p className="font-sans text-cream/70 text-lg leading-relaxed">
              Tomale foto a tu perro tal como esta. Nuestro groomer AI analiza raza, pelaje y condicion al instante.
            </p>

            {/* Feature List */}
            <ul className="space-y-4 pt-4">
              {features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="font-sans text-cream/80">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* Powered By Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/5 border border-cream/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <circle cx="12" cy="12" r="6" />
                </svg>
                <span className="font-sans text-sm text-cream/60">Powered by Claude AI</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Chat Widget - 60% */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <QuoteChat />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
