"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "¿Con cuánta anticipación debo reservar mi cita?",
    answer: "Recomendamos reservar con al menos 48-72 horas de anticipación para garantizar disponibilidad. En temporadas altas como fiestas y vacaciones, te sugerimos reservar con una semana de anticipación. Para citas urgentes, contáctanos directamente por WhatsApp."
  },
  {
    question: "¿Qué incluye el servicio de Spa Premium?",
    answer: "Nuestro servicio de Spa Premium incluye baño con productos hipoalergénicos de alta gama, acondicionador nutritivo, masaje relajante, limpieza de oídos, corte de uñas, limpieza dental básica, perfume premium y un lazo o pañuelo de cortesía. Además, tu mascota disfrutará de aromaterapia y música relajante durante todo el proceso."
  },
  {
    question: "¿Aceptan todas las razas y tamaños?",
    answer: "Sí, atendemos a perros de todas las razas y tamaños, desde Chihuahuas hasta Gran Daneses. Nuestro equipo está capacitado para manejar las necesidades específicas de cada raza, incluyendo técnicas de corte especializadas y cuidados particulares para pelajes dobles, rizados o lisos."
  },
  {
    question: "¿Cuánto tiempo dura una sesión de grooming completo?",
    answer: "El tiempo varía según el tamaño y condición del pelaje de tu mascota. En promedio, un grooming completo toma entre 1.5 a 3 horas. Te enviaremos un mensaje cuando tu mascota esté lista para ser recogida. Contamos con área de espera cómoda si prefieres quedarte."
  },
  {
    question: "¿Qué productos utilizan?",
    answer: "Utilizamos exclusivamente productos premium, hipoalergénicos y libres de crueldad animal. Nuestros champús y acondicionadores son importados de marcas reconocidas como Isle of Dogs, Chris Christensen y Artero. Para pieles sensibles, contamos con líneas especializadas y productos naturales."
  },
  {
    question: "¿Mi perro necesita estar vacunado?",
    answer: "Sí, por la seguridad de todas las mascotas que nos visitan, requerimos que tu perro tenga al día sus vacunas básicas (rabia, parvovirus, moquillo). Te pediremos mostrar la cartilla de vacunación en tu primera visita. Esto nos ayuda a mantener un ambiente seguro y saludable."
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 md:py-32 bg-cream">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.3em] text-gold mb-4 block">
            Resolvemos tus dudas
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-warm-dark leading-tight text-balance">
            Preguntas Frecuentes
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`border-b border-warm-dark/10 transition-colors duration-300 ${
                  openIndex === index ? "border-gold/50" : ""
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="flex items-center justify-between w-full py-6 text-left group"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-serif text-xl md:text-2xl text-warm-dark pr-8 group-hover:text-gold transition-colors duration-300">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-warm-dark/20 group-hover:border-gold group-hover:bg-gold/10 transition-all duration-300"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-warm-dark group-hover:text-gold transition-colors duration-300"
                    >
                      <path
                        d="M7 1V13M1 7H13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-warm-dark/70 font-sans leading-relaxed text-base md:text-lg">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="font-sans text-warm-dark/60 mb-4">
            ¿No encontraste lo que buscabas?
          </p>
          <a
            href="#reservar"
            className="inline-flex items-center gap-2 font-sans text-gold hover:text-warm-dark transition-colors duration-300 group"
          >
            <span className="relative">
              Contáctanos directamente
              <span className="absolute bottom-0 left-0 w-0 h-px bg-current group-hover:w-full transition-all duration-300" />
            </span>
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
