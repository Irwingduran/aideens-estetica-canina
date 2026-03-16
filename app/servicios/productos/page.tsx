"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const categories = [
  {
    title: "Shampoos Orgánicos",
    description: "Fórmulas naturales para todo tipo de pelaje y piel sensible.",
    products: [
      { name: "Shampoo Avena & Miel", price: "$180", badge: "Bestseller" },
      { name: "Shampoo Pelo Blanco", price: "$220", badge: null },
      { name: "Shampoo Anti-pulgas Natural", price: "$250", badge: "Nuevo" },
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3v18M18 3v18M6 8h12M6 16h12" />
      </svg>
    ),
  },
  {
    title: "Acondicionadores",
    description: "Hidratación profunda y brillo espectacular.",
    products: [
      { name: "Acondicionador Keratina", price: "$200", badge: null },
      { name: "Mascarilla Reparadora", price: "$280", badge: "Premium" },
      { name: "Spray Desenredante", price: "$150", badge: null },
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
      </svg>
    ),
  },
  {
    title: "Cepillos Profesionales",
    description: "Herramientas de alta calidad para el cuidado diario.",
    products: [
      { name: "Cepillo Slicker Pro", price: "$320", badge: null },
      { name: "Peine Desenredante", price: "$180", badge: null },
      { name: "Cepillo Deslanador", price: "$450", badge: "Pro" },
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 0l-8-4m8 4v10" />
      </svg>
    ),
  },
  {
    title: "Snacks Naturales",
    description: "Premios saludables y deliciosos sin conservadores.",
    products: [
      { name: "Galletas de Manzana", price: "$120", badge: null },
      { name: "Huesos Dentales", price: "$180", badge: "Bestseller" },
      { name: "Snacks de Pollo", price: "$150", badge: null },
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    title: "Perfumes & Colonias",
    description: "Fragancias exclusivas de larga duración.",
    products: [
      { name: "Colonia Fresh Cotton", price: "$220", badge: null },
      { name: "Perfume Lavanda", price: "$280", badge: "Nuevo" },
      { name: "Spray Neutralizador", price: "$180", badge: null },
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2h8l4 10H4L8 2z" />
        <path d="M12 12v10" />
        <path d="M8 22h8" />
      </svg>
    ),
  },
  {
    title: "Accesorios de Lujo",
    description: "Collares, correas y más con diseño exclusivo.",
    products: [
      { name: "Collar Piel Italiana", price: "$650", badge: "Exclusivo" },
      { name: "Correa Retráctil Pro", price: "$480", badge: null },
      { name: "Bandana Artesanal", price: "$180", badge: null },
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
]

const benefits = [
  { title: "100% Orgánico", desc: "Productos naturales sin químicos" },
  { title: "Envío Gratis", desc: "En compras mayores a $500" },
  { title: "Garantía", desc: "Satisfacción o devolución" },
  { title: "Asesoría", desc: "Te ayudamos a elegir" },
]

export default function ProductsPage() {
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
                Tienda Exclusiva
              </span>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-warm-dark mb-6">
                Productos <span className="italic text-gold">Premium</span>
              </h1>
              <p className="font-sans text-lg text-warm-dark/70 mb-8 max-w-lg leading-relaxed">
                Línea exclusiva de productos para el cuidado de tu mascota: shampoos orgánicos, cepillos profesionales, snacks naturales y accesorios de lujo seleccionados por expertos.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="font-sans text-warm-dark">100% Orgánico</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="font-sans text-warm-dark">Envío a domicilio</span>
              </div>
              
              <Link
                href="#catalogo"
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
              >
                <span>Ver Catálogo</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-y-1">
                  <path d="M12 5v14M5 12l7 7 7-7" />
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
                  src="/images/products-detail.jpg"
                  alt="Productos Premium"
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
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-sm text-warm-dark/60">+50</p>
                    <p className="font-serif text-xl text-warm-dark">Productos</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-warm-dark">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="font-serif text-lg text-gold mb-1">{benefit.title}</h3>
                <p className="font-sans text-sm text-cream/60">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Catalog */}
      <section id="catalogo" className="py-20 bg-cream">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              Catálogo
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-warm-dark">
              Nuestras <span className="italic">categorías</span>
            </h2>
          </motion.div>
          
          <div className="space-y-12">
            {categories.map((category, catIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 md:p-10 border border-warm-dark/10 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl text-warm-dark mb-2">{category.title}</h3>
                    <p className="font-sans text-warm-dark/60">{category.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.products.map((product, prodIndex) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: prodIndex * 0.05 }}
                      viewport={{ once: true }}
                      className="group relative p-6 rounded-2xl bg-cream/50 border border-warm-dark/5 hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
                    >
                      {product.badge && (
                        <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${
                          product.badge === 'Bestseller' ? 'bg-gold/20 text-gold' :
                          product.badge === 'Nuevo' ? 'bg-sage/20 text-sage' :
                          product.badge === 'Premium' ? 'bg-blush text-warm-dark' :
                          product.badge === 'Pro' ? 'bg-warm-dark text-cream' :
                          'bg-gold text-warm-dark'
                        }`}>
                          {product.badge}
                        </span>
                      )}
                      <h4 className="font-serif text-lg text-warm-dark mb-2 pr-16">{product.name}</h4>
                      <p className="font-sans font-semibold text-gold text-xl">{product.price}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-warm-dark">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              Contacto
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-cream mb-6">
              ¿Necesitas <span className="italic text-gold">ayuda</span>?
            </h2>
            <p className="font-sans text-lg text-cream/70 mb-10">
              Contáctanos por WhatsApp para hacer tu pedido o recibir asesoría personalizada sobre los mejores productos para tu mascota.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5555555555"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Pedir por WhatsApp</span>
                <div className="absolute inset-0 -z-10 rounded-full bg-gold/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              
              <Link
                href="/#contacto"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cream/10 backdrop-blur-sm text-cream font-sans font-medium text-lg rounded-full border border-cream/20 hover:bg-cream hover:text-warm-dark transition-all duration-300"
              >
                Visitar Tienda
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
