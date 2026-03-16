"use client"

import { motion } from "framer-motion"
import { BeforeAfterSlider } from "./before-after-slider"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Grain Overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-30"
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
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-5xl md:text-7xl lg:text-[96px] leading-[0.95] mix-blend-multiply"
            >
              <span className="italic text-warm-dark block">La transformación</span>
              <span className="text-gold block mt-2">que merecen.</span>
            </motion.h1>
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pointer-events-auto"
            >
              <Link
                href="#contacto"
                className="group inline-flex items-center gap-2 px-10 py-4 bg-warm-dark text-cream font-sans text-lg rounded-full hover:bg-gold transition-all duration-300"
              >
                <span>Agenda su cita</span>
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.span>
              </Link>
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
                      ✦ Groomers Certificados ✦ Premium Quality ✦
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
