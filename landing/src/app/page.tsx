import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import SupportedGames from '@/components/SupportedGames'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'

export default function Home(): React.JSX.Element {
  return (
    <>
      <main>
        <Hero />
        <HowItWorks />
        <SupportedGames />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
