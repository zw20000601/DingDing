'use client'
import { useState, useMemo } from 'react'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import {
  Clock, TrendingUp, DollarSign, CheckCircle,
  ChevronLeft, ChevronRight, Calendar, Award, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  '正常': { variant: 'success', label: '正常' },
  '迟到': { variant: 'warning', label: '迟到' },
  '早退': { variant: 'warning', label: '早退' },
  '缺卡': { variant: 'info', label: '缺卡' },
  '旷工': { variant: 'danger', label: '旷工' },
  '请假': { variant: 'info', label: '请假' },
  '周末': { variant: 'default', label: '休息' },
  '节假日': { variant: 'default', label: '节假日' },
}

export default function MyPage() {
  const { currentUser } = useAuthStore()
  const { attendanceRecords, payrollRecords, employees, departments, currentYear, currentMonth } = useAppStore()

  const user = currentUser()
  const employee = employees.find(e => e.id === user?.employeeId)
  const dept = departments.find(d => d.id === employee?.departmentId)

  const [payrollMonth, setPayrollMonth] = useState(currentMonth)
  const [payrollYear, setPayrollYear] = useState(currentYear)
  const [attendanceTab, setAttendanceTab] = useState<'list' | 'calendar'>('calendar')

  // My payroll record
  const myPayroll = payrollRecords.find(r =>
    r.employeeId === user?.employeeId &&
    r.year === payrollYear && r.month === payrollMonth
  )

  // My attendance for current month
  const myAttendance = useMemo(() =>
    attendanceRecords.filter(r => r.employeeId === user?.employeeId),
    [attendanceRecords, user]
  )

  const workdayRecords = myAttendance.filter(r => r.status !== '节假日' && r.status !== '周末')
  const lateCount = workdayRecords.filter(r => r.status === '迟到').length
  const normalCount = workdayRecords.filter(r => r.status === '正常').length
  const overtimeHours = myAttendance.reduce((s, r) => s + r.overtimeHours, 0)

  // Calendar data
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay()

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = myAttendance.find(r => r.date === dateStr)
    return { day, dateStr, record }
  })

  const dayColors: Record<string, string> = {
    '正常': 'bg-green-100 text-green-700 border-green-200',
    '迟到': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '早退': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '缺卡': 'bg-blue-100 text-blue-700 border-blue-200',
    '旷工': 'bg-red-100 text-red-700 border-red-200',
    '请假': 'bg-purple-100 text-purple-700 border-purple-200',
    '周末': 'bg-gray-50 text-gray-300',
    '节假日': 'bg-red-50 text-red-300',
  }

  // Payroll history trend (last 6 months)
  const payrollHistory = Array.from({ length: 6 }, (_, i) => {
    const m = ((payrollMonth - 5 + i + 12) % 12) + 1
    const y = m > payrollMonth ? payrollYear - 1 : payrollYear
    const record = payrollRecords.find(r => r.employeeId === user?.employeeId && r.year === y && r.month === m)
    return {
      month: `${m}月`,
      实发: record?.netSalary || 0,
      加班费: record?.totalOvertimePay || 0,
    }
  })

  if (!user?.employeeId) {
    return (
      <div className="flex flex-col h-full">
        <Header title="个人中心" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-medium">未绑定员工档案</p>
            <p className="text-sm mt-1">请联系管理员绑定您的员工档案</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="我的工资条" subtitle="查看个人考勤记录与薪资明细" />

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Personal Info Banner */}
        <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white" padding={false}>
          <div className="p-6 flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {employee?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{employee?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-blue-100 text-sm">
                <span>{dept?.name}</span>
                <span>·</span>
                <span>{employee?.position}</span>
                <span>·</span>
                <span className="font-mono">{employee?.employeeNo}</span>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-blue-200 text-xs">工作制度</div>
              <div className="font-semibold mt-0.5">{employee?.workSchedule}</div>
              <div className="text-blue-200 text-xs mt-2">入职日期</div>
              <div className="font-semibold mt-0.5">{employee?.hireDate}</div>
            </div>
          </div>
        </Card>

        {/* This Month Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '正常出勤', value: normalCount, unit: '天', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            { label: '迟到次数', value: lateCount, unit: '次', icon: Clock, color: lateCount > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 bg-gray-50' },
            { label: '加班时长', value: overtimeHours.toFixed(1), unit: 'h', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
            { label: '实发工资', value: myPayroll ? formatCurrency(myPayroll.netSalary) : '未计算', unit: '', icon: DollarSign, color: 'text-primary-600 bg-primary-50' },
          ].map(s => (
            <Card key={s.label} className="flex items-center gap-3 py-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-gray-800 truncate">{s.value}{s.unit}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left: Attendance Calendar */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{currentYear}年{currentMonth}月 出勤日历</CardTitle>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {[
                  { label: '正常', cls: 'bg-green-100 text-green-700' },
                  { label: '迟到', cls: 'bg-yellow-100 text-yellow-700' },
                  { label: '旷工', cls: 'bg-red-100 text-red-700' },
                  { label: '请假', cls: 'bg-purple-100 text-purple-700' },
                ].map(l => (
                  <span key={l.label} className={`px-2 py-0.5 rounded-full ${l.cls}`}>{l.label}</span>
                ))}
              </div>
            </CardHeader>

            {/* Calendar grid */}
            <div>
              <div className="grid grid-cols-7 mb-1">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {calendarDays.map(({ day, record }) => {
                  const cls = record ? dayColors[record.status] || 'bg-gray-100' : 'bg-gray-50 text-gray-300'
                  const isToday = new Date().getDate() === day &&
                    new Date().getMonth() + 1 === currentMonth &&
                    new Date().getFullYear() === currentYear
                  return (
                    <div
                      key={day}
                      title={record ? `${record.status}${record.checkIn ? ` · ${record.checkIn}` : ''}${record.checkOut ? `-${record.checkOut}` : ''}` : ''}
                      className={`aspect-square rounded-lg border flex flex-col items-center justify-center cursor-default transition-transform hover:scale-105 ${cls} ${isToday ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
                    >
                      <span className="text-xs font-semibold">{day}</span>
                      {record?.overtimeHours ? <span className="text-xs opacity-60">+{record.overtimeHours}h</span> : null}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Attendance list - recent records */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">近期打卡记录</p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {myAttendance
                  .filter(r => r.status !== '周末' && r.status !== '节假日')
                  .slice(0, 10)
                  .map(r => {
                    const cfg = STATUS_BADGE[r.status]
                    return (
                      <div key={r.id} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 text-xs w-20 flex-shrink-0">{r.date}</span>
                        <span className="text-gray-600">{r.checkIn || '--:--'} → {r.checkOut || '--:--'}</span>
                        <Badge variant={cfg?.variant || 'default'} className="ml-auto flex-shrink-0">{cfg?.label || r.status}</Badge>
                        {r.lateMinutes > 0 && <span className="text-yellow-500 text-xs">迟{r.lateMinutes}分</span>}
                        {r.overtimeHours > 0 && <span className="text-purple-500 text-xs">加班{r.overtimeHours}h</span>}
                      </div>
                    )
                  })}
              </div>
            </div>
          </Card>

          {/* Right: Payroll */}
          <div className="lg:col-span-2 space-y-4">
            {/* Month selector */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { let m = payrollMonth - 1, y = payrollYear; if (m < 1) { m = 12; y-- }; setPayrollMonth(m); setPayrollYear(y) }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={16} /></button>
                <span className="font-semibold text-gray-700">{payrollYear}年{payrollMonth}月工资条</span>
                <button onClick={() => { let m = payrollMonth + 1, y = payrollYear; if (m > 12) { m = 1; y++ }; setPayrollMonth(m); setPayrollYear(y) }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={16} /></button>
              </div>

              {myPayroll ? (
                <div className="space-y-2">
                  {/* Net salary highlight */}
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 text-center mb-3">
                    <div className="text-xs text-primary-500 font-medium mb-1">本月实发工资</div>
                    <div className="text-3xl font-bold text-primary-700">{formatCurrency(myPayroll.netSalary)}</div>
                    <Badge variant={myPayroll.status === '已发放' ? 'success' : myPayroll.status === '已审核' ? 'info' : 'warning'} className="mt-2">
                      {myPayroll.status}
                    </Badge>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-1.5 text-sm">
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-2">收入明细</div>
                    {[
                      { label: `基本工资（${myPayroll.actualDays}/${myPayroll.requiredDays}天）`, val: myPayroll.basicSalary },
                      { label: '岗位津贴', val: myPayroll.positionAllowance },
                      { label: '加班费', val: myPayroll.totalOvertimePay },
                      { label: '全勤奖', val: myPayroll.fullAttendanceBonus },
                    ].map(item => item.val > 0 && (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium text-gray-700">+{formatCurrency(item.val)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase mb-2">扣款明细</div>
                    </div>
                    {[
                      { label: '迟到扣款', val: myPayroll.lateDeduction },
                      { label: '早退/缺勤扣款', val: myPayroll.absentDeduction },
                      { label: '旷工扣款', val: myPayroll.absenteeismDeduction },
                      { label: '五险一金（个人）', val: myPayroll.socialInsurance },
                      { label: '个人所得税', val: myPayroll.incomeTax },
                    ].map(item => item.val > 0 && (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium text-red-500">-{formatCurrency(item.val)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold">
                      <span className="text-gray-700">应发工资</span>
                      <span className="text-gray-800">{formatCurrency(myPayroll.grossSalary)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <DollarSign size={28} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">本月薪资尚未生成</p>
                  <p className="text-xs text-gray-300 mt-1">工资计算完成后可在此查看</p>
                </div>
              )}
            </Card>

            {/* Payroll trend mini chart */}
            {payrollHistory.some(d => d.实发 > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>工资趋势</CardTitle>
                </CardHeader>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={payrollHistory}>
                    <defs>
                      <linearGradient id="myPayGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="实发" stroke="#3b82f6" strokeWidth={2} fill="url(#myPayGrad)" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
