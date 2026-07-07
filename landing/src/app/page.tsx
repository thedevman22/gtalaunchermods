import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Pricing from '@/components/Pricing'
import TrustSection from '@/components/TrustSection'
import InstallSection, { Footer } from '@/components/Footer'

export default function Home(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <TrustSection />
        <InstallSection />
      </main>
      <Footer />
    </>
  )
}
