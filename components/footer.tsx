"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function Footer() {
  const socialLinks = [
    {
      name: "Instagram",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
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

  const footerLinks = [
    { href: "#servicios", label: "Servicios" },
    { href: "#proceso", label: "Proceso" },
    { href: "#contacto", label: "Contacto" },
  ]

  return (
    <footer className="py-12 md:py-16 bg-warm-dark">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-gold">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <ellipse cx="12" cy="17" rx="3.5" ry="4" />
                <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
                <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
                <ellipse cx="8" cy="7" rx="2" ry="2.5" />
                <ellipse cx="16" cy="7" rx="2" ry="2.5" />
              </svg>
            </div>
            <span className="font-serif text-xl text-cream">Estética Canina</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-sans text-sm text-cream/70 hover:text-cream transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream/70 hover:text-gold hover:bg-cream/20 transition-colors"
                aria-label={social.name}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-cream/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="font-sans text-sm text-cream/50">
            © {new Date().getFullYear()} Estética Canina. Todos los derechos reservados.
          </p>
          <p className="font-sans text-sm text-cream/50">
            Hecho con{" "}
            <span className="text-gold">♥</span> para los peludos
          </p>
        </div>
      </div>
    </footer>
  )
}
