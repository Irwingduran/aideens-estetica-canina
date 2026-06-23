import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif"
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: 'Aideens Estética Canina | Guadalajara — La transformación que merecen',
  description: 'Estética canina en Guadalajara y Zapopan. Grooming profesional, baño y spa para tu perro. Más de 2,400 perros atendidos con 98% de satisfacción.',
  generator: 'v0.app',
  openGraph: {
    title: 'Aideens Estética Canina | Guadalajara — La transformación que merecen',
    description: 'Estética canina en Guadalajara y Zapopan. Grooming profesional, baño y spa para tu mascota.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${cormorant.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
