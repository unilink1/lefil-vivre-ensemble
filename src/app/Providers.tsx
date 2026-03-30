'use client'
import { AuthProvider } from '@/hooks/useAuth'
import { SelectedChildProvider } from '@/hooks/useSelectedChild'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SelectedChildProvider>
        {children}
      </SelectedChildProvider>
    </AuthProvider>
  )
}
