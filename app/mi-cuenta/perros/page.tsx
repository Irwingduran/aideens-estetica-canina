"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"
import { DogFormDialog } from "@/components/DogFormDialog"
import { PawPrint, Plus, ArrowLeft, ChevronRight } from "lucide-react"

interface Dog {
  id: string
  name: string
  breed: string | null
  size: string | null
  notes: string | null
  created_at: string
}

function DogsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  )
}

export default function PerrosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push("/?auth=required")
  }, [user, authLoading, router])

  const fetchDogs = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch("/api/dogs")
      const json = await res.json()
      setDogs(json.data ?? [])
    } catch {
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDogs()
  }, [fetchDogs])

  if (authLoading || loading) return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <DogsSkeleton />
      <Footer />
    </main>
  )

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/mi-cuenta" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-warm-dark transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Cuenta
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-warm-dark">Mis Perros</h1>
          <DogFormDialog onSuccess={fetchDogs} />
        </div>

        {dogs.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Aún no has registrado perros</p>
            <DogFormDialog
              onSuccess={fetchDogs}
              trigger={
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Registrar perro
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {dogs.map((dog) => (
              <div key={dog.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:border-gold/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blush/30 flex items-center justify-center text-lg font-bold text-warm-dark">
                    {dog.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{dog.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[dog.breed, dog.size].filter(Boolean).join(" — ") || "Sin información"}
                    </p>
                    {dog.notes && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{dog.notes}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
