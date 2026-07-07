'use client'

import { MotionConfig } from 'framer-motion'
import { AuthProvider } from '@/context/AuthContext'

export default function Providers({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  )
}
