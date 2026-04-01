'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import {
  LayoutDashboard, Users, ClipboardList, Banknote,
  BarChart3, Settings, ChevronLeft, Building2, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: '首页' },
  { href: '/employees', icon: Users, label: '员工管理' },
  { href: '/attendance', icon: ClipboardList, label: '考勤管理' },
  { href: '/payroll', icon: Banknote, label: '薪酬管理' },
  { href: '/reports', icon: BarChart3, label: '报表中心' },
]

const settingItems = [
  { href: '/settings', icon: Settings, label: '系统设置' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed, settings } = useAppStore()

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 shadow-sm',
      sidebarCollapsed ? 'w-[68px]' : 'w-[220px]'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-gray-100',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Building2 size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">钉钉考勤薪酬</div>
            <div className="text-xs text-gray-400 truncate">{settings.companyName}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {!sidebarCollapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">菜单</p>
        )}
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-6">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">设置</p>
          )}
          <ul className="space-y-0.5">
            {settingItems.map(item => {
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Upgrade Banner */}
      {!sidebarCollapsed && (
        <div className="mx-3 mb-3 p-3 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100">
          <div className="text-xs font-semibold text-primary-700 mb-1">API 自动同步</div>
          <div className="text-xs text-gray-500 mb-2">配置钉钉 API 开启自动打卡数据同步</div>
          <Link href="/settings" className="block text-center text-xs bg-primary-600 text-white rounded-lg py-1.5 font-medium hover:bg-primary-700 transition-colors">
            立即配置
          </Link>
        </div>
      )}

      {/* Collapse Button */}
      <div className="border-t border-gray-100 p-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors text-sm"
        >
          <ChevronLeft size={16} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && <span className="text-xs">收起侧边栏</span>}
        </button>
      </div>
    </aside>
  )
}
