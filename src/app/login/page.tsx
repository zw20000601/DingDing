'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, ROLE_CONFIG } from '@/store/auth'
import { Building2, Eye, EyeOff, Lock, User, Shield, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoggedIn, currentUser } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoTab, setDemoTab] = useState<'accounts' | null>(null)

  // Already logged in → redirect
  useEffect(() => {
    if (isLoggedIn()) {
      const user = currentUser()
      router.replace(user?.role === 'employee' ? '/my' : '/')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) { setError('请填写用户名和密码'); return }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const result = login(username, password)
    setLoading(false)
    if (result.success) {
      const user = currentUser()
      router.replace(user?.role === 'employee' ? '/my' : '/')
    } else {
      setError(result.message)
    }
  }

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'admin', name: '系统管理员' },
    { username: 'hr', password: 'hr123', role: 'hr', name: 'HR 行政' },
    { username: 'finance', password: 'finance123', role: 'finance', name: '财务人员' },
    { username: 'wangfang', password: 'wang123', role: 'employee', name: '普通员工' },
  ]

  const quickLogin = (acc: typeof demoAccounts[0]) => {
    setUsername(acc.username)
    setPassword(acc.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-white">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">钉钉考勤薪酬</div>
                <div className="text-blue-200 text-xs">企业管理系统</div>
              </div>
            </div>

            <h1 className="text-3xl font-bold leading-tight mb-4">
              智能考勤<br />精准薪酬
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed">
              深度集成钉钉开放平台，实现打卡数据自动采集、考勤状态智能判定，以及薪酬精准核算的全流程自动化。
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: '⚡', title: '自动化同步', desc: '钉钉 API 自动拉取打卡记录' },
              { icon: '🎯', title: '精准核算', desc: '规则引擎统一处理，误差为零' },
              { icon: '🔒', title: '角色隔离', desc: '按角色权限隔离敏感数据' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-blue-200 text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-blue-300 text-xs">© 2025 DingTalk Attendance & Payroll System</div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-10">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div className="font-bold text-gray-800">钉钉考勤薪酬管理</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">欢迎回来</h2>
            <p className="text-gray-400 text-sm mt-1">登录您的账号以继续</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
                <Shield size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  登录中...
                </>
              ) : (
                <><LogIn size={16} />立即登录</>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <button
              onClick={() => setDemoTab(demoTab ? null : 'accounts')}
              className="w-full text-center text-xs text-gray-400 hover:text-primary-500 transition-colors flex items-center justify-center gap-1"
            >
              <Shield size={12} />
              演示账号快速登录
            </button>

            {demoTab && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {demoAccounts.map(acc => {
                  const cfg = ROLE_CONFIG.find(r => r.role === acc.role)
                  return (
                    <button
                      key={acc.username}
                      onClick={() => quickLogin(acc)}
                      className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: cfg?.color || '#3b82f6' }}
                      >
                        {acc.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-700 truncate">{acc.name}</div>
                        <div className="text-xs text-gray-400 truncate">{acc.username}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Role hint */}
          <div className="mt-6 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700 font-semibold mb-1.5">角色权限说明</p>
            <div className="space-y-1">
              {ROLE_CONFIG.map(r => (
                <div key={r.role} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="font-medium" style={{ color: r.color }}>{r.label}</span>
                  <span className="truncate">— {r.description.slice(0, 18)}…</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
