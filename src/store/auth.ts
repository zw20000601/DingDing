import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SystemUser, AuthSession, UserRole, Permission, RolePermission } from '@/types'
import { generateId } from '@/lib/utils'

// ===== 角色权限矩阵 =====
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard.view',
    'employee.view', 'employee.create', 'employee.edit', 'employee.delete',
    'attendance.view', 'attendance.edit', 'attendance.import', 'attendance.sync',
    'payroll.view', 'payroll.calculate', 'payroll.review', 'payroll.issue',
    'reports.view', 'reports.export',
    'settings.view', 'settings.edit',
    'admin.users',
    'my.attendance', 'my.payroll',
  ],
  hr: [
    'dashboard.view',
    'employee.view', 'employee.create', 'employee.edit',
    'attendance.view', 'attendance.edit', 'attendance.import', 'attendance.sync',
    'reports.view', 'reports.export',
    'settings.view',
    'my.attendance', 'my.payroll',
  ],
  finance: [
    'dashboard.view',
    'employee.view',
    'attendance.view',
    'payroll.view', 'payroll.calculate', 'payroll.review', 'payroll.issue',
    'reports.view', 'reports.export',
    'my.attendance', 'my.payroll',
  ],
  employee: [
    'my.attendance',
    'my.payroll',
  ],
}

export const ROLE_CONFIG: RolePermission[] = [
  {
    role: 'admin',
    label: '系统管理员',
    description: '拥有所有权限，可管理用户、配置系统参数',
    color: '#ef4444',
    permissions: ROLE_PERMISSIONS.admin,
  },
  {
    role: 'hr',
    label: 'HR / 行政',
    description: '负责员工管理、考勤数据导入与审核',
    color: '#3b82f6',
    permissions: ROLE_PERMISSIONS.hr,
  },
  {
    role: 'finance',
    label: '财务人员',
    description: '负责薪酬核算、审核与导出工资表',
    color: '#10b981',
    permissions: ROLE_PERMISSIONS.finance,
  },
  {
    role: 'employee',
    label: '普通员工',
    description: '仅可查看个人考勤记录与工资条',
    color: '#8b5cf6',
    permissions: ROLE_PERMISSIONS.employee,
  },
]

// ===== 简单密码哈希（演示用，生产环境请用 bcrypt）=====
function hashPassword(pwd: string): string {
  return btoa(pwd + ':ding2025')
}
function verifyPassword(pwd: string, hash: string): boolean {
  return hashPassword(pwd) === hash
}

// ===== 初始系统用户 =====
const initialUsers: SystemUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    passwordHash: hashPassword('admin123'),
    displayName: '系统管理员',
    role: 'admin',
    employeeId: 'emp-1',
    departmentId: 'dept-1',
    email: 'admin@company.com',
    phone: '13800000001',
    avatar: null,
    enabled: true,
    lastLogin: null,
    createdAt: '2025-01-01',
    createdBy: 'system',
  },
  {
    id: 'user-hr',
    username: 'hr',
    passwordHash: hashPassword('hr123'),
    displayName: '孙丽（HR）',
    role: 'hr',
    employeeId: 'emp-7',
    departmentId: 'dept-4',
    email: 'sunli@company.com',
    phone: '13800000007',
    avatar: null,
    enabled: true,
    lastLogin: null,
    createdAt: '2025-01-01',
    createdBy: 'user-admin',
  },
  {
    id: 'user-finance',
    username: 'finance',
    passwordHash: hashPassword('finance123'),
    displayName: '吴敏（财务）',
    role: 'finance',
    employeeId: 'emp-9',
    departmentId: 'dept-5',
    email: 'wumin@company.com',
    phone: '13800000009',
    avatar: null,
    enabled: true,
    lastLogin: null,
    createdAt: '2025-01-01',
    createdBy: 'user-admin',
  },
  {
    id: 'user-emp-wangfang',
    username: 'wangfang',
    passwordHash: hashPassword('wang123'),
    displayName: '王芳',
    role: 'employee',
    employeeId: 'emp-3',
    departmentId: 'dept-7',
    email: 'wangfang@company.com',
    phone: '13800000003',
    avatar: null,
    enabled: true,
    lastLogin: null,
    createdAt: '2025-01-01',
    createdBy: 'user-admin',
  },
  {
    id: 'user-emp-chengang',
    username: 'chengang',
    passwordHash: hashPassword('chen123'),
    displayName: '陈刚',
    role: 'employee',
    employeeId: 'emp-4',
    departmentId: 'dept-8',
    email: 'chengang@company.com',
    phone: '13800000004',
    avatar: null,
    enabled: true,
    lastLogin: null,
    createdAt: '2025-01-01',
    createdBy: 'user-admin',
  },
]

// ===== Auth Store =====
interface AuthStore {
  users: SystemUser[]
  session: AuthSession | null

  // 认证
  login: (username: string, password: string) => { success: boolean; message: string }
  logout: () => void
  isLoggedIn: () => boolean
  currentUser: () => SystemUser | null
  hasPermission: (permission: Permission) => boolean

  // 用户管理（管理员）
  addUser: (user: Omit<SystemUser, 'id' | 'passwordHash' | 'createdAt'> & { password: string }) => void
  updateUser: (id: string, data: Partial<Omit<SystemUser, 'id' | 'passwordHash'>>) => void
  resetPassword: (id: string, newPassword: string) => void
  deleteUser: (id: string) => void
  toggleUserEnabled: (id: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      session: null,

      login: (username, password) => {
        const user = get().users.find(u => u.username === username)
        if (!user) return { success: false, message: '用户名不存在' }
        if (!user.enabled) return { success: false, message: '账号已被禁用，请联系管理员' }
        if (!verifyPassword(password, user.passwordHash)) return { success: false, message: '密码错误' }

        const now = new Date()
        const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString()
        set(s => ({
          session: { user, loginAt: now.toISOString(), expiresAt },
          users: s.users.map(u => u.id === user.id ? { ...u, lastLogin: now.toISOString() } : u)
        }))
        return { success: true, message: '登录成功' }
      },

      logout: () => set({ session: null }),

      isLoggedIn: () => {
        const session = get().session
        if (!session) return false
        return new Date(session.expiresAt) > new Date()
      },

      currentUser: () => {
        const session = get().session
        if (!session) return null
        // 从 users 取最新数据（防止角色被修改后 session 过期）
        return get().users.find(u => u.id === session.user.id) || null
      },

      hasPermission: (permission) => {
        const user = get().currentUser()
        if (!user) return false
        return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
      },

      addUser: ({ password, ...data }) => {
        const newUser: SystemUser = {
          ...data,
          id: generateId(),
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
          createdBy: get().currentUser()?.id || 'system',
          lastLogin: null,
        }
        set(s => ({ users: [...s.users, newUser] }))
      },

      updateUser: (id, data) => {
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, ...data } : u)
        }))
        // 如果是当前用户，同步 session
        const session = get().session
        if (session?.user.id === id) {
          const updated = get().users.find(u => u.id === id)
          if (updated) set({ session: { ...session, user: updated } })
        }
      },

      resetPassword: (id, newPassword) => {
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, passwordHash: hashPassword(newPassword) } : u)
        }))
      },

      deleteUser: (id) => {
        set(s => ({ users: s.users.filter(u => u.id !== id) }))
      },

      toggleUserEnabled: (id) => {
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, enabled: !u.enabled } : u)
        }))
      },
    }),
    {
      name: 'dingtalk-auth-storage',
      partialize: (state) => ({
        users: state.users,
        session: state.session,
      }),
    }
  )
)
