import { CTA } from '@/components/landing/CTA'
import { Features } from '@/components/landing/Features'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { Navbar } from '@/components/landing/Navbar'
import { Tracks } from '@/components/landing/Tracks'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Tracks />
      <CTA />
      <Footer />
    </>
  )
}
