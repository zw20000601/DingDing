'use client'
import { Bell, Search, ChevronDown, LogOut } from 'lucide-react'
import { useAppStore } from '@/store'
import { useAuthStore, ROLE_CONFIG } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { attendanceRecords } = useAppStore()
  const { currentUser, logout } = useAuthStore()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const user = currentUser()
  const roleConfig = ROLE_CONFIG.find(r => r.role === user?.role)

  const anomalyCount = attendanceRecords.filter(r =>
    r.status === '缺卡' || r.status === '旷工'
  ).length

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-gray-800">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="搜索员工、部门..."
            className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell size={18} />
          {anomalyCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* User Dropdown */}
        {user && (
          <div className="relative pl-2 border-l border-gray-100">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: roleConfig?.color || '#3b82f6' }}
              >
                {user.displayName[0]}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-gray-700">{user.displayName}</div>
                <div className="text-xs font-medium" style={{ color: roleConfig?.color }}>{roleConfig?.label}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden md:block" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <div className="font-semibold text-sm text-gray-800">{user.displayName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                    <div
                      className="text-xs font-medium mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: `${roleConfig?.color}15`, color: roleConfig?.color }}
                    >
                      {roleConfig?.label}
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); router.push('/my') }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      我的工资条
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout() }}
                      className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut size={14} />退出登录
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
