"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { CartSidebar } from "@/components/CartSidebar"
import { AuthModal } from "@/components/AuthModal"
import { useAuth } from "@/context/AuthContext"
import { LogIn, User } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("auth") === "required" && !user && !loading) {
      setAuthOpen(true)
      const url = new URL(window.location.href)
      url.searchParams.delete("auth")
      window.history.replaceState({}, "", url.toString())
    }
  }, [user, loading])

  // Listen for open-auth events from Hero or other components
  useEffect(() => {
    function handleOpenAuth() {
      if (!user) setAuthOpen(true)
    }
    window.addEventListener("open-auth-modal", handleOpenAuth)
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth)
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/#servicios", label: "Servicios" },
    { href: "/productos", label: "Productos" },
    { href: "/#galeria", label: "Galería" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-cream/80 backdrop-blur-md shadow-lg shadow-warm-dark/5"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="text-gold"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <ellipse cx="12" cy="17" rx="3.5" ry="4" />
              <ellipse cx="5.5" cy="12" rx="2" ry="2.5" />
              <ellipse cx="18.5" cy="12" rx="2" ry="2.5" />
              <ellipse cx="8" cy="7" rx="2" ry="2.5" />
              <ellipse cx="16" cy="7" rx="2" ry="2.5" />
            </svg>
          </motion.div>
          <span className="font-serif text-xl text-warm-dark">
            Aideen's Estética Canina
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative font-sans text-sm text-warm-dark/80 hover:text-warm-dark transition-colors group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <CartSidebar />
          {user ? (
            <Link
              href={user.clientRole === "admin" ? "/admin" : "/mi-cuenta"}
              className="flex items-center gap-1.5 p-2 text-warm-dark/80 hover:text-warm-dark transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
          ) : (
            <AuthModal
              open={authOpen}
              onOpenChange={setAuthOpen}
              trigger={
                <button className="flex items-center gap-1.5 p-2 text-warm-dark/80 hover:text-warm-dark transition-colors">
                  <LogIn className="w-5 h-5" />
                </button>
              }
            />
          )}
          <Link
            href="/cotizar"
            className="px-5 py-2.5 bg-warm-dark text-cream font-sans text-sm rounded-full hover:bg-gold transition-colors duration-300"
          >
           Cotiza con una foto
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <CartSidebar />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-warm-dark"
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMobileMenuOpen ? (
                <path d="M6 6L18 18M6 18L18 6" />
              ) : (
                <>
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? "auto" : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        className="md:hidden overflow-hidden bg-cream/95 backdrop-blur-md"
      >
        <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-sans text-warm-dark py-2"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link
              href={user.clientRole === "admin" ? "/admin" : "/mi-cuenta"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-sans text-warm-dark py-2"
            >
              {user.clientRole === "admin" ? "Admin" : "Mi Cuenta"}
            </Link>
          ) : (
            <button
              onClick={() => { setAuthOpen(true); setIsMobileMenuOpen(false) }}
              className="font-sans text-warm-dark py-2 text-left"
            >
              Iniciar sesión
            </button>
          )}
          <Link
            href="/cotizar"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-3 bg-warm-dark text-cream font-sans text-center rounded-full"
          >
            Cotiza con una foto
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  )
}
