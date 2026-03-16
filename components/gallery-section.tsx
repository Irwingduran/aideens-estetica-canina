"use client"

import { motion } from "framer-motion"
import { BeforeAfterSlider } from "./before-after-slider"

interface GalleryItem {
  id: number
  beforeImage: string
  afterImage: string
  petName: string
  breed: string
  service: string
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    beforeImage: "/images/gallery-before-1.jpg",
    afterImage: "/images/gallery-after-1.jpg",
    petName: "Luna",
    breed: "Poodle",
    service: "Grooming Completo"
  },
  {
    id: 2,
    beforeImage: "/images/gallery-before-2.jpg",
    afterImage: "/images/gallery-after-2.jpg",
    petName: "Max",
    breed: "Shih Tzu",
    service: "Corte de Raza"
  },
  {
    id: 3,
    beforeImage: "/images/gallery-before-3.jpg",
    afterImage: "/images/gallery-after-3.jpg",
    petName: "Rocky",
    breed: "Schnauzer",
    service: "Spa Premium"
  },
]

export function GallerySection() {
  return (
    <section id="galeria" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.3em] text-gold mb-4 block">
            Nuestro trabajo
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-warm-dark leading-tight text-balance">
            Galería de Transformaciones
          </h2>
          <p className="mt-6 font-sans text-warm-dark/60 text-lg max-w-2xl mx-auto">
            Desliza para ver el antes y después de nuestros clientes más consentidos
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              {/* Slider Container */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                <BeforeAfterSlider
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  beforeAlt={`${item.petName} antes del grooming`}
                  afterAlt={`${item.petName} después del grooming`}
                  initialPosition={50}
                />
                
                {/* Gradient Overlay at Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-warm-dark/60 to-transparent pointer-events-none z-10" />
              </div>

              {/* Pet Info */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 + 0.3 }}
                className="mt-5 text-center"
              >
                <h3 className="font-serif text-2xl text-warm-dark">
                  {item.petName}
                </h3>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="font-sans text-sm text-warm-dark/60">
                    {item.breed}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span className="font-sans text-sm text-gold">
                    {item.service}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* View More CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 border border-warm-dark/20 rounded-full font-sans text-warm-dark hover:bg-warm-dark hover:text-cream transition-all duration-300 group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gold group-hover:text-cream transition-colors duration-300"
            >
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="18" cy="6" r="1" fill="currentColor" />
            </svg>
            <span>Ver más en Instagram</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transform group-hover:translate-x-1 transition-transform duration-300"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
