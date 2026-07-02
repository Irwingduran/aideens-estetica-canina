import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { ServicesSection } from "@/components/services-section"
import { ProcessSection } from "@/components/process-section"
import { FeaturedProducts } from "@/components/featured-products"
import { HomeopathySection } from "@/components/homeopathy-section"
import { GallerySection } from "@/components/gallery-section"
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
      <ServicesSection />
      <ProcessSection />
      <FeaturedProducts />
      <HomeopathySection />
      <GallerySection />
      <FAQSection />
      <BookingSection />
      <Footer />
    </main>
  )
}
