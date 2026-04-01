'use client'
import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Pagination } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useAppStore } from '@/store'
import { AttendanceRecord, AttendanceStatus } from '@/types'
import toast from 'react-hot-toast'
import {
  RefreshCw, Upload, Download, Search, Edit2, Filter,
  CheckCircle, AlertCircle, Clock, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react'

const PAGE_SIZE = 15

const STATUS_CONFIG: Record<AttendanceStatus, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  '正常': { variant: 'success', label: '正常' },
  '迟到': { variant: 'warning', label: '迟到' },
  '早退': { variant: 'warning', label: '早退' },
  '迟到且早退': { variant: 'warning', label: '迟到且早退' },
  '缺卡': { variant: 'info', label: '缺卡' },
  '旷工': { variant: 'danger', label: '旷工' },
  '请假': { variant: 'info', label: '请假' },
  '节假日': { variant: 'default', label: '节假日' },
  '周末': { variant: 'default', label: '周末' },
}

export default function AttendancePage() {
  const {
    attendanceRecords, monthlySummaries, employees, departments,
    currentYear, currentMonth, setCurrentYearMonth, updateAttendanceRecord
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'records' | 'summary' | 'anomaly'>('records')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null)
  const [editForm, setEditForm] = useState({ checkIn: '', checkOut: '', status: '', remark: '' })
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-'

  // Filter records
  const filtered = useMemo(() => {
    return attendanceRecords.filter(r => {
      const matchSearch = !search || r.employeeName.includes(search)
      const matchStatus = !statusFilter || r.status === statusFilter
      const matchDept = !deptFilter || r.departmentId === deptFilter
      return matchSearch && matchStatus && matchDept
    })
  }, [attendanceRecords, search, statusFilter, deptFilter])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Anomaly records
  const anomalies = attendanceRecords.filter(r =>
    r.status === '缺卡' || r.status === '旷工' || (r.lateMinutes > 30) || (r.earlyLeaveMinutes > 30)
  )

  const handleSync = async () => {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 2000))
    setSyncing(false)
    toast.success('考勤数据已同步（演示模式）')
  }

  const openEdit = (record: AttendanceRecord) => {
    setEditRecord(record)
    setEditForm({
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
      status: record.status,
      remark: record.remark,
    })
  }

  const handleSaveEdit = () => {
    if (!editRecord) return
    updateAttendanceRecord(editRecord.id, {
      checkIn: editForm.checkIn || null,
      checkOut: editForm.checkOut || null,
      status: editForm.status as AttendanceStatus,
      remark: editForm.remark,
      manualAdjusted: true,
      adjustedBy: '管理员',
      adjustedAt: new Date().toISOString(),
    })
    toast.success('考勤记录已修改')
    setEditRecord(null)
  }

  const prevMonth = () => {
    let m = currentMonth - 1, y = currentYear
    if (m < 1) { m = 12; y-- }
    setCurrentYearMonth(y, m)
  }

  const nextMonth = () => {
    let m = currentMonth + 1, y = currentYear
    if (m > 12) { m = 1; y++ }
    setCurrentYearMonth(y, m)
  }

  const recordColumns = [
    { key: 'date', title: '日期', width: '100px' },
    {
      key: 'employeeName', title: '员工',
      render: (_: unknown, row: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
            {row.employeeName[0]}
          </div>
          <span className="font-medium">{row.employeeName}</span>
        </div>
      )
    },
    { key: 'departmentId', title: '部门', render: (_: unknown, row: AttendanceRecord) => getDeptName(row.departmentId) },
    {
      key: 'checkIn', title: '上班打卡',
      render: (_: unknown, row: AttendanceRecord) => (
        <span className={row.checkIn ? '' : 'text-red-400'}>
          {row.checkIn || '未打卡'}
        </span>
      )
    },
    {
      key: 'checkOut', title: '下班打卡',
      render: (_: unknown, row: AttendanceRecord) => (
        <span className={row.checkOut ? '' : 'text-red-400'}>
          {row.checkOut || '未打卡'}
        </span>
      )
    },
    {
      key: 'status', title: '状态',
      render: (_: unknown, row: AttendanceRecord) => {
        const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG['正常']
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      }
    },
    {
      key: 'lateMinutes', title: '迟到/早退',
      render: (_: unknown, row: AttendanceRecord) => {
        if (row.lateMinutes > 0) return <span className="text-yellow-600 text-xs">{row.lateMinutes} 分钟迟到</span>
        if (row.earlyLeaveMinutes > 0) return <span className="text-yellow-600 text-xs">{row.earlyLeaveMinutes} 分钟早退</span>
        return <span className="text-gray-300">-</span>
      }
    },
    {
      key: 'overtimeHours', title: '加班时长',
      render: (_: unknown, row: AttendanceRecord) => (
        row.overtimeHours > 0
          ? <span className="text-purple-600 text-xs font-medium">{row.overtimeHours} 小时</span>
          : <span className="text-gray-300">-</span>
      )
    },
    {
      key: 'manualAdjusted', title: '修改',
      render: (_: unknown, row: AttendanceRecord) => (
        row.manualAdjusted ? <Badge variant="warning">已修改</Badge> : null
      )
    },
    {
      key: 'actions', title: '操作', width: '60px',
      render: (_: unknown, row: AttendanceRecord) => (
        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500">
          <Edit2 size={14} />
        </button>
      )
    },
  ]

  const summaryColumns = [
    { key: 'employeeName', title: '姓名', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      <span className="font-medium">{row.employeeName}</span>
    )},
    { key: 'departmentId', title: '部门', render: (_: unknown, row: typeof monthlySummaries[0]) => getDeptName(row.departmentId) },
    { key: 'requiredDays', title: '应出勤' },
    { key: 'actualDays', title: '实际出勤', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      <span className={row.actualDays < row.requiredDays ? 'text-yellow-600 font-medium' : 'text-green-600 font-medium'}>
        {row.actualDays}
      </span>
    )},
    { key: 'lateTimes', title: '迟到', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      row.lateTimes > 0 ? <span className="text-yellow-600">{row.lateTimes} 次</span> : <span className="text-gray-300">0</span>
    )},
    { key: 'earlyLeaveTimes', title: '早退', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      row.earlyLeaveTimes > 0 ? <span className="text-yellow-600">{row.earlyLeaveTimes} 次</span> : <span className="text-gray-300">0</span>
    )},
    { key: 'absenteeismDays', title: '旷工', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      row.absenteeismDays > 0 ? <Badge variant="danger">{row.absenteeismDays} 天</Badge> : <span className="text-gray-300">0</span>
    )},
    { key: 'personalLeaveDays', title: '事假' },
    { key: 'sickLeaveDays', title: '病假' },
    { key: 'totalOvertimeHours', title: '加班', render: (_: unknown, row: typeof monthlySummaries[0]) => (
      <span className="text-purple-600">{row.totalOvertimeHours.toFixed(1)} h</span>
    )},
  ]

  // Stats
  const workdayRecords = attendanceRecords.filter(r => r.status !== '节假日' && r.status !== '周末')
  const totalNormal = workdayRecords.filter(r => r.status === '正常').length
  const totalLate = workdayRecords.filter(r => r.status === '迟到').length
  const totalAbsent = workdayRecords.filter(r => r.status === '旷工').length
  const totalAbsence = workdayRecords.filter(r => r.status === '缺卡').length

  return (
    <div className="flex flex-col h-full">
      <Header title="考勤管理" subtitle="查看和处理员工考勤记录、异常数据" />

      <div className="flex-1 p-6 space-y-4">
        {/* Month Selector + Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <div className="text-base font-semibold text-gray-800 w-24 text-center">
              {currentYear} 年 {currentMonth} 月
            </div>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setImportModalOpen(true)}>
              <Upload size={14} />导入打卡数据
            </Button>
            <Button variant="secondary" size="sm" loading={syncing} onClick={handleSync}>
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              API 同步
            </Button>
            <Button variant="secondary" size="sm">
              <Download size={14} />导出报表
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '正常出勤', value: totalNormal, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            { label: '迟到次数', value: totalLate, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
            { label: '缺卡记录', value: totalAbsence, icon: AlertCircle, color: 'text-blue-600 bg-blue-50' },
            { label: '旷工人次', value: totalAbsent, icon: Calendar, color: 'text-red-600 bg-red-50' },
          ].map(s => (
            <Card key={s.label} className="flex items-center gap-3 py-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { key: 'records', label: '打卡明细' },
            { key: 'summary', label: '月度汇总' },
            { key: 'anomaly', label: `异常处理 ${anomalies.length > 0 ? `(${anomalies.length})` : ''}` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'records' && (
          <Card padding={false}>
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="搜索员工姓名..."
                  className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                className="py-2 px-3 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">全部状态</option>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={deptFilter}
                onChange={e => { setDeptFilter(e.target.value); setPage(1) }}
                className="py-2 px-3 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">全部部门</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <span className="text-xs text-gray-400 ml-auto">共 {filtered.length} 条记录</span>
            </div>
            <Table<Record<string, unknown>>
              columns={recordColumns as never}
              data={paginated as never}
              rowKey={r => (r as unknown as AttendanceRecord).id}
            />
            <div className="px-4 pb-4">
              <Pagination current={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </Card>
        )}

        {activeTab === 'summary' && (
          <Card padding={false}>
            <div className="p-4 border-b border-gray-50">
              <span className="text-sm text-gray-500">{currentYear} 年 {currentMonth} 月 · 共 {monthlySummaries.length} 人</span>
            </div>
            <Table<Record<string, unknown>>
              columns={summaryColumns as never}
              data={monthlySummaries as never}
              rowKey={r => (r as unknown as typeof monthlySummaries[0]).employeeId}
            />
          </Card>
        )}

        {activeTab === 'anomaly' && (
          <Card padding={false}>
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-500">共 {anomalies.length} 条异常记录，请及时处理</span>
              <Badge variant="danger">{anomalies.length} 条待处理</Badge>
            </div>
            <Table<Record<string, unknown>>
              columns={[
                ...recordColumns.filter(c => !['actions'].includes(c.key)),
                {
                  key: 'actions', title: '操作', width: '80px',
                  render: (_: unknown, row: AttendanceRecord) => (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500 text-xs flex items-center gap-1">
                        <Edit2 size={12} />修正
                      </button>
                    </div>
                  )
                }
              ] as never}
              data={anomalies as never}
              rowKey={r => (r as unknown as AttendanceRecord).id}
            />
          </Card>
        )}
      </div>

      {/* Edit Record Modal */}
      <Modal
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        title="修改考勤记录"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditRecord(null)}>取消</Button>
            <Button onClick={handleSaveEdit}>保存修改</Button>
          </>
        }
      >
        {editRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              员工：<strong>{editRecord.employeeName}</strong>｜日期：<strong>{editRecord.date}</strong>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="上班打卡时间"
                type="time"
                value={editForm.checkIn}
                onChange={e => setEditForm(f => ({ ...f, checkIn: e.target.value }))}
              />
              <Input
                label="下班打卡时间"
                type="time"
                value={editForm.checkOut}
                onChange={e => setEditForm(f => ({ ...f, checkOut: e.target.value }))}
              />
            </div>
            <Select
              label="考勤状态"
              value={editForm.status}
              onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
            >
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input
              label="备注说明"
              value={editForm.remark}
              onChange={e => setEditForm(f => ({ ...f, remark: e.target.value }))}
              placeholder="填写修改原因（将记录在操作日志中）"
            />
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
              ⚠️ 手动修改将被记录在操作日志中，且修改后状态无法自动还原。
            </div>
          </div>
        )}
      </Modal>

      {/* Import Modal */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="导入打卡数据"
        footer={
          <>
            <Button variant="secondary" onClick={() => setImportModalOpen(false)}>取消</Button>
            <Button onClick={() => { toast.success('导入功能演示：文件已处理'); setImportModalOpen(false) }}>
              开始导入
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
            <Upload size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600">点击或拖拽文件到此区域上传</p>
            <p className="text-xs text-gray-400 mt-1">支持 .xlsx、.xls、.csv 格式</p>
            <Button variant="outline" size="sm" className="mt-3">选择文件</Button>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>文件格式要求：</p>
            <p>• 必须包含：员工姓名、工号、日期、上班时间、下班时间</p>
            <p>• 日期格式：YYYY-MM-DD</p>
            <p>• 时间格式：HH:MM</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
