'use client'
import { AuthProvider } from '@/hooks/useAuth'
import { SelectedChildProvider } from '@/hooks/useSelectedChild'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'
import { ReactNode } from 'react'

function InactivityGuard({ children }: { children: ReactNode }) {
  useInactivityLogout()
  return <>{children}</>
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SelectedChildProvider>
        <InactivityGuard>
          {children}
        </InactivityGuard>
      </SelectedChildProvider>
    </AuthProvider>
  )
}
