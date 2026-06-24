"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Package, ShoppingBag, Users, Leaf, LogOut, ChevronLeft,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.clientRole !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) return <div className="min-h-screen bg-muted flex items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  if (!user || user.clientRole !== "admin") return null

  return (
    <div className="min-h-screen bg-muted flex">
      <aside className={cn(
        "bg-warm-dark text-cream flex flex-col transition-all duration-300 shrink-0",
        sidebarOpen ? "w-56" : "w-16"
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <span className="font-serif text-lg truncate">{sidebarOpen ? "Admin Aideens" : "A"}</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-1 hover:bg-white/10 rounded">
            <ChevronLeft className={cn("w-4 h-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-gold/20 text-gold font-medium"
                    : "text-cream/70 hover:text-cream hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/50 hover:text-cream hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Salir al sitio</span>}
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
