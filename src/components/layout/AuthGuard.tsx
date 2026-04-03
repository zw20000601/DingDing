'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Permission } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermission?: Permission
}

export function AuthGuard({ children, requiredPermission }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn, currentUser, hasPermission } = useAuthStore()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/login') { setChecked(true); return }

    if (!isLoggedIn()) {
      router.replace('/login')
      return
    }

    const user = currentUser()
    if (!user) { router.replace('/login'); return }

    // Employee role → only /my pages
    if (user.role === 'employee' && !pathname.startsWith('/my')) {
      router.replace('/my')
      return
    }

    // Check specific permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.replace(user.role === 'employee' ? '/my' : '/')
      return
    }

    setChecked(true)
  }, [pathname])

  if (!checked && pathname !== '/login') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-gray-400">正在验证身份…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
