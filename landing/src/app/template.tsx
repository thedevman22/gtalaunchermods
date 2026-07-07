'use client'

import PageTransition from '@/components/PageTransition'

export default function Template({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <PageTransition>{children}</PageTransition>
}
