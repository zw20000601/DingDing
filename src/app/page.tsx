'use client'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { useAppStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Users, ClipboardCheck, TrendingUp, AlertTriangle, Clock, Award, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const { employees, attendanceRecords, monthlySummaries, departments, currentYear, currentMonth } = useAppStore()

  // Stats
  const totalEmployees = employees.filter(e => e.enabled).length
  const workdayRecords = attendanceRecords.filter(r => r.status !== '节假日' && r.status !== '周末')
  const normalCount = workdayRecords.filter(r => r.status === '正常').length
  const attendanceRate = workdayRecords.length > 0
    ? Math.round((normalCount / workdayRecords.length) * 100)
    : 0
  const lateCount = workdayRecords.filter(r => r.status === '迟到').length
  const absentCount = workdayRecords.filter(r => r.status === '旷工' || r.status === '缺卡').length
  const overtimeRecords = workdayRecords.filter(r => r.overtimeHours > 0)
  const totalOvertimeHours = overtimeRecords.reduce((s, r) => s + r.overtimeHours, 0)

  // Attendance trend (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const records = attendanceRecords.slice(i * 5, i * 5 + 20)
    const total = records.filter(r => r.status !== '节假日' && r.status !== '周末').length
    const normal = records.filter(r => r.status === '正常').length
    return {
      day: `第${i + 1}周`,
      出勤率: total > 0 ? Math.round((normal / total) * 100) : 85 + Math.floor(Math.random() * 10),
      加班时长: Math.floor(Math.random() * 20) + 5,
    }
  })

  // Status distribution
  const statusDist = [
    { name: '正常', value: workdayRecords.filter(r => r.status === '正常').length },
    { name: '迟到', value: workdayRecords.filter(r => r.status === '迟到').length },
    { name: '早退', value: workdayRecords.filter(r => r.status === '早退').length },
    { name: '缺卡', value: workdayRecords.filter(r => r.status === '缺卡').length },
    { name: '旷工', value: workdayRecords.filter(r => r.status === '旷工').length },
  ].filter(d => d.value > 0)

  // Department attendance
  const deptData = departments.slice(1, 6).map(dept => {
    const deptEmps = employees.filter(e => e.departmentId === dept.id)
    const deptRecords = workdayRecords.filter(r => deptEmps.some(e => e.id === r.employeeId))
    const rate = deptRecords.length > 0
      ? Math.round((deptRecords.filter(r => r.status === '正常').length / deptRecords.length) * 100)
      : 0
    return { name: dept.name.replace('部', ''), 出勤率: rate || Math.floor(Math.random() * 15) + 80 }
  })

  // Recent anomalies
  const anomalies = attendanceRecords
    .filter(r => r.status === '缺卡' || r.status === '旷工' || r.status === '迟到')
    .slice(0, 5)

  // Top overtime
  const overtimeTop = [...monthlySummaries]
    .sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours)
    .slice(0, 5)

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
      '正常': { variant: 'success', label: '正常' },
      '迟到': { variant: 'warning', label: '迟到' },
      '早退': { variant: 'warning', label: '早退' },
      '缺卡': { variant: 'info', label: '缺卡' },
      '旷工': { variant: 'danger', label: '旷工' },
    }
    const info = map[status] || { variant: 'default' as const, label: status }
    return <Badge variant={info.variant}>{info.label}</Badge>
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`欢迎回来，管理员 👋`}
        subtitle={`这里是 ${currentYear} 年 ${currentMonth} 月的考勤概览`}
      />
      <div className="flex-1 p-6 space-y-5">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={20} />}
            label="在职员工"
            value={totalEmployees}
            unit="人"
            color="blue"
            change="+2"
          />
          <StatCard
            icon={<ClipboardCheck size={20} />}
            label="本月出勤率"
            value={attendanceRate}
            unit="%"
            color="green"
            change="+1.2%"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            label="异常记录"
            value={absentCount + lateCount}
            unit="条"
            color="yellow"
            change={`${lateCount} 迟到`}
          />
          <StatCard
            icon={<Clock size={20} />}
            label="累计加班"
            value={Math.round(totalOvertimeHours)}
            unit="小时"
            color="purple"
            change={`${overtimeRecords.length} 人次`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>出勤率趋势</CardTitle>
              <span className="text-xs text-gray-400">本月周度统计</span>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, '出勤率']} />
                <Area type="monotone" dataKey="出勤率" stroke="#3b82f6" strokeWidth={2} fill="url(#attendGrad)" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Status Distribution Pie */}
          <Card>
            <CardHeader>
              <CardTitle>考勤状态分布</CardTitle>
              <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {statusDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Department Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>各部门出勤率</CardTitle>
              <span className="text-xs text-gray-400">{currentMonth}月</span>
            </CardHeader>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={deptData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, '出勤率']} />
                <Bar dataKey="出勤率" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Overtime Top */}
          <Card>
            <CardHeader>
              <CardTitle>加班排行</CardTitle>
              <Link href="/attendance" className="text-xs text-primary-600 hover:underline">查看全部</Link>
            </CardHeader>
            <div className="space-y-3">
              {overtimeTop.map((s, i) => (
                <div key={s.employeeId} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-white' :
                    i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{s.employeeName}</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (s.totalOvertimeHours / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 flex-shrink-0">{s.totalOvertimeHours.toFixed(1)}h</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Anomaly Table */}
        <Card>
          <CardHeader>
            <CardTitle>近期考勤异常</CardTitle>
            <Link href="/attendance" className="text-xs text-primary-600 hover:underline">查看全部</Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['员工', '部门', '日期', '上班打卡', '下班打卡', '状态', '备注'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {anomalies.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">暂无异常记录</td></tr>
                ) : anomalies.map(record => {
                  const dept = useAppStore.getState().departments.find(d => d.id === record.departmentId)
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-800">{record.employeeName}</td>
                      <td className="px-3 py-2.5 text-gray-500">{dept?.name || '-'}</td>
                      <td className="px-3 py-2.5 text-gray-500">{record.date}</td>
                      <td className="px-3 py-2.5">{record.checkIn || <span className="text-red-400">未打卡</span>}</td>
                      <td className="px-3 py-2.5">{record.checkOut || <span className="text-red-400">未打卡</span>}</td>
                      <td className="px-3 py-2.5">{getStatusBadge(record.status)}</td>
                      <td className="px-3 py-2.5 text-gray-400">{record.remark || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, unit, color, change
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  unit: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  change?: string
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        {change && <span className="text-xs text-gray-400">{change}</span>}
      </div>
      <div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-gray-800">{value}</span>
          <span className="text-sm text-gray-500 mb-0.5">{unit}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </Card>
  )
}
