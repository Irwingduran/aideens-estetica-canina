"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const features = [
  {
    title: "Baño Premium",
    description: "Limpieza profunda con productos orgánicos de alta calidad para piel y pelaje.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h16M6 12v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
        <path d="M14 6a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Corte Personalizado",
    description: "Estilizado según el estándar de la raza o al gusto del dueño.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
      </svg>
    ),
  },
  {
    title: "Arreglo de Uñas",
    description: "Corte y limado profesional para uñas saludables y seguras.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    title: "Limpieza de Oídos",
    description: "Higiene auricular cuidadosa para prevenir infecciones.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: "Limpieza Dental",
    description: "Cepillado suave para una sonrisa fresca y saludable.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
      </svg>
    ),
  },
  {
    title: "Perfumado Final",
    description: "Fragancia premium para un aroma irresistible y duradero.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 22h8M12 11v11M17 2l-5 9h4l-5 9" />
      </svg>
    ),
  },
]

const breeds = [
  { name: "Poodle", style: "Corte Continental, Cachorro, León" },
  { name: "Yorkshire", style: "Corte Cachorro, Show, Asiático" },
  { name: "Schnauzer", style: "Corte Clásico, Moderno" },
  { name: "Shih Tzu", style: "Corte Cachorro, Top Knot" },
  { name: "Golden", style: "Deslanado, Recorte estético" },
  { name: "Bichón", style: "Corte Redondo, Cachorro" },
]

const pricing = [
  { size: "Pequeño", weight: "hasta 10 kg", price: "$550", popular: false },
  { size: "Mediano", weight: "10 - 25 kg", price: "$700", popular: true },
  { size: "Grande", weight: "más de 25 kg", price: "$900", popular: false },
]

export default function FullGroomingPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, #1C1814 1px, transparent 1px), linear-gradient(to bottom, #1C1814 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link 
                href="/#servicios" 
                className="inline-flex items-center gap-2 text-gold font-sans text-sm mb-6 hover:gap-3 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver a Servicios
              </Link>
              
              <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
                Servicio Completo
              </span>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-warm-dark mb-6">
                Full <span className="italic text-gold">Grooming</span>
              </h1>
              <p className="font-sans text-lg text-warm-dark/70 mb-8 max-w-lg leading-relaxed">
                Servicio completo: baño premium, corte personalizado según raza, arreglo de uñas, limpieza de oídos y perfumado final. La transformación completa que tu mascota merece.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span className="font-sans text-warm-dark">90 minutos</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="font-sans font-semibold text-gold text-xl">desde $550</span>
              </div>
              
              <Link
                href="/#contacto"
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
              >
                <span>Agendar Full Grooming</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <div className="absolute inset-0 -z-10 rounded-full bg-gold/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-warm-dark/20">
                <Image
                  src="/images/grooming-detail.jpg"
                  alt="Servicio de Full Grooming"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/30 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center text-sage">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-sm text-warm-dark/60">Servicio más</p>
                    <p className="font-serif text-xl text-warm-dark">Popular</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-warm-dark">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              Todo incluido
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-cream">
              6 servicios en <span className="italic">uno</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-2xl border border-cream/10 bg-cream/5 hover:bg-gold/10 hover:border-gold/30 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-warm-dark transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-xl text-cream mb-3">{feature.title}</h3>
                <p className="font-sans text-sm text-cream/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Breeds Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              Especialistas
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-warm-dark">
              Cortes por <span className="italic">raza</span>
            </h2>
            <p className="font-sans text-warm-dark/60 mt-4 max-w-2xl mx-auto">
              Conocemos los estándares de cada raza y adaptamos el corte según tus preferencias.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {breeds.map((breed, index) => (
              <motion.div
                key={breed.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-6 bg-white rounded-2xl border border-warm-dark/10 text-center hover:border-gold/50 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="font-serif text-lg text-warm-dark mb-2">{breed.name}</h3>
                <p className="font-sans text-xs text-warm-dark/50">{breed.style}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-blush/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              Inversión
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-warm-dark">
              Precios <span className="italic">justos</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((tier, index) => (
              <motion.div
                key={tier.size}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  tier.popular 
                    ? 'bg-warm-dark text-cream shadow-2xl shadow-warm-dark/30' 
                    : 'bg-white border border-warm-dark/10 shadow-lg'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-warm-dark text-xs font-semibold rounded-full">
                    Más Popular
                  </span>
                )}
                <h3 className={`font-serif text-2xl mb-2 ${tier.popular ? 'text-gold' : 'text-warm-dark'}`}>
                  {tier.size}
                </h3>
                <p className={`font-sans text-sm mb-6 ${tier.popular ? 'text-cream/60' : 'text-warm-dark/60'}`}>
                  {tier.weight}
                </p>
                <p className={`font-serif text-4xl mb-6 ${tier.popular ? 'text-cream' : 'text-gold'}`}>
                  {tier.price}
                </p>
                <Link
                  href="/#contacto"
                  className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-full font-sans text-sm font-medium transition-all ${
                    tier.popular
                      ? 'bg-gold text-warm-dark hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]'
                      : 'bg-warm-dark/10 text-warm-dark hover:bg-warm-dark hover:text-cream'
                  }`}
                >
                  Reservar
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-warm-dark mb-6">
              La transformación <span className="italic text-gold">completa</span>
            </h2>
            <p className="font-sans text-lg text-warm-dark/70 mb-10">
              Nuestro servicio más completo para que tu mascota luzca y se sienta increíble.
            </p>
            <Link
              href="/#contacto"
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
            >
              <span>Agendar Ahora</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <div className="absolute inset-0 -z-10 rounded-full bg-gold/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
