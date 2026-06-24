"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface AuthUser extends User {
  clientRole?: "cliente" | "admin"
  clientId?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchClientProfile = async (authUser: User): Promise<AuthUser> => {
    try {
      const res = await fetch("/api/clients/me")
      if (res.ok) {
        const json = await res.json()
        return { ...authUser, clientRole: json.data?.role, clientId: json.data?.id }
      }
    } catch {}
    return authUser
  }

  const refreshSession = async () => {
    const { data } = await supabaseClient.auth.getUser()
    if (data.user) {
      const enriched = await fetchClientProfile(data.user)
      setUser(enriched)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const { data } = await supabaseClient.auth.getSession()
      if (data.session?.user) {
        const enriched = await fetchClientProfile(data.session.user)
        setUser(enriched)
      }
      setLoading(false)
    }
    init()

    const { data: listener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const enriched = await fetchClientProfile(session.user)
        setUser(enriched)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
