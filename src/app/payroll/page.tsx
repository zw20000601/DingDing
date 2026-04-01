'use client'
import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Pagination } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useAppStore } from '@/store'
import { PayrollRecord, PayrollStatus } from '@/types'
import { calculatePayroll } from '@/lib/payroll'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Calculator, Download, CheckCircle, Clock, Eye,
  ChevronLeft, ChevronRight, Plus, Minus, DollarSign, TrendingUp, Users, AlertCircle
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

const PAGE_SIZE = 10
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280']

const STATUS_MAP: Record<PayrollStatus, { variant: 'default' | 'warning' | 'success' | 'info'; label: string }> = {
  '草稿': { variant: 'default', label: '草稿' },
  '待审核': { variant: 'warning', label: '待审核' },
  '已审核': { variant: 'info', label: '已审核' },
  '已发放': { variant: 'success', label: '已发放' },
}

export default function PayrollPage() {
  const {
    payrollRecords, employees, departments, monthlySummaries,
    settings, currentYear, currentMonth, setCurrentYearMonth,
    addPayrollRecord, updatePayrollRecord
  } = useAppStore()

  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list')
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<PayrollRecord | null>(null)
  const [reviewRemark, setReviewRemark] = useState('')
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false)
  const [allowances, setAllowances] = useState<Array<{ name: string; amount: number }>>([])

  const currentRecords = useMemo(() =>
    payrollRecords.filter(r => r.year === currentYear && r.month === currentMonth),
    [payrollRecords, currentYear, currentMonth]
  )

  const paginated = currentRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalNetSalary = currentRecords.reduce((s, r) => s + r.netSalary, 0)
  const totalGrossSalary = currentRecords.reduce((s, r) => s + r.grossSalary, 0)
  const pendingCount = currentRecords.filter(r => r.status === '待审核').length
  const issuedCount = currentRecords.filter(r => r.status === '已发放').length

  // Calculate payroll for all employees
  const handleCalculateAll = async () => {
    setCalculating(true)
    await new Promise(r => setTimeout(r, 800))

    let count = 0
    employees.filter(e => e.enabled).forEach(emp => {
      const summary = monthlySummaries.find(s => s.employeeId === emp.id)
      if (!summary) return
      const record = calculatePayroll(emp, summary, settings.attendanceRules, currentYear, currentMonth, allowances)
      addPayrollRecord(record)
      count++
    })

    setCalculating(false)
    setAllowanceModalOpen(false)
    toast.success(`已完成 ${count} 名员工的薪资计算`)
  }

  const handleReview = (record: PayrollRecord) => {
    setReviewTarget(record)
    setReviewRemark('')
    setReviewModalOpen(true)
  }

  const handleApprove = () => {
    if (!reviewTarget) return
    updatePayrollRecord(reviewTarget.id, {
      status: '已审核',
      reviewedBy: '财务审核员',
      reviewedAt: new Date().toISOString(),
      remark: reviewRemark,
    })
    toast.success('薪资已审核通过')
    setReviewModalOpen(false)
  }

  const handleIssue = (id: string) => {
    updatePayrollRecord(id, { status: '已发放' })
    toast.success('薪资已标记为发放')
  }

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-'

  // Salary composition for pie chart
  const selectedComp = selectedRecord ? [
    { name: '基本工资', value: selectedRecord.basicSalary },
    { name: '岗位津贴', value: selectedRecord.positionAllowance },
    { name: '加班费', value: selectedRecord.totalOvertimePay },
    { name: '全勤奖', value: selectedRecord.fullAttendanceBonus },
    { name: '补贴报销', value: selectedRecord.totalAllowances },
  ].filter(d => d.value > 0) : []

  const columns = [
    {
      key: 'employeeName', title: '员工',
      render: (_: unknown, row: PayrollRecord) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
            {row.employeeName[0]}
          </div>
          <span className="font-medium">{row.employeeName}</span>
        </div>
      )
    },
    { key: 'departmentId', title: '部门', render: (_: unknown, row: PayrollRecord) => getDeptName(row.departmentId) },
    { key: 'actualDays', title: '实出勤', render: (_: unknown, row: PayrollRecord) => `${row.actualDays}/${row.requiredDays}天` },
    {
      key: 'grossSalary', title: '应发工资',
      render: (_: unknown, row: PayrollRecord) => (
        <span className="font-semibold text-gray-700">{formatCurrency(row.grossSalary)}</span>
      )
    },
    {
      key: 'totalDeduction', title: '扣款合计',
      render: (_: unknown, row: PayrollRecord) => {
        const total = row.lateDeduction + row.earlyLeaveDeduction + row.absentDeduction + row.absenteeismDeduction + row.socialInsurance + row.incomeTax
        return <span className="text-red-500">-{formatCurrency(total)}</span>
      }
    },
    {
      key: 'netSalary', title: '实发工资',
      render: (_: unknown, row: PayrollRecord) => (
        <span className="font-bold text-primary-700 text-base">{formatCurrency(row.netSalary)}</span>
      )
    },
    {
      key: 'status', title: '状态',
      render: (_: unknown, row: PayrollRecord) => {
        const cfg = STATUS_MAP[row.status]
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      }
    },
    {
      key: 'actions', title: '操作', width: '120px',
      render: (_: unknown, row: PayrollRecord) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectedRecord(row); setActiveTab('detail') }}
            className="p-1.5 hover:bg-blue-50 rounded text-blue-500" title="查看详情">
            <Eye size={14} />
          </button>
          {row.status === '待审核' && (
            <button onClick={() => handleReview(row)}
              className="p-1.5 hover:bg-green-50 rounded text-green-500" title="审核">
              <CheckCircle size={14} />
            </button>
          )}
          {row.status === '已审核' && (
            <button onClick={() => handleIssue(row.id)}
              className="p-1.5 hover:bg-purple-50 rounded text-purple-500" title="标记已发放">
              <DollarSign size={14} />
            </button>
          )}
        </div>
      )
    },
  ]

  // Dept salary bar chart
  const deptSalaryData = departments.filter(d => d.parentId !== null).slice(0, 5).map(dept => {
    const records = currentRecords.filter(r => r.departmentId === dept.id)
    return {
      name: dept.name.replace('部', ''),
      应发: Math.round(records.reduce((s, r) => s + r.grossSalary, 0) / 100) * 100,
      实发: Math.round(records.reduce((s, r) => s + r.netSalary, 0) / 100) * 100,
    }
  })

  return (
    <div className="flex flex-col h-full">
      <Header title="薪酬管理" subtitle="薪资计算、审核与发放管理" />

      <div className="flex-1 p-6 space-y-4">
        {/* Month + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
            <button onClick={() => {
              let m = currentMonth - 1, y = currentYear
              if (m < 1) { m = 12; y-- }
              setCurrentYearMonth(y, m)
            }} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <span className="text-base font-semibold text-gray-800 w-24 text-center">
              {currentYear} 年 {currentMonth} 月
            </span>
            <button onClick={() => {
              let m = currentMonth + 1, y = currentYear
              if (m > 12) { m = 1; y++ }
              setCurrentYearMonth(y, m)
            }} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setAllowanceModalOpen(true)}>
              <Plus size={14} />设置补贴
            </Button>
            <Button size="sm" loading={calculating} onClick={() => handleCalculateAll()}>
              <Calculator size={14} />
              {currentRecords.length > 0 ? '重新计算' : '一键计算'}
            </Button>
            {currentRecords.length > 0 && (
              <Button variant="secondary" size="sm">
                <Download size={14} />导出工资表
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '应发工资总额', value: formatCurrency(totalGrossSalary), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
            { label: '实发工资总额', value: formatCurrency(totalNetSalary), icon: DollarSign, color: 'text-green-600 bg-green-50' },
            { label: '待审核人数', value: `${pendingCount} 人`, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
            { label: '已发放人数', value: `${issuedCount} 人`, icon: Users, color: 'text-purple-600 bg-purple-50' },
          ].map(s => (
            <Card key={s.label} className="flex items-center gap-3 py-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-gray-800 truncate">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Row (only when records exist) */}
        {currentRecords.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>各部门薪资对比</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deptSalaryData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend iconSize={8} />
                  <Bar dataKey="应发" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="实发" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>薪资状态分布</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={Object.entries(STATUS_MAP).map(([key, val]) => ({
                      name: val.label,
                      value: currentRecords.filter(r => r.status === key).length
                    })).filter(d => d.value > 0)}
                    dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}
                  >
                    {['#94a3b8', '#f59e0b', '#3b82f6', '#22c55e'].map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[{ key: 'list', label: '薪资列表' }, { key: 'detail', label: '薪资明细' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'list' && (
          <Card padding={false}>
            {currentRecords.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-4 text-gray-400">
                <Calculator size={40} className="text-gray-200" />
                <div className="text-center">
                  <p className="font-medium">本月薪资尚未计算</p>
                  <p className="text-sm mt-1">点击「一键计算」自动生成本月薪资单</p>
                </div>
                <Button onClick={handleCalculateAll} loading={calculating}>
                  <Calculator size={14} />一键计算本月薪资
                </Button>
              </div>
            ) : (
              <>
                <Table<Record<string, unknown>>
                  columns={columns as never}
                  data={paginated as never}
                  rowKey={r => (r as unknown as PayrollRecord).id}
                />
                <div className="px-4 pb-4">
                  <Pagination current={page} total={currentRecords.length} pageSize={PAGE_SIZE} onChange={setPage} />
                </div>
              </>
            )}
          </Card>
        )}

        {activeTab === 'detail' && selectedRecord && (
          <PayrollDetailView record={selectedRecord} deptName={getDeptName(selectedRecord.departmentId)} />
        )}

        {activeTab === 'detail' && !selectedRecord && (
          <Card>
            <div className="py-12 text-center text-gray-400">
              <Eye size={32} className="mx-auto mb-3 text-gray-200" />
              <p>点击薪资列表中的查看按钮查看明细</p>
            </div>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="审核薪资"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>取消</Button>
            <Button onClick={handleApprove}>通过审核</Button>
          </>
        }
      >
        {reviewTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">员工</span>
                <span className="font-medium">{reviewTarget.employeeName}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">应发工资</span>
                <span className="font-semibold">{formatCurrency(reviewTarget.grossSalary)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">实发工资</span>
                <span className="font-bold text-primary-700 text-base">{formatCurrency(reviewTarget.netSalary)}</span>
              </div>
            </div>
            <Textarea
              label="审核备注（可选）"
              value={reviewRemark}
              onChange={e => setReviewRemark(e.target.value)}
              rows={3}
              placeholder="填写审核说明..."
            />
          </div>
        )}
      </Modal>

      {/* Allowance Modal */}
      <Modal
        open={allowanceModalOpen}
        onClose={() => setAllowanceModalOpen(false)}
        title="本月补贴与报销设置"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAllowanceModalOpen(false)}>取消</Button>
            <Button loading={calculating} onClick={handleCalculateAll}>计算薪资</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">为本月薪资计算添加补贴项（将应用于所有员工）</p>
          {allowances.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={a.name}
                onChange={e => setAllowances(arr => arr.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))}
                placeholder="补贴名称"
              />
              <Input
                type="number"
                value={a.amount}
                onChange={e => setAllowances(arr => arr.map((item, idx) => idx === i ? { ...item, amount: Number(e.target.value) } : item))}
                placeholder="金额"
                className="w-28"
              />
              <button onClick={() => setAllowances(arr => arr.filter((_, idx) => idx !== i))} className="text-red-400 p-1.5">
                <Minus size={16} />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setAllowances(arr => [...arr, { name: '', amount: 0 }])}>
            <Plus size={14} />添加补贴项
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function PayrollDetailView({ record, deptName }: { record: PayrollRecord; deptName: string }) {
  const compData = [
    { name: '基本工资', value: record.basicSalary },
    { name: '岗位津贴', value: record.positionAllowance },
    { name: '加班费', value: record.totalOvertimePay },
    { name: '全勤奖', value: record.fullAttendanceBonus },
    { name: '补贴报销', value: record.totalAllowances },
  ].filter(d => d.value > 0)

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left - Details */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
              {record.employeeName[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{record.employeeName}</div>
              <div className="text-sm text-gray-400">{deptName} · {record.year}年{record.month}月薪资</div>
            </div>
            <Badge variant={STATUS_MAP[record.status].variant} className="ml-auto">
              {record.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-0 text-sm">
            <Section title="收入项目" items={[
              { label: '底薪', value: formatCurrency(record.salaryBase) },
              { label: `基本工资（${record.actualDays}/${record.requiredDays}天）`, value: formatCurrency(record.basicSalary), highlight: true },
              { label: '岗位津贴', value: formatCurrency(record.positionAllowance) },
              { label: '工作日加班费', value: formatCurrency(record.overtimePayWeekday) },
              { label: '周末加班费', value: formatCurrency(record.overtimePayWeekend) },
              { label: '节假日加班费', value: formatCurrency(record.overtimePayHoliday) },
              { label: '全勤奖', value: formatCurrency(record.fullAttendanceBonus) },
              { label: '补贴报销', value: formatCurrency(record.totalAllowances) },
            ]} />

            <Section title="扣款项目" items={[
              { label: '迟到扣款', value: `-${formatCurrency(record.lateDeduction)}`, color: 'text-red-500' },
              { label: '早退扣款', value: `-${formatCurrency(record.earlyLeaveDeduction)}`, color: 'text-red-500' },
              { label: '缺勤扣款', value: `-${formatCurrency(record.absentDeduction)}`, color: 'text-red-500' },
              { label: '旷工扣款', value: `-${formatCurrency(record.absenteeismDeduction)}`, color: 'text-red-500' },
              { label: '五险一金（个人）', value: `-${formatCurrency(record.socialInsurance)}`, color: 'text-red-500' },
              { label: '个人所得税', value: `-${formatCurrency(record.incomeTax)}`, color: 'text-red-500' },
            ]} />
          </div>

          {/* Net Salary */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">应发工资</div>
              <div className="text-lg font-semibold text-gray-700">{formatCurrency(record.grossSalary)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">实发工资</div>
              <div className="text-2xl font-bold text-primary-700">{formatCurrency(record.netSalary)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right - Pie Chart */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>薪资构成</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={compData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {compData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend iconSize={8} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        {record.remark && (
          <Card>
            <p className="text-xs font-semibold text-gray-500 mb-2">备注</p>
            <p className="text-sm text-gray-600">{record.remark}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function Section({ title, items }: {
  title: string
  items: Array<{ label: string; value: string; highlight?: boolean; color?: string }>
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{title}</p>
      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.label} className={`flex justify-between py-1 ${item.highlight ? 'bg-blue-50 rounded px-2 -mx-2' : ''}`}>
            <span className="text-gray-500">{item.label}</span>
            <span className={`font-medium ${item.color || 'text-gray-700'}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
