"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FormData {
  ownerName: string
  dogName: string
  breed: string
  service: string
  date: string
  whatsapp: string
}

function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  name,
  required = true,
}: {
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  name: string
  required?: boolean
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="w-full py-4 bg-transparent border-b-2 border-warm-dark/20 focus:border-gold text-warm-dark font-sans text-base outline-none transition-colors duration-300 peer"
      />
      <label
        className={`absolute left-0 transition-all duration-300 pointer-events-none font-sans ${
          isFocused || hasValue
            ? "top-0 text-xs text-gold"
            : "top-4 text-base text-warm-dark/50"
        }`}
      >
        {label}
      </label>
    </div>
  )
}

function FloatingSelect({
  label,
  value,
  onChange,
  name,
  options,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  name: string
  options: { value: string; label: string }[]
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full py-4 bg-transparent border-b-2 border-warm-dark/20 focus:border-gold text-warm-dark font-sans text-base outline-none transition-colors duration-300 appearance-none cursor-pointer"
      >
        <option value="" disabled />
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        className={`absolute left-0 transition-all duration-300 pointer-events-none font-sans ${
          isFocused || hasValue
            ? "top-0 text-xs text-gold"
            : "top-4 text-base text-warm-dark/50"
        }`}
      >
        {label}
      </label>
      <svg
        className="absolute right-0 top-4 w-5 h-5 text-warm-dark/50 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}

export function BookingSection() {
  const [formData, setFormData] = useState<FormData>({
    ownerName: "",
    dogName: "",
    breed: "",
    service: "",
    date: "",
    whatsapp: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)
  }

  const serviceOptions = [
    { value: "bath", label: "Baño & Secado" },
    { value: "grooming", label: "Grooming Completo" },
    { value: "spa", label: "Spa Premium" },
  ]

  return (
    <section id="contacto" className="py-20 md:py-32 bg-cream">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Persuasive Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="font-sans text-sm text-gold uppercase tracking-[0.2em] mb-4 block">
              Reserva tu cita
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-warm-dark mb-6 text-balance">
              Tu mejor amigo merece{" "}
              <span className="italic text-gold">lo mejor</span>
            </h2>
            <p className="font-sans text-lg text-warm-dark/70 leading-relaxed mb-8">
              En Guadalajara, agenda una cita y déjanos consentir a tu peludo 
              con el cuidado premium que se merece. Nuestros groomers certificados 
              están listos para crear la transformación perfecta.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                "Confirmación por WhatsApp en minutos",
                "Productos orgánicos y premium",
                "Groomers con +5 años de experiencia",
                "Fotos del antes y después incluidas",
                "Jardines de Guadalupe, GDL — fácil acceso",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-gold"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                  <span className="font-sans text-warm-dark/80">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-warm-dark/5"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  {/* Confetti Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <span className="text-5xl">🐾</span>
                  </motion.div>
                  <h3 className="font-serif text-2xl text-warm-dark mb-2">
                    ¡Cita agendada!
                  </h3>
                  <p className="font-sans text-warm-dark/70">
                    Te contactaremos por WhatsApp para confirmar la cita de{" "}
                    <span className="text-gold font-medium">{formData.dogName}</span>.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FloatingInput
                      label="Nombre del dueño"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="Nombre del perro"
                      name="dogName"
                      value={formData.dogName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FloatingInput
                      label="Raza"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                    />
                    <FloatingSelect
                      label="Servicio"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      options={serviceOptions}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FloatingInput
                      label="Fecha preferida"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="WhatsApp"
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full py-4 bg-gold text-warm-dark font-sans font-semibold text-lg rounded-full hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <span>
                      {formData.dogName
                        ? `Confirmar cita para ${formData.dogName}`
                        : "Confirmar cita"}
                    </span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 -z-10 rounded-full bg-gold/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
