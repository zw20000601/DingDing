'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { AuthGuard } from './AuthGuard'
import { TrialBanner } from '@/components/license/TrialBanner'
import { ExpiredBlocker } from '@/components/license/ExpiredBlocker'
import { useLicenseStore } from '@/store/license'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { status, isActivated } = useLicenseStore()

  const isLoginPage = pathname === '/login'
  const isActivatePage = pathname === '/activate'

  // Login & activate pages render standalone (no shell)
  if (isLoginPage || isActivatePage) {
    return <>{children}</>
  }

  const licenseStatus = status()
  const expired = licenseStatus === 'expired'

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Trial countdown banner */}
          {!isActivated() && <TrialBanner />}
          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        {/* Expired overlay (non-admin, non-activate) */}
        {expired && <ExpiredBlocker />}
      </div>
    </AuthGuard>
  )
}
