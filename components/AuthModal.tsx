"use client"

import { useState, useCallback } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useCart } from "@/context/CartContext"
import { LogIn, Mail, Smartphone, CheckCircle, PawPrint } from "lucide-react"
import { cn } from "@/lib/utils"

type AuthStep = "method" | "phone" | "phone_otp" | "email" | "email_sent" | "register_dog" | "done"

interface AuthModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  returnUrl?: string
}

export function AuthModal({ trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange, returnUrl }: AuthModalProps) {
  const { refreshSession } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)
  const [step, setStep] = useState<AuthStep>("method")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const onOpenChange = isControlled ? controlledOnOpenChange! : setInternalOpen

  const dogName = useState("")
  const dogBreed = useState("")
  const dogSize = useState("")

  const reset = useCallback(() => {
    setStep("method")
    setPhone("")
    setEmail("")
    setOtp("")
    setError("")
    setLoading(false)
    setCooldown(0)
  }, [])

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.startsWith("52")) return `+${digits}`
    if (digits.startsWith("+")) return digits
    return `+52${digits}`
  }

  const sendPhoneOtp = async () => {
    setError("")
    setLoading(true)
    try {
      const normalized = normalizePhone(phone)
      const { error: sendError } = await supabaseClient.auth.signInWithOtp({
        phone: normalized,
      })
      if (sendError) {
        setError(sendError.message)
        setLoading(false)
        return
      }
      setPhone(normalized)
      setStep("phone_otp")
      setCooldown(30)
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      setError("Error al enviar código")
    }
    setLoading(false)
  }

  const verifyPhoneOtp = async () => {
    setError("")
    setLoading(true)
    try {
      const { error: verifyError } = await supabaseClient.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      })
      if (verifyError) {
        setError(verifyError.message)
        setLoading(false)
        return
      }
      await refreshSession()
      setStep("done")
      setTimeout(() => onOpenChange(false), 1500)
    } catch {
      setError("Error al verificar código")
    }
    setLoading(false)
  }

  const sendEmailMagicLink = async () => {
    setError("")
    setLoading(true)
    try {
      const { error: sendError } = await supabaseClient.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (sendError) {
        setError(sendError.message)
        setLoading(false)
        return
      }
      setStep("email_sent")
    } catch {
      setError("Error al enviar enlace")
    }
    setLoading(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset()
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-xl">
            {step === "done" ? "¡Bienvenido!" : "Inicia sesión o regístrate"}
          </DialogTitle>
        </DialogHeader>

        {step === "method" && (
          <div className="flex flex-col gap-3 py-2">
            <p className="text-xs text-muted-foreground text-center -mt-2 mb-1">
              Elige cómo quieres iniciar sesión
            </p>
            <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => setStep("phone")}>
              <Smartphone className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="text-sm font-medium">WhatsApp</div>
                <div className="text-xs text-muted-foreground">Recibe un código por SMS</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => setStep("email")}>
              <Mail className="w-5 h-5 text-gold" />
              <div className="text-left">
                <div className="text-sm font-medium">Email</div>
                <div className="text-xs text-muted-foreground">Recibe un magic link</div>
              </div>
            </Button>
          </div>
        )}

        {step === "phone" && (
          <div className="flex flex-col gap-3 py-2">
            <label className="text-sm font-medium">Tu número de WhatsApp</label>
            <Input
              placeholder="+52 33 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPhoneOtp()}
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button onClick={sendPhoneOtp} disabled={loading || phone.replace(/\D/g, "").length < 10}>
              {loading ? "Enviando..." : "Enviar código de verificación"}
            </Button>
            <button
              className="text-xs text-muted-foreground hover:text-warm-dark transition-colors"
              onClick={() => setStep("method")}
            >
              ← Elegir otro método
            </button>
          </div>
        )}

        {step === "phone_otp" && (
          <div className="flex flex-col gap-4 py-2 items-center">
            <p className="text-sm text-muted-foreground text-center">
              Ingresa el código de 6 dígitos que enviamos a <strong>{phone}</strong>
            </p>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button
              className="w-full"
              onClick={verifyPhoneOtp}
              disabled={loading || otp.length < 6}
            >
              {loading ? "Verificando..." : "Verificar código"}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>¿No recibiste?</span>
              {cooldown > 0 ? (
                <span>Reenviar en {cooldown}s</span>
              ) : (
                <button className="text-gold hover:underline" onClick={sendPhoneOtp}>
                  Reenviar código
                </button>
              )}
            </div>
          </div>
        )}

        {step === "email" && (
          <div className="flex flex-col gap-3 py-2">
            <label className="text-sm font-medium">Tu correo electrónico</label>
            <Input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendEmailMagicLink()}
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button onClick={sendEmailMagicLink} disabled={loading || !email.includes("@")}>
              {loading ? "Enviando..." : "Enviar magic link"}
            </Button>
            <button
              className="text-xs text-muted-foreground hover:text-warm-dark transition-colors"
              onClick={() => setStep("method")}
            >
              ← Elegir otro método
            </button>
          </div>
        )}

        {step === "email_sent" && (
          <div className="flex flex-col gap-3 py-6 items-center text-center">
            <Mail className="w-10 h-10 text-gold" />
            <p className="text-sm">Te enviamos un magic link a <strong>{email}</strong></p>
            <p className="text-xs text-muted-foreground">Revisa tu bandeja de entrada y haz clic en el enlace para iniciar sesión.</p>
            <Button variant="outline" size="sm" onClick={() => { reset(); onOpenChange(false) }}>
              Cerrar
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-3 py-6 items-center text-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <p className="text-sm font-medium">Sesión iniciada correctamente</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
