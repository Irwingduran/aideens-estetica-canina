"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "¿Dónde están ubicados? ¿Atienden en toda Guadalajara?",
    answer: "Estamos en Jardines de Guadalupe, Guadalajara: Otilio Montaño 510-local 141. Tenemos estacionamiento gratuito y área de espera cómoda. Si vienes de Andares o Ciudad Bugambilias, estamos a solo 15-20 minutos."
  },
  {
    question: "¿Con cuánta anticipación debo reservar mi cita?",
    answer: "Recomendamos reservar con al menos 48-72 horas de anticipación. En temporadas altas como Navidad, Día de Muertos y fines de semana largos en Guadalajara, reserva con una semana de anticipación. Para citas urgentes, escríbenos por WhatsApp."
  },
  {
    question: "¿Qué incluye el servicio de Spa Premium?",
    answer: "Nuestro servicio premium incluye baño con productos hipoalergénicos, acondicionador nutritivo, masaje relajante, limpieza de oídos, corte de uñas, limpieza dental básica, perfume premium y un lazo o pañuelo de cortesía. Todo con aromaterapia y música relajante."
  },
  {
    question: "¿Aceptan todas las razas y tamaños?",
    answer: "Sí, atendemos perros de todas las razas y tamaños, desde Chihuahuas hasta Gran Daneses. Nuestro equipo está capacitado en técnicas de corte especializadas para cada raza: pelajes dobles, rizados, lisos, y razas de pelo duro."
  },
  {
    question: "¿Cuánto tiempo dura una sesión de grooming completo?",
    answer: "En promedio, un grooming completo toma entre 1.5 a 3 horas según el tamaño y condición del pelaje. Te enviaremos un mensaje cuando tu mascota esté lista. Contamos con área de espera y café de cortesía mientras esperas."
  },
  {
    question: "¿Qué productos utilizan?",
    answer: "Usamos productos premium hipoalergénicos libres de crueldad animal. Nuestras marcas incluyen Isle of Dogs, Chris Christensen y Artero. Para pieles sensibles tenemos líneas especializadas. También vendemos estos productos para que mantengas el cuidado en casa."
  },
  {
    question: "¿Mi perro necesita estar vacunado?",
    answer: "Sí, por seguridad de todos nuestros visitantes peludos, requerimos vacunas básicas al día (rabia, parvovirus, moquillo). Te pediremos la cartilla de vacunación en la primera visita. Esto nos ayuda a mantener un ambiente saludable para todos."
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
