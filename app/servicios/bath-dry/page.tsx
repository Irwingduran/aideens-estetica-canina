"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const features = [
  {
    title: "Shampoo Orgánico Premium",
    description: "Utilizamos productos 100% naturales, libres de químicos agresivos, ideales para pieles sensibles.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Secado Profesional",
    description: "Técnica de secado con temperatura controlada para evitar daños en el pelaje y la piel.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
      </svg>
    ),
  },
  {
    title: "Cepillado Completo",
    description: "Eliminamos nudos y pelo muerto, dejando un pelaje suave, brillante y manejable.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 0l-8-4m8 4v10" />
      </svg>
    ),
  },
  {
    title: "Aromaterapia Relajante",
    description: "Fragancias naturales que dejan a tu mascota con un aroma fresco y duradero.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
      </svg>
    ),
  },
]

const process = [
  { step: "01", title: "Evaluación inicial", desc: "Revisamos el estado del pelaje y piel" },
  { step: "02", title: "Pre-cepillado", desc: "Desenredamos el pelo antes del baño" },
  { step: "03", title: "Baño profundo", desc: "Aplicación de shampoo y acondicionador" },
  { step: "04", title: "Secado experto", desc: "Secado con técnica profesional" },
  { step: "05", title: "Cepillado final", desc: "Pelaje brillante y perfumado" },
]

const pricing = [
  { size: "Pequeño", weight: "hasta 10 kg", price: "$350" },
  { size: "Mediano", weight: "10 - 25 kg", price: "$450" },
  { size: "Grande", weight: "más de 25 kg", price: "$550" },
]

export default function BathDryPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, #1C1814 1px, transparent 1px), linear-gradient(to bottom, #1C1814 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
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
                Servicio Premium
              </span>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-warm-dark mb-6">
                Bath & <span className="italic text-gold">Dry</span>
              </h1>
              <p className="font-sans text-lg text-warm-dark/70 mb-8 max-w-lg leading-relaxed">
                Baño profundo con shampoo premium orgánico, secado profesional y cepillado completo para un pelaje brillante y saludable.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span className="font-sans text-warm-dark">45 minutos</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="font-sans font-semibold text-gold text-xl">desde $350</span>
              </div>
              
              <Link
                href="#contacto"
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
              >
                <span>Agendar Bath & Dry</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <div className="absolute inset-0 -z-10 rounded-full bg-gold/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
            
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-warm-dark/20">
                <Image
                  src="/images/bath-detail.jpg"
                  alt="Servicio de Bath & Dry"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/30 to-transparent" />
              </div>
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-sm text-warm-dark/60">Satisfacción</p>
                    <p className="font-serif text-2xl text-warm-dark">98%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-warm-dark">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              Qué incluye
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-cream">
              Una experiencia <span className="italic">completa</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Process Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              El Proceso
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-warm-dark">
              5 pasos hacia la <span className="italic">perfección</span>
            </h2>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            {process.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center">
                  <span className="font-serif text-xl text-gold">{item.step}</span>
                </div>
                <div className="pt-3">
                  <h3 className="font-serif text-xl text-warm-dark mb-1">{item.title}</h3>
                  <p className="font-sans text-warm-dark/60">{item.desc}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 bg-gold/30" />
                )}
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
              Precios
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-warm-dark">
              Tarifas según <span className="italic">tamaño</span>
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
                className={`p-8 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  index === 1 
                    ? 'bg-warm-dark text-cream shadow-2xl shadow-warm-dark/30' 
                    : 'bg-white border border-warm-dark/10 shadow-lg'
                }`}
              >
                <h3 className={`font-serif text-2xl mb-2 ${index === 1 ? 'text-gold' : 'text-warm-dark'}`}>
                  {tier.size}
                </h3>
                <p className={`font-sans text-sm mb-6 ${index === 1 ? 'text-cream/60' : 'text-warm-dark/60'}`}>
                  {tier.weight}
                </p>
                <p className={`font-serif text-4xl ${index === 1 ? 'text-cream' : 'text-gold'}`}>
                  {tier.price}
                </p>
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
              Tu peludo merece lo <span className="italic text-gold">mejor</span>
            </h2>
            <p className="font-sans text-lg text-warm-dark/70 mb-10">
              Agenda hoy y dale a tu mascota la experiencia de baño que se merece.
            </p>
            <Link
              href="/#contacto"
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
            >
              <span>Reservar Ahora</span>
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
