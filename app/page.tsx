import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats-section"
import { ServicesSection } from "@/components/services-section"
import { ProcessSection } from "@/components/process-section"
import { GallerySection } from "@/components/gallery-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FAQSection } from "@/components/faq-section"
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
      <GallerySection />
      <TestimonialsSection />
      <FAQSection />
      <BookingSection />
      <Footer />
    </main>
  )
}
