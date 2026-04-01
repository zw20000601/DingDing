'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Pagination } from '@/components/ui/Table'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useAppStore } from '@/store'
import { Employee, WorkSchedule } from '@/types'
import { generateId } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Plus, Search, Edit2, Trash2, Upload, Users,
  Building2, Briefcase, Phone, Mail, Calendar
} from 'lucide-react'

const PAGE_SIZE = 10

const defaultForm: Omit<Employee, 'id' | 'createdAt'> = {
  name: '', employeeNo: '', departmentId: '', position: '',
  hireDate: '', phone: '', email: '',
  salaryBase: 8000, positionAllowance: 500, overtimeHourlyRate: 50,
  workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
  dingUserId: null, enabled: true,
}

export default function EmployeesPage() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useAppStore()

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState<Omit<Employee, 'id' | 'createdAt'>>(defaultForm)
  const [activeTab, setActiveTab] = useState<'list' | 'dept'>('list')

  // Filter
  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.includes(search) || e.employeeNo.includes(search) || e.position.includes(search)
    const matchDept = !deptFilter || e.departmentId === deptFilter
    return matchSearch && matchDept
  })

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-'

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (emp: Employee) => {
    setEditing(emp)
    setForm({ ...emp })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('请填写员工姓名')
    if (!form.departmentId) return toast.error('请选择部门')
    if (!form.employeeNo.trim()) return toast.error('请填写工号')

    if (editing) {
      updateEmployee(editing.id, form)
      toast.success('员工信息已更新')
    } else {
      addEmployee({ ...form, id: generateId(), createdAt: new Date().toISOString() })
      toast.success('员工添加成功')
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteEmployee(id)
    toast.success('员工已删除')
    setDeleteId(null)
  }

  const columns = [
    {
      key: 'employeeNo', title: '工号', width: '80px',
      render: (_: unknown, row: Employee) => (
        <span className="font-mono text-xs text-gray-500">{row.employeeNo}</span>
      )
    },
    {
      key: 'name', title: '姓名',
      render: (_: unknown, row: Employee) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {row.name[0]}
          </div>
          <div>
            <div className="font-medium text-gray-800">{row.name}</div>
            <div className="text-xs text-gray-400">{row.email || row.phone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'departmentId', title: '部门',
      render: (_: unknown, row: Employee) => (
        <span className="text-gray-600">{getDeptName(row.departmentId)}</span>
      )
    },
    { key: 'position', title: '岗位' },
    {
      key: 'workSchedule', title: '工作制',
      render: (_: unknown, row: Employee) => (
        <Badge variant="info">{row.workSchedule}</Badge>
      )
    },
    {
      key: 'salaryBase', title: '底薪',
      render: (_: unknown, row: Employee) => (
        <span className="font-medium text-gray-700">¥{row.salaryBase.toLocaleString()}</span>
      )
    },
    {
      key: 'hireDate', title: '入职日期',
      render: (_: unknown, row: Employee) => (
        <span className="text-gray-500 text-xs">{row.hireDate}</span>
      )
    },
    {
      key: 'enabled', title: '状态',
      render: (_: unknown, row: Employee) => (
        <Badge variant={row.enabled ? 'success' : 'default'}>{row.enabled ? '在职' : '离职'}</Badge>
      )
    },
    {
      key: 'actions', title: '操作', width: '90px',
      render: (_: unknown, row: Employee) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  // Stats
  const enabledCount = employees.filter(e => e.enabled).length
  const deptStats = departments.filter(d => d.parentId !== null).map(d => ({
    name: d.name,
    count: employees.filter(e => e.departmentId === d.id && e.enabled).length,
  })).filter(d => d.count > 0)

  return (
    <div className="flex flex-col h-full">
      <Header title="员工管理" subtitle="管理员工信息、部门结构与薪资配置" />

      <div className="flex-1 p-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '在职员工', value: enabledCount, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: '部门数量', value: departments.filter(d => d.enabled).length, icon: Building2, color: 'text-green-600 bg-green-50' },
            { label: '岗位数量', value: new Set(employees.map(e => e.position)).size, icon: Briefcase, color: 'text-purple-600 bg-purple-50' },
            { label: '本月新入职', value: employees.filter(e => e.hireDate.startsWith(new Date().toISOString().slice(0, 7))).length, icon: Calendar, color: 'text-orange-600 bg-orange-50' },
          ].map(s => (
            <Card key={s.label} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
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
          {(['list', 'dept'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'list' ? '员工列表' : '部门管理'}
            </button>
          ))}
        </div>

        {activeTab === 'list' ? (
          <Card padding={false}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="搜索姓名、工号、岗位..."
                    className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={e => { setDeptFilter(e.target.value); setPage(1) }}
                  className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">全部部门</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <Upload size={14} />导入 Excel
                </Button>
                <Button size="sm" onClick={openAdd}>
                  <Plus size={14} />添加员工
                </Button>
              </div>
            </div>

            <Table<Record<string, unknown>>
              columns={columns as never}
              data={paginated as never}
              rowKey={r => (r as unknown as Employee).id}
            />
            <div className="px-4 pb-4">
              <Pagination current={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </Card>
        ) : (
          <DepartmentTab />
        )}
      </div>

      {/* Employee Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '编辑员工信息' : '添加新员工'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSave}>{editing ? '保存修改' : '确认添加'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="姓名 *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="请输入姓名"
          />
          <Input
            label="工号 *"
            value={form.employeeNo}
            onChange={e => setForm(f => ({ ...f, employeeNo: e.target.value }))}
            placeholder="如：E001"
          />
          <Select
            label="部门 *"
            value={form.departmentId}
            onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
          >
            <option value="">请选择部门</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Input
            label="岗位"
            value={form.position}
            onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
            placeholder="如：前端工程师"
          />
          <Input
            label="入职日期"
            type="date"
            value={form.hireDate}
            onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))}
          />
          <Input
            label="联系电话"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="13800000000"
          />
          <Input
            label="邮箱"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="name@company.com"
          />
          <Select
            label="工作制度"
            value={form.workSchedule}
            onChange={e => setForm(f => ({ ...f, workSchedule: e.target.value as WorkSchedule }))}
          >
            {(['做五休二', '单休', '大小周', '排班制'] as WorkSchedule[]).map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </Select>
          <Input
            label="标准上班时间"
            type="time"
            value={form.workStartTime}
            onChange={e => setForm(f => ({ ...f, workStartTime: e.target.value }))}
          />
          <Input
            label="标准下班时间"
            type="time"
            value={form.workEndTime}
            onChange={e => setForm(f => ({ ...f, workEndTime: e.target.value }))}
          />

          <div className="col-span-2 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">薪资配置</p>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="底薪（元）"
                type="number"
                value={form.salaryBase}
                onChange={e => setForm(f => ({ ...f, salaryBase: Number(e.target.value) }))}
              />
              <Input
                label="岗位津贴（元）"
                type="number"
                value={form.positionAllowance}
                onChange={e => setForm(f => ({ ...f, positionAllowance: Number(e.target.value) }))}
              />
              <Input
                label="加班基准时薪（元）"
                type="number"
                value={form.overtimeHourlyRate}
                onChange={e => setForm(f => ({ ...f, overtimeHourlyRate: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="col-span-2">
            <Input
              label="钉钉 UserID（可选）"
              value={form.dingUserId || ''}
              onChange={e => setForm(f => ({ ...f, dingUserId: e.target.value || null }))}
              placeholder="绑定钉钉账号用于 API 同步"
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="确认删除员工"
        message="删除后该员工的历史数据将被保留，但无法继续生成新的考勤记录。确定要删除吗？"
        confirmText="确认删除"
        danger
      />
    </div>
  )
}

function DepartmentTab() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, employees } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<typeof departments[0] | null>(null)
  const [form, setForm] = useState({ name: '', code: '', parentId: '', enabled: true })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', code: '', parentId: '', enabled: true })
    setModalOpen(true)
  }

  const openEdit = (dept: typeof departments[0]) => {
    setEditing(dept)
    setForm({ name: dept.name, code: dept.code, parentId: dept.parentId || '', enabled: dept.enabled })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name) return toast.error('请填写部门名称')
    if (editing) {
      updateDepartment(editing.id, { ...form, parentId: form.parentId || null })
      toast.success('部门已更新')
    } else {
      addDepartment({
        id: generateId(), name: form.name, code: form.code,
        parentId: form.parentId || null, leaderId: null,
        enabled: true, createdAt: new Date().toISOString()
      })
      toast.success('部门已添加')
    }
    setModalOpen(false)
  }

  const columns = [
    { key: 'name', title: '部门名称', render: (_: unknown, row: typeof departments[0]) => (
      <div className="flex items-center gap-2">
        <Building2 size={14} className="text-primary-500" />
        <span className="font-medium">{row.name}</span>
        {row.parentId === null && <Badge variant="info">根部门</Badge>}
      </div>
    )},
    { key: 'code', title: '部门编码', render: (_: unknown, row: typeof departments[0]) => (
      <span className="font-mono text-xs text-gray-500">{row.code}</span>
    )},
    { key: 'parent', title: '上级部门', render: (_: unknown, row: typeof departments[0]) => (
      <span>{departments.find(d => d.id === row.parentId)?.name || '-'}</span>
    )},
    { key: 'count', title: '员工数', render: (_: unknown, row: typeof departments[0]) => (
      <span className="font-medium">{employees.filter(e => e.departmentId === row.id).length} 人</span>
    )},
    { key: 'enabled', title: '状态', render: (_: unknown, row: typeof departments[0]) => (
      <Badge variant={row.enabled ? 'success' : 'default'}>{row.enabled ? '启用' : '禁用'}</Badge>
    )},
    { key: 'actions', title: '操作', render: (_: unknown, row: typeof departments[0]) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500"><Edit2 size={14} /></button>
        <button onClick={() => setDeleteId(row.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <>
      <Card padding={false}>
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <span className="text-sm text-gray-600">共 {departments.length} 个部门</span>
          <Button size="sm" onClick={openAdd}><Plus size={14} />新增部门</Button>
        </div>
        <Table columns={columns as never} data={departments as never} rowKey={r => (r as unknown as typeof departments[0]).id} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑部门' : '新增部门'}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button><Button onClick={handleSave}>确认</Button></>}>
        <div className="space-y-4">
          <Input label="部门名称 *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="部门编码" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          <Select label="上级部门" value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
            <option value="">无（根部门）</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteId && deleteDepartment(deleteId); setDeleteId(null); toast.success('已删除') }}
        title="确认删除部门" message="删除后该部门下的员工将失去部门归属，确认吗？" danger />
    </>
  )
}
