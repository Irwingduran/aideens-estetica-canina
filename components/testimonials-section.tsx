"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface TestimonialProps {
  quote: string
  author: string
  petName: string
  petBreed: string
  rating: number
  index: number
}

function TestimonialCard({ quote, author, petName, petBreed, rating, index }: TestimonialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl p-8 border border-warm-dark/10 shadow-lg shadow-warm-dark/5 hover:shadow-xl hover:shadow-gold/10 hover:border-gold/30 transition-all duration-500"
    >
      {/* Quote Icon */}
      <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gold flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-warm-dark">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Rating Stars */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={i < rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={i < rating ? "text-gold" : "text-warm-dark/20"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="font-sans text-warm-dark/80 leading-relaxed mb-6 text-balance">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-4 pt-4 border-t border-warm-dark/10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-blush/30 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
            <ellipse cx="12" cy="17" rx="3.5" ry="4" />
            <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
            <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
            <ellipse cx="8" cy="7" rx="2" ry="2.5" />
            <ellipse cx="16" cy="7" rx="2" ry="2.5" />
          </svg>
        </div>
        <div>
          <p className="font-sans font-semibold text-warm-dark">{author}</p>
          <p className="font-sans text-sm text-warm-dark/60">
            Dueño de <span className="text-gold">{petName}</span> ({petBreed})
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Desde Providencia llegamos y valió cada minuto. Mi Lola salió como modelo de revista. El equipo es súper profesional y cariñoso. 100% recomendado en Guadalajara.",
      author: "María Fernanda Palacios",
      petName: "Lola",
      petBreed: "Poodle",
      rating: 5,
    },
    {
      quote: "Primera vez que mi perro no tiembla en una estética. Se nota que aman a los animales. Max quedó hermoso y relajado. De Zapopan, fieles clientes.",
      author: "Carlos Hernández",
      petName: "Max",
      petBreed: "Golden Retriever",
      rating: 5,
    },
    {
      quote: "Los productos premium hacen toda la diferencia. El pelaje de Coco brilla como nunca. Lo traigo desde Tlaquepaque porque no hay otro así acá.",
      author: "Ana Sofía Jiménez",
      petName: "Coco",
      petBreed: "Shih Tzu",
      rating: 5,
    },
    {
      quote: "Servicio excepcional desde la recepción hasta la entrega. Las fotos del antes y después son un detalle hermoso. Gracias por cuidar tan bien a Bruno.",
      author: "Roberto Delgadillo",
      petName: "Bruno",
      petBreed: "Schnauzer",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-cream relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #1C1814 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
            Testimonios
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-warm-dark text-balance mb-4">
            Lo que dicen <span className="italic">nuestros clientes</span>
          </h2>
          <p className="font-sans text-lg text-warm-dark/60 max-w-2xl mx-auto">
            Más de 2,400 peludos felices y sus dueños satisfechos nos respaldan
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.author} {...testimonial} index={index} />
          ))}
        </div>

        {/* Google Reviews Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-warm-dark/10 shadow-lg">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="font-sans text-warm-dark font-semibold">5.0</span>
            <span className="text-warm-dark/40">|</span>
            <span className="font-sans text-warm-dark/70 text-sm">+120 reseñas en Google — Guadalajara</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
