'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { AuthGuard } from './AuthGuard'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
