import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats-section"
import { ServicesSection } from "@/components/services-section"
import { ProcessSection } from "@/components/process-section"
import { BookingSection } from "@/components/booking-section"
import { Footer } from "@/components/footer"
import { CustomCursor } from "@/components/custom-cursor"

export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
      <CustomCursor />
      <Navbar />
      <Hero />
      <StatsSection />
      <ServicesSection />
      <ProcessSection />
      <BookingSection />
      <Footer />
    </main>
  )
}
