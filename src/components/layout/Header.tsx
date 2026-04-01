'use client'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { attendanceRecords } = useAppStore()
  const [searchValue, setSearchValue] = useState('')

  const anomalyCount = attendanceRecords.filter(r =>
    r.status === '缺卡' || r.status === '旷工'
  ).length

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
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
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

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            HR
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-gray-700">系统管理员</div>
            <div className="text-xs text-gray-400">admin@company.com</div>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden md:block" />
        </div>
      </div>
    </header>
  )
}
