import { Suspense } from 'react'
import PricingCheckout from '@/components/PricingCheckout'

export default function PricingPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">Loading pricing…</div>
      }
    >
      <PricingCheckout />
    </Suspense>
  )
}
