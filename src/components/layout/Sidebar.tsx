'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { useAuthStore, ROLE_CONFIG } from '@/store/auth'
import { useLicenseStore } from '@/store/license'
import { Permission } from '@/types'
import {
  LayoutDashboard, Users, ClipboardList, Banknote,
  BarChart3, Settings, ChevronLeft, Building2, LogOut,
  ShieldCheck, UserCircle, Zap, Clock, Crown
} from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  permission?: Permission
}

const mainNav: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: '首页', permission: 'dashboard.view' },
  { href: '/employees', icon: Users, label: '员工管理', permission: 'employee.view' },
  { href: '/attendance', icon: ClipboardList, label: '考勤管理', permission: 'attendance.view' },
  { href: '/payroll', icon: Banknote, label: '薪酬管理', permission: 'payroll.view' },
  { href: '/reports', icon: BarChart3, label: '报表中心', permission: 'reports.view' },
]

const bottomNav: NavItem[] = [
  { href: '/my', icon: UserCircle, label: '我的工资条', permission: 'my.payroll' },
  { href: '/admin', icon: ShieldCheck, label: '用户权限管理', permission: 'admin.users' },
  { href: '/settings', icon: Settings, label: '系统设置', permission: 'settings.view' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, setSidebarCollapsed, settings } = useAppStore()
  const { currentUser, hasPermission, logout } = useAuthStore()

  const user = currentUser()
  const roleConfig = ROLE_CONFIG.find(r => r.role === user?.role)
  const { status: licStatus, daysLeft, isActivated, plan: licPlan } = useLicenseStore()
  const ls = licStatus()
  const activated = isActivated()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const visibleMain = mainNav.filter(item => !item.permission || hasPermission(item.permission))
  const visibleBottom = bottomNav.filter(item => !item.permission || hasPermission(item.permission))

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    return (
      <li>
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
  }

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 shadow-sm flex-shrink-0',
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

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-4">
        {/* Main nav */}
        {visibleMain.length > 0 && (
          <div>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">菜单</p>
            )}
            <ul className="space-y-0.5">
              {visibleMain.map(item => <NavLink key={item.href} item={item} />)}
            </ul>
          </div>
        )}

        {/* Bottom nav */}
        {visibleBottom.length > 0 && (
          <div>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">账号</p>
            )}
            <ul className="space-y-0.5">
              {visibleBottom.map(item => <NavLink key={item.href} item={item} />)}
            </ul>
          </div>
        )}
      </nav>

      {/* User Info */}
      {user && (
        <div className={cn(
          'px-3 py-3 border-t border-gray-100',
          sidebarCollapsed && 'px-2'
        )}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5 px-1 py-2 rounded-lg hover:bg-gray-50 cursor-default">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: roleConfig?.color || '#3b82f6' }}
              >
                {user.displayName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-700 truncate">{user.displayName}</div>
                <div
                  className="text-xs truncate font-medium"
                  style={{ color: roleConfig?.color || '#6b7280' }}
                >
                  {roleConfig?.label}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto"
              style={{ background: roleConfig?.color || '#3b82f6' }}
              title={user.displayName}
            >
              {user.displayName[0]}
            </div>
          )}
        </div>
      )}

      {/* License Status Widget */}
      {!sidebarCollapsed && (
        <Link href="/activate" className={cn(
          'mx-3 mb-2 p-3 rounded-xl flex items-center gap-2.5 transition-all',
          activated
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
            : ls === 'expired'
            ? 'bg-red-50 border border-red-200 animate-pulse'
            : 'bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100'
        )}>
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            activated ? 'bg-green-100' : ls === 'expired' ? 'bg-red-100' : 'bg-primary-100'
          )}>
            {activated
              ? <Crown size={15} className="text-green-600" />
              : ls === 'expired'
              ? <Zap size={15} className="text-red-500" />
              : <Clock size={15} className="text-primary-500" />
            }
          </div>
          <div className="flex-1 min-w-0">
            {activated ? (
              <>
                <div className="text-xs font-bold text-green-700 truncate">
                  {licPlan === 'enterprise' ? '企业版' : licPlan === 'professional' ? '专业版' : '标准版'}
                </div>
                <div className="text-xs text-green-500">已激活 · 长期有效</div>
              </>
            ) : ls === 'expired' ? (
              <>
                <div className="text-xs font-bold text-red-600">试用已到期</div>
                <div className="text-xs text-red-400">点击购买激活</div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-primary-700">试用版</div>
                <div className="text-xs text-primary-400">剩余 {daysLeft()} 天 · 点击激活</div>
              </>
            )}
          </div>
        </Link>
      )}

      {/* Collapse + Logout */}
      <div className="border-t border-gray-100 p-2 space-y-1">
        <button
          onClick={handleLogout}
          title="退出登录"
          className={cn(
            'w-full flex items-center gap-2 py-2 px-3 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-sm',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-xs">退出登录</span>}
        </button>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors text-sm',
            sidebarCollapsed && 'px-2'
          )}
        >
          <ChevronLeft size={16} className={cn('transition-transform flex-shrink-0', sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && <span className="text-xs">收起侧边栏</span>}
        </button>
      </div>
    </aside>
  )
}
