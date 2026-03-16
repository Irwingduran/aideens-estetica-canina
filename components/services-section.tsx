"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface ServiceCardProps {
  title: string
  duration: string
  price: string
  description: string
  image: string
  icon: React.ReactNode
  index: number
}

function ServiceCard({ title, duration, price, description, image, icon, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative h-[420px] rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-all duration-500 grayscale group-hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/90 via-warm-dark/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Icon */}
        <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-cream/10 backdrop-blur-sm flex items-center justify-center text-gold">
          {icon}
        </div>

        {/* Title - Always visible */}
        <motion.h3 className="font-serif text-2xl md:text-3xl text-cream mb-2">
          {title}
        </motion.h3>

        {/* Meta - Always visible */}
        <div className="flex items-center gap-3 text-cream/70 font-sans text-sm mb-4">
          <span>{duration}</span>
          <span className="w-1 h-1 rounded-full bg-gold" />
          <span className="text-gold font-medium">{price}</span>
        </div>

        {/* Description - Slides up on hover */}
        <motion.div
          initial={false}
          className="overflow-hidden"
        >
          <motion.p
            className="text-cream/80 font-sans text-sm leading-relaxed mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400"
          >
            {description}
          </motion.p>

          <motion.button
            className="font-sans text-sm text-gold flex items-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-75"
          >
            Ver más
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function ServicesSection() {
  const services = [
    {
      title: "Bath & Dry",
      duration: "45 min",
      price: "desde $350",
      description: "Baño profundo con shampoo premium orgánico, secado profesional y cepillado completo para un pelaje brillante.",
      image: "/images/service-bath.jpg",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12h16M6 12v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
          <path d="M14 6a2 2 0 11-4 0 2 2 0 014 0z" />
          <path d="M12 2v4" />
        </svg>
      ),
    },
    {
      title: "Full Grooming",
      duration: "90 min",
      price: "desde $550",
      description: "Servicio completo: baño, corte personalizado según raza, arreglo de uñas, limpieza de oídos y perfumado final.",
      image: "/images/service-grooming.jpg",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l2 2M18 18l-2-2M6 18l2-2M18 6l-2 2" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      ),
    },
    {
      title: "Spa Premium",
      duration: "120 min",
      price: "desde $850",
      description: "Experiencia de lujo completa: aromaterapia, masaje relajante, tratamiento hidratante y styling final con foto profesional.",
      image: "/images/service-spa.jpg",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="servicios" className="py-20 md:py-32 bg-cream">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
            Nuestros Servicios
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-warm-dark text-balance">
            Cuidado experto para <span className="italic">cada raza</span>
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.title} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
