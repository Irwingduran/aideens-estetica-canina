"use client"

import { motion } from "framer-motion"
import { BeforeAfterSlider } from "./before-after-slider"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b from-cream/30 via-transparent to-cream/50" />
      
      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 z-[6] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #1C1814 1px, transparent 1px), linear-gradient(to bottom, #1C1814 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Grain Overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Before/After Slider */}
      <BeforeAfterSlider
        beforeImage="/images/dog-before.jpg"
        afterImage="/images/dog-after.jpg"
        beforeAlt="Perro antes del servicio de grooming"
        afterAlt="Perro después del servicio de grooming premium"
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="container mx-auto h-full px-6 flex flex-col justify-between py-24 md:py-32">
          {/* Headline */}
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block font-sans text-sm text-gold uppercase tracking-[0.25em] mb-4"
            >
              Aideens Estética Canina
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-5xl md:text-7xl lg:text-[96px] leading-[0.95]"
            >
              <span className="italic text-warm-dark block drop-shadow-sm">La transformación</span>
              <span className="text-gold block mt-2 drop-shadow-sm">que merecen.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-sans text-lg text-warm-dark/70 mt-6 max-w-md"
            >
              Cuidado premium para tu mejor amigo. Grooming profesional en Guadalajara y Zapopan.
            </motion.p>
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pointer-events-auto flex flex-col sm:flex-row gap-4"
            >
              {/* Primary CTA with Glow */}
              <Link
                href="/cotizar"
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
              >
                <span>Cotiza con una foto </span>
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
                {/* Glow Effect */}
                <div className="absolute inset-0 -z-10 rounded-full bg-gold/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              {/* Secondary CTA */}
              <Link
                href="#servicios"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-warm-dark/10 backdrop-blur-sm text-warm-dark font-sans font-medium text-lg rounded-full border border-warm-dark/10 hover:bg-border-gold  hover:text-warm-dark hover:border-gold transition-all duration-300"
              >
                <span>Ver servicios</span>
              </Link>

              {/* Login CTA */}
              {!user && (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal"))}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-warm-dark/5 backdrop-blur-sm text-warm-dark font-sans font-medium text-lg rounded-full border border-warm-dark/10 hover:bg-gold hover:text-warm-dark hover:border-gold transition-all duration-300"
                >
                  🔑 Ya soy cliente
                </button>
              )}
              {user && (
                <Link
                  href="/mi-cuenta"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-warm-dark/5 backdrop-blur-sm text-warm-dark font-sans font-medium text-lg rounded-full border border-warm-dark/10 hover:bg-gold hover:text-warm-dark hover:border-gold transition-all duration-300"
                >
                  🐾 Mi cuenta
                </Link>
              )}
            </motion.div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="pointer-events-auto"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative w-28 h-28 md:w-32 md:h-32"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <path
                      id="circle"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    />
                  </defs>
                  <text className="fill-warm-dark text-[10px] font-sans uppercase tracking-[0.3em]">
                    <textPath href="#circle">
                        ✦ Guadalajara ✦ Zapopan ✦ Groomers Certificados ✦
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-cream">
                      <ellipse cx="12" cy="17" rx="3.5" ry="4" />
                      <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
                      <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
                      <ellipse cx="8" cy="7" rx="2" ry="2.5" />
                      <ellipse cx="16" cy="7" rx="2" ry="2.5" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
