import SupportedGames from '@/components/SupportedGames'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import Pricing from '@/components/Pricing'
import TrustSection from '@/components/TrustSection'
import StoryModeBanner from '@/components/StoryModeBanner'
import InstallSection, { Footer } from '@/components/Footer'

export default function Home(): React.JSX.Element {
  return (
    <>
      <main>
        <Hero />
        <StoryModeBanner />
        <SupportedGames />
        <HowItWorks />
        <Features />
        <Pricing />
        <TrustSection />
        <InstallSection />
      </main>
      <Footer />
    </>
  )
}
