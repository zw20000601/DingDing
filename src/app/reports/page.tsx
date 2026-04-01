'use client'
import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { useAppStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import {
  Download, FileText, FileSpreadsheet, Image, TrendingUp,
  Users, Clock, DollarSign, ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function ReportsPage() {
  const {
    attendanceRecords, monthlySummaries, payrollRecords,
    employees, departments, currentYear, currentMonth, setCurrentYearMonth
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll' | 'charts'>('charts')

  const currentPayroll = payrollRecords.filter(r => r.year === currentYear && r.month === currentMonth)
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-'

  // Monthly trend data (simulated 6 months)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const m = ((currentMonth - 5 + i + 12) % 12) + 1
    const total = employees.length * 20
    const normal = Math.floor(total * (0.82 + Math.random() * 0.1))
    return {
      month: `${m}月`,
      出勤率: Math.round((normal / total) * 100),
      迟到次数: Math.floor(Math.random() * 20) + 5,
      加班总时长: Math.floor(Math.random() * 60) + 20,
    }
  })

  // Salary trend
  const salaryTrend = Array.from({ length: 6 }, (_, i) => {
    const m = ((currentMonth - 5 + i + 12) % 12) + 1
    const base = employees.reduce((s, e) => s + e.salaryBase, 0)
    return {
      month: `${m}月`,
      应发: Math.round(base * (0.9 + Math.random() * 0.2) / 100) * 100,
      实发: Math.round(base * (0.75 + Math.random() * 0.15) / 100) * 100,
    }
  })

  // Status distribution for current month
  const workdayRecords = attendanceRecords.filter(r => r.status !== '节假日' && r.status !== '周末')
  const statusDist = [
    { name: '正常', value: workdayRecords.filter(r => r.status === '正常').length },
    { name: '迟到', value: workdayRecords.filter(r => r.status === '迟到').length },
    { name: '早退', value: workdayRecords.filter(r => r.status === '早退').length },
    { name: '缺卡', value: workdayRecords.filter(r => r.status === '缺卡').length },
    { name: '旷工', value: workdayRecords.filter(r => r.status === '旷工').length },
    { name: '请假', value: workdayRecords.filter(r => r.status === '请假').length },
  ].filter(d => d.value > 0)

  // Dept overtime ranking
  const deptOvertime = departments.filter(d => d.parentId !== null).slice(0, 6).map(dept => ({
    name: dept.name.replace('部', ''),
    加班时长: Math.round(
      monthlySummaries.filter(s => s.departmentId === dept.id).reduce((sum, s) => sum + s.totalOvertimeHours, 0) * 10
    ) / 10,
  })).sort((a, b) => b.加班时长 - a.加班时长)

  // Late by person
  const lateByPerson = [...monthlySummaries]
    .sort((a, b) => b.lateTimes - a.lateTimes)
    .slice(0, 8)
    .map(s => ({ name: s.employeeName, 迟到次数: s.lateTimes }))

  const handleExport = (type: string) => {
    toast.success(`${type} 导出功能（演示模式）`)
  }

  // Attendance report columns
  const attendanceColumns = [
    { key: 'employeeName', title: '姓名', render: (_: unknown, row: typeof monthlySummaries[0]) => <span className="font-medium">{row.employeeName}</span> },
    { key: 'departmentId', title: '部门', render: (_: unknown, row: typeof monthlySummaries[0]) => getDeptName(row.departmentId) },
    { key: 'requiredDays', title: '应出勤天数' },
    { key: 'actualDays', title: '实际出勤天数', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      <span className={row.actualDays < row.requiredDays ? 'text-yellow-600 font-medium' : ''}>{row.actualDays}</span>
    )},
    { key: 'lateTimes', title: '迟到次数', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      row.lateTimes > 0 ? <Badge variant="warning">{row.lateTimes}</Badge> : <span className="text-gray-300">0</span>
    )},
    { key: 'earlyLeaveTimes', title: '早退次数' },
    { key: 'absentTimes', title: '缺卡次数' },
    { key: 'absenteeismDays', title: '旷工天数', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      row.absenteeismDays > 0 ? <Badge variant="danger">{row.absenteeismDays}</Badge> : <span className="text-gray-300">0</span>
    )},
    { key: 'personalLeaveDays', title: '事假天数' },
    { key: 'sickLeaveDays', title: '病假天数' },
    { key: 'totalOvertimeHours', title: '加班总时长', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      <span className="text-purple-600">{row.totalOvertimeHours.toFixed(1)} h</span>
    )},
  ]

  // Payroll report columns
  const payrollColumns = [
    { key: 'employeeName', title: '姓名', render: (_: unknown, row: typeof currentPayroll[0]) => <span className="font-medium">{row.employeeName}</span> },
    { key: 'departmentId', title: '部门', render: (_: unknown, row: typeof currentPayroll[0]) => getDeptName(row.departmentId) },
    { key: 'salaryBase', title: '底薪', render: (_: unknown, row: typeof currentPayroll[0]) => formatCurrency(row.salaryBase) },
    { key: 'basicSalary', title: '基本工资', render: (_: unknown, row: typeof currentPayroll[0]) => formatCurrency(row.basicSalary) },
    { key: 'positionAllowance', title: '岗位津贴', render: (_: unknown, row: typeof currentPayroll[0]) => formatCurrency(row.positionAllowance) },
    { key: 'totalOvertimePay', title: '加班费', render: (_: unknown, row: typeof currentPayroll[0]) => formatCurrency(row.totalOvertimePay) },
    { key: 'fullAttendanceBonus', title: '全勤奖', render: (_: unknown, row: typeof currentPayroll[0]) => formatCurrency(row.fullAttendanceBonus) },
    { key: 'lateDeduction', title: '迟到扣款', render: (_: unknown, row: typeof currentPayroll[0]) => (
      <span className="text-red-500">-{formatCurrency(row.lateDeduction)}</span>
    )},
    { key: 'socialInsurance', title: '社保（个人）', render: (_: unknown, row: typeof currentPayroll[0]) => (
      <span className="text-red-500">-{formatCurrency(row.socialInsurance)}</span>
    )},
    { key: 'incomeTax', title: '个税', render: (_: unknown, row: typeof currentPayroll[0]) => (
      <span className="text-red-500">-{formatCurrency(row.incomeTax)}</span>
    )},
    { key: 'grossSalary', title: '应发工资', render: (_: unknown, row: typeof currentPayroll[0]) => (
      <span className="font-semibold">{formatCurrency(row.grossSalary)}</span>
    )},
    { key: 'netSalary', title: '实发工资', render: (_: unknown, row: typeof currentPayroll[0]) => (
      <span className="font-bold text-primary-700">{formatCurrency(row.netSalary)}</span>
    )},
    { key: 'status', title: '状态', render: (_: unknown, row: typeof currentPayroll[0]) => (
      <Badge variant={row.status === '已发放' ? 'success' : row.status === '已审核' ? 'info' : 'warning'}>{row.status}</Badge>
    )},
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="报表中心" subtitle="考勤分析报表、薪资明细表与可视化图表" />

      <div className="flex-1 p-6 space-y-4">
        {/* Month Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
            <button onClick={() => {
              let m = currentMonth - 1, y = currentYear
              if (m < 1) { m = 12; y-- }
              setCurrentYearMonth(y, m)
            }} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
            <span className="text-base font-semibold text-gray-800 w-24 text-center">{currentYear} 年 {currentMonth} 月</span>
            <button onClick={() => {
              let m = currentMonth + 1, y = currentYear
              if (m > 12) { m = 1; y++ }
              setCurrentYearMonth(y, m)
            }} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleExport('考勤报表 Excel')}>
              <FileSpreadsheet size={14} />导出考勤报表
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleExport('工资明细表 Excel')}>
              <Download size={14} />导出工资表
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleExport('工资条 PDF')}>
              <FileText size={14} />生成工资条
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { key: 'charts', label: '数据可视化', icon: BarChart3 },
            { key: 'attendance', label: '考勤报表' },
            { key: 'payroll', label: '工资明细表' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'charts' && (
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Attendance rate trend */}
              <Card>
                <CardHeader>
                  <CardTitle>出勤率趋势（近6月）</CardTitle>
                  <span className="text-xs text-gray-400">月度统计</span>
                </CardHeader>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip formatter={(v) => [`${v}%`, '出勤率']} />
                    <Area type="monotone" dataKey="出勤率" stroke="#3b82f6" strokeWidth={2} fill="url(#g1)" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Status Pie */}
              <Card>
                <CardHeader>
                  <CardTitle>本月考勤状态分布</CardTitle>
                </CardHeader>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusDist} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                      {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Salary trend */}
              <Card>
                <CardHeader>
                  <CardTitle>薪资总额趋势（近6月）</CardTitle>
                </CardHeader>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={salaryTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend iconSize={8} />
                    <Line type="monotone" dataKey="应发" stroke="#93c5fd" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="实发" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Late distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>迟到人员排行</CardTitle>
                  <span className="text-xs text-gray-400">{currentMonth}月</span>
                </CardHeader>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={lateByPerson} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={50} />
                    <Tooltip />
                    <Bar dataKey="迟到次数" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Dept Overtime */}
              <Card>
                <CardHeader>
                  <CardTitle>各部门加班时长</CardTitle>
                </CardHeader>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={deptOvertime} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="h" />
                    <Tooltip formatter={(v) => [`${v}小时`, '加班时长']} />
                    <Bar dataKey="加班时长" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Salary component pie (company level) */}
              <Card>
                <CardHeader>
                  <CardTitle>工资总额构成</CardTitle>
                  <span className="text-xs text-gray-400">{currentMonth}月</span>
                </CardHeader>
                {currentPayroll.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                    本月薪资尚未计算
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '基本工资', value: Math.round(currentPayroll.reduce((s, r) => s + r.basicSalary, 0)) },
                          { name: '岗位津贴', value: Math.round(currentPayroll.reduce((s, r) => s + r.positionAllowance, 0)) },
                          { name: '加班费', value: Math.round(currentPayroll.reduce((s, r) => s + r.totalOvertimePay, 0)) },
                          { name: '全勤奖', value: Math.round(currentPayroll.reduce((s, r) => s + r.fullAttendanceBonus, 0)) },
                          { name: '补贴报销', value: Math.round(currentPayroll.reduce((s, r) => s + r.totalAllowances, 0)) },
                        ].filter(d => d.value > 0)}
                        dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}
                      >
                        {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend iconSize={8} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <Card padding={false}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <span className="text-sm text-gray-500">{currentYear}年{currentMonth}月考勤月度汇总 · {monthlySummaries.length} 人</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleExport('Excel')}><FileSpreadsheet size={14} />Excel</Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport('PDF')}><FileText size={14} />PDF</Button>
              </div>
            </div>
            <Table<Record<string, unknown>>
              columns={attendanceColumns as never}
              data={monthlySummaries as never}
              rowKey={r => (r as unknown as typeof monthlySummaries[0]).employeeId}
            />
          </Card>
        )}

        {activeTab === 'payroll' && (
          <Card padding={false}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <span className="text-sm text-gray-500">{currentYear}年{currentMonth}月工资明细表 · {currentPayroll.length} 人</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleExport('Excel')}><FileSpreadsheet size={14} />Excel</Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport('工资条 PDF')}><FileText size={14} />生成工资条</Button>
              </div>
            </div>
            {currentPayroll.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <DollarSign size={32} className="mx-auto mb-3 text-gray-200" />
                <p>本月薪资尚未计算，请前往薪酬管理页面进行计算</p>
              </div>
            ) : (
              <Table<Record<string, unknown>>
                columns={payrollColumns as never}
                data={currentPayroll as never}
                rowKey={r => (r as unknown as typeof currentPayroll[0]).id}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
