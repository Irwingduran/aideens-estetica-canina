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
      whileHover={{ y: -8 }}
      className="group relative h-[420px] rounded-2xl overflow-hidden border border-warm-dark/10 shadow-lg shadow-warm-dark/5 hover:shadow-2xl hover:shadow-gold/10 transition-shadow duration-500"
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/95 via-warm-dark/50 to-warm-dark/20 group-hover:from-warm-dark/90 transition-all duration-500" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Icon with animation */}
        <motion.div 
          className="absolute top-6 right-6 w-14 h-14 rounded-full bg-gold/20 backdrop-blur-md flex items-center justify-center text-gold border border-gold/30 group-hover:bg-gold group-hover:text-warm-dark transition-all duration-500"
          whileHover={{ rotate: 15 }}
        >
          {icon}
        </motion.div>

        {/* Title - Always visible */}
        <motion.h3 className="font-serif text-2xl md:text-3xl text-cream mb-2 group-hover:text-gold transition-colors duration-300">
          {title}
        </motion.h3>

        {/* Meta - Always visible */}
        <div className="flex items-center gap-3 text-cream/70 font-sans text-sm mb-4">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {duration}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="text-gold font-semibold">{price}</span>
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

        </motion.div>
      </div>
    </motion.div>
  )
}

export function ServicesSection() {
  const services = [
    {
      title: "Baño & Secado",
      duration: "60 min",
      price: "desde $200",
      description: "Baño profundo con shampoo antipulgas, secado, cepillado completo, corte de uñas y limpieza de oídos. El favorito en Guadalajara.",
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
      title: "Baño & Corte",
      duration: "120 min",
      price: "desde $350",
      description: "Servicio completo: baño con shampoo antipulgas, corte personalizado según raza, arreglo de uñas y limpieza de oídos.",
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
      title: "Productos y Alternos",
      duration: "Tienda",
      price: "variedad",
      description: "Línea exclusiva de productos para el cuidado de tu mascota: medicamentos, shampoos, cepillos, desparasitantes, homeopatía y más...",
      image: "/images/service-products.jpg",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 01-8 0" />
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
