'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useAuthStore, ROLE_CONFIG, ROLE_PERMISSIONS } from '@/store/auth'
import { useAppStore } from '@/store'
import { SystemUser, UserRole, Permission } from '@/types'
import { generateId } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Plus, Edit2, Trash2, Lock, ToggleLeft, ToggleRight,
  ShieldCheck, Users, Clock, Eye, EyeOff, KeyRound, UserCheck
} from 'lucide-react'

const PERMISSION_LABELS: Record<Permission, string> = {
  'dashboard.view': '查看仪表盘',
  'employee.view': '查看员工列表',
  'employee.create': '新增员工',
  'employee.edit': '编辑员工',
  'employee.delete': '删除员工',
  'attendance.view': '查看考勤',
  'attendance.edit': '修改考勤',
  'attendance.import': '导入打卡数据',
  'attendance.sync': 'API 自动同步',
  'payroll.view': '查看薪资',
  'payroll.calculate': '计算薪资',
  'payroll.review': '审核薪资',
  'payroll.issue': '标记已发放',
  'reports.view': '查看报表',
  'reports.export': '导出报表',
  'settings.view': '查看设置',
  'settings.edit': '修改设置',
  'admin.users': '用户权限管理',
  'my.attendance': '个人考勤查询',
  'my.payroll': '个人工资条',
}

const PERMISSION_GROUPS = [
  { label: '首页', keys: ['dashboard.view'] },
  { label: '员工管理', keys: ['employee.view', 'employee.create', 'employee.edit', 'employee.delete'] },
  { label: '考勤管理', keys: ['attendance.view', 'attendance.edit', 'attendance.import', 'attendance.sync'] },
  { label: '薪酬管理', keys: ['payroll.view', 'payroll.calculate', 'payroll.review', 'payroll.issue'] },
  { label: '报表中心', keys: ['reports.view', 'reports.export'] },
  { label: '系统设置', keys: ['settings.view', 'settings.edit'] },
  { label: '后台管理', keys: ['admin.users'] },
  { label: '个人中心', keys: ['my.attendance', 'my.payroll'] },
]

type ActiveTab = 'users' | 'roles' | 'logs'

const defaultForm = {
  username: '', password: '', displayName: '', role: 'employee' as UserRole,
  employeeId: '', departmentId: '', email: '', phone: '', enabled: true
}

export default function AdminPage() {
  const { users, addUser, updateUser, resetPassword, deleteUser, toggleUserEnabled, currentUser } = useAuthStore()
  const { employees, departments } = useAppStore()
  const me = currentUser()

  const [activeTab, setActiveTab] = useState<ActiveTab>('users')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [showPwd, setShowPwd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [pwdModal, setPwdModal] = useState<SystemUser | null>(null)
  const [newPwd, setNewPwd] = useState('')
  const [newPwdShow, setNewPwdShow] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin')

  const openAdd = () => {
    setEditingUser(null)
    setForm(defaultForm)
    setShowPwd(false)
    setModalOpen(true)
  }

  const openEdit = (u: SystemUser) => {
    setEditingUser(u)
    setForm({
      username: u.username, password: '',
      displayName: u.displayName, role: u.role,
      employeeId: u.employeeId || '', departmentId: u.departmentId || '',
      email: u.email, phone: u.phone, enabled: u.enabled
    })
    setShowPwd(false)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.username.trim()) return toast.error('请填写用户名')
    if (!form.displayName.trim()) return toast.error('请填写显示名称')
    if (!editingUser && !form.password) return toast.error('请填写初始密码')

    if (editingUser) {
      updateUser(editingUser.id, {
        displayName: form.displayName,
        role: form.role,
        employeeId: form.employeeId || null,
        departmentId: form.departmentId || null,
        email: form.email,
        phone: form.phone,
        enabled: form.enabled,
      })
      toast.success('用户已更新')
    } else {
      // Check username uniqueness
      if (users.some(u => u.username === form.username)) {
        return toast.error('用户名已存在')
      }
      addUser({
        username: form.username,
        password: form.password,
        displayName: form.displayName,
        role: form.role,
        employeeId: form.employeeId || null,
        departmentId: form.departmentId || null,
        email: form.email,
        phone: form.phone,
        avatar: null,
        enabled: form.enabled,
        lastLogin: null,
        createdBy: me?.id || 'admin',
      })
      toast.success('用户已创建')
    }
    setModalOpen(false)
  }

  const handleResetPwd = () => {
    if (!newPwd || newPwd.length < 4) return toast.error('密码至少4位')
    if (pwdModal) {
      resetPassword(pwdModal.id, newPwd)
      toast.success('密码已重置')
    }
    setPwdModal(null)
    setNewPwd('')
  }

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-'
  const getEmpName = (id: string) => employees.find(e => e.id === id)?.name || '-'

  const roleColors: Record<UserRole, string> = {
    admin: '#ef4444', hr: '#3b82f6', finance: '#10b981', employee: '#8b5cf6'
  }

  const stats = {
    total: users.length,
    enabled: users.filter(u => u.enabled).length,
    admins: users.filter(u => u.role === 'admin').length,
    loggedIn: users.filter(u => u.lastLogin).length,
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="用户权限管理" subtitle="管理系统用户账号、分配角色与权限" />

      <div className="flex-1 p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '系统用户总数', value: stats.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: '已启用账号', value: stats.enabled, icon: UserCheck, color: 'text-green-600 bg-green-50' },
            { label: '管理员账号', value: stats.admins, icon: ShieldCheck, color: 'text-red-600 bg-red-50' },
            { label: '已登录过', value: stats.loggedIn, icon: Clock, color: 'text-purple-600 bg-purple-50' },
          ].map(s => (
            <Card key={s.label} className="flex items-center gap-3 py-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { key: 'users', label: '用户账号管理' },
            { key: 'roles', label: '角色权限矩阵' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ActiveTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
          <Card padding={false}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <span className="text-sm text-gray-500">共 {users.length} 个账号</span>
              <Button size="sm" onClick={openAdd}><Plus size={14} />新增用户</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['用户信息', '用户名', '角色', '关联员工', '部门', '状态', '最后登录', '操作'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => {
                    const cfg = ROLE_CONFIG.find(r => r.role === u.role)
                    const isSelf = u.id === me?.id
                    return (
                      <tr key={u.id} className={`hover:bg-gray-50 ${isSelf ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: cfg?.color || '#6b7280' }}
                            >
                              {u.displayName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 flex items-center gap-1.5">
                                {u.displayName}
                                {isSelf && <span className="text-xs text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded-full">我</span>}
                              </div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{u.username}</code>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ background: cfg?.color || '#6b7280' }}
                          >
                            {cfg?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {u.employeeId ? getEmpName(u.employeeId) : <span className="text-gray-300">未绑定</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {u.departmentId ? getDeptName(u.departmentId) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => !isSelf && toggleUserEnabled(u.id)}
                            className={isSelf ? 'cursor-not-allowed' : 'cursor-pointer'}
                            title={isSelf ? '不能禁用自己' : ''}
                          >
                            {u.enabled
                              ? <span className="flex items-center gap-1 text-green-600"><ToggleRight size={18} className="text-green-500" />启用</span>
                              : <span className="flex items-center gap-1 text-gray-400"><ToggleLeft size={18} />禁用</span>
                            }
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '从未登录'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500" title="编辑">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => { setPwdModal(u); setNewPwd('') }} className="p-1.5 hover:bg-yellow-50 rounded-lg text-yellow-500" title="重置密码">
                              <KeyRound size={14} />
                            </button>
                            {!isSelf && (
                              <button onClick={() => setDeleteTarget(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400" title="删除">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Role Permission Matrix */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Role selector */}
            <Card>
              <CardHeader><CardTitle>角色列表</CardTitle></CardHeader>
              <div className="space-y-2">
                {ROLE_CONFIG.map(r => (
                  <button
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedRole === r.role ? 'border-current bg-opacity-5' : 'border-gray-100 hover:border-gray-200'
                    }`}
                    style={selectedRole === r.role ? { borderColor: r.color, background: `${r.color}10` } : {}}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                      style={{ background: r.color }}>
                      {r.label[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-800">{r.label}</div>
                      <div className="text-xs text-gray-400 truncate">{r.description.slice(0, 15)}…</div>
                      <div className="text-xs mt-1" style={{ color: r.color }}>
                        {users.filter(u => u.role === r.role).length} 个用户
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Permission Detail */}
            <Card className="lg:col-span-3">
              {(() => {
                const cfg = ROLE_CONFIG.find(r => r.role === selectedRole)!
                const perms = ROLE_PERMISSIONS[selectedRole]
                return (
                  <>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: cfg.color }}>
                          {cfg.label[0]}
                        </div>
                        <div>
                          <CardTitle>{cfg.label} — 权限详情</CardTitle>
                          <p className="text-xs text-gray-400 mt-0.5">{cfg.description}</p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold" style={{ color: cfg.color }}>
                        {perms.length} / {Object.keys(PERMISSION_LABELS).length} 项权限
                      </div>
                    </CardHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PERMISSION_GROUPS.map(group => (
                        <div key={group.label}>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{group.label}</p>
                          <div className="space-y-1.5">
                            {group.keys.map(key => {
                              const hasPerm = perms.includes(key as Permission)
                              return (
                                <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                  hasPerm ? 'bg-green-50' : 'bg-gray-50'
                                }`}>
                                  {hasPerm
                                    ? <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
                                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                  }
                                  <span className={hasPerm ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                                    {PERMISSION_LABELS[key as Permission]}
                                  </span>
                                  {hasPerm && (
                                    <Badge variant="success" className="ml-auto text-xs py-0">允许</Badge>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </Card>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `编辑用户：${editingUser.displayName}` : '新增系统用户'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSave}>{editingUser ? '保存修改' : '创建用户'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="登录用户名 *"
            value={form.username}
            disabled={!!editingUser}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="字母+数字，不可修改"
          />
          <Input
            label="显示名称 *"
            value={form.displayName}
            onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
            placeholder="如：张三（HR）"
          />

          {!editingUser && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">初始密码 *</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="至少6位"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <Select
            label="角色 *"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
          >
            {ROLE_CONFIG.map(r => (
              <option key={r.role} value={r.role}>{r.label} — {r.description.slice(0, 16)}…</option>
            ))}
          </Select>

          <Select
            label="关联员工档案"
            value={form.employeeId}
            onChange={e => {
              const emp = employees.find(emp => emp.id === e.target.value)
              setForm(f => ({
                ...f,
                employeeId: e.target.value,
                departmentId: emp?.departmentId || f.departmentId
              }))
            }}
          >
            <option value="">不关联（管理账号）</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.employeeNo}</option>)}
          </Select>

          <Input
            label="邮箱"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="手机号"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />

          <div className="col-span-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="user-enabled"
                checked={form.enabled}
                onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="user-enabled" className="text-sm text-gray-700">启用该账号</label>
            </div>
          </div>

          {/* Permission preview */}
          <div className="col-span-2 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-2">该角色拥有的权限预览：</p>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_PERMISSIONS[form.role].slice(0, 12).map(p => (
                <span key={p} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                  {PERMISSION_LABELS[p]}
                </span>
              ))}
              {ROLE_PERMISSIONS[form.role].length > 12 && (
                <span className="text-xs text-gray-400">+{ROLE_PERMISSIONS[form.role].length - 12} 项…</span>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={!!pwdModal}
        onClose={() => setPwdModal(null)}
        title={`重置密码：${pwdModal?.displayName}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPwdModal(null)}>取消</Button>
            <Button onClick={handleResetPwd}>确认重置</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-700">
            ⚠️ 重置后用户需使用新密码重新登录
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <div className="relative">
              <input
                type={newPwdShow ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="至少4位"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => setNewPwdShow(!newPwdShow)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {newPwdShow ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteTarget && deleteUser(deleteTarget); setDeleteTarget(null); toast.success('用户已删除') }}
        title="确认删除用户"
        message="删除后该用户将无法登录系统，历史操作日志将保留。确认删除吗？"
        confirmText="确认删除"
        danger
      />
    </div>
  )
}
