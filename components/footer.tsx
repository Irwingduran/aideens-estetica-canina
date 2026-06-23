"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function Footer() {
  const socialLinks = [
    {
      name: "WhatsApp",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
  ]

  const quickLinks = [
    { href: "#servicios", label: "Servicios" },
    { href: "#proceso", label: "Nuestro Proceso" },
    { href: "#galeria", label: "Galería" },
    { href: "#faq", label: "Preguntas Frecuentes" },
  ]

  const serviceLinks = [
    { href: "#servicios", label: "Baño & Secado" },
    { href: "#servicios", label: "Grooming Completo" },
    { href: "#servicios", label: "Productos Premium" },
  ]

  const contactInfo = [
    { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ), text: "Otilio Montaño 510-local 141, Jardines de Guadalupe, Guadalajara, Jal." },
    { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ), text: "+52 33 1234 5678" },
    { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ), text: "Lun - Sáb: 9:00 - 19:00" },
  ]

  return (
    <footer className="py-16 md:py-20 bg-warm-dark">
      <div className="container mx-auto px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="text-gold">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <ellipse cx="12" cy="17" rx="3.5" ry="4" />
                  <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
                  <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
                  <ellipse cx="8" cy="7" rx="2" ry="2.5" />
                  <ellipse cx="16" cy="7" rx="2" ry="2.5" />
                </svg>
              </div>
              <span className="font-serif text-xl text-cream">Aideens</span>
            </Link>
            <p className="font-sans text-sm text-cream/60 leading-relaxed mb-6">
              Estética canina en Guadalajara. Otilio Montaño 510-local 141, Jardines de Guadalupe. Más de 5 años transformando peludos con amor y profesionalismo.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream/70 hover:text-gold hover:bg-gold/20 transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-cream mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative font-sans text-sm text-cream/60 hover:text-gold transition-colors group inline-flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-sans font-semibold text-cream mb-6">Servicios</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="relative font-sans text-sm text-cream/60 hover:text-gold transition-colors group inline-flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-sans font-semibold text-cream mb-6">Contacto</h4>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-gold mt-0.5">{item.icon}</span>
                  <span className="font-sans text-sm text-cream/60">{item.text}</span>
                </li>
              ))}
            </ul>
            {/* CTA Button */}
            <Link
              href="#contacto"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-gold text-warm-dark font-sans font-medium text-sm rounded-full hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all duration-300"
            >
              Agendar Cita
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-cream/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="font-sans text-sm text-cream/40">
            © {new Date().getFullYear()} Aideens Estética Canina. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="font-sans text-xs text-cream/40 hover:text-cream/70 transition-colors">
              Política de Privacidad
            </Link>
            <Link href="#" className="font-sans text-xs text-cream/40 hover:text-cream/70 transition-colors">
              Términos de Servicio
            </Link>
          </div>
          <p className="font-sans text-sm text-cream/40">
            Hecho con <span className="text-gold">♥</span> para los peludos
          </p>
        </div>
      </div>
    </footer>
  )
}
