import { Department, Employee, Holiday, LeaveType, AttendanceRules, CheckRecord, AttendanceRecord, MonthlyAttendanceSummary, PayrollRecord } from '@/types'
import { format, subDays, addDays } from 'date-fns'

// ===== 部门 =====
export const mockDepartments: Department[] = [
  { id: 'dept-1', name: '总公司', code: 'HQ', parentId: null, leaderId: 'emp-1', enabled: true, createdAt: '2024-01-01' },
  { id: 'dept-2', name: '技术部', code: 'TECH', parentId: 'dept-1', leaderId: 'emp-2', enabled: true, createdAt: '2024-01-01' },
  { id: 'dept-3', name: '产品部', code: 'PROD', parentId: 'dept-1', leaderId: 'emp-5', enabled: true, createdAt: '2024-01-01' },
  { id: 'dept-4', name: '人事行政部', code: 'HR', parentId: 'dept-1', leaderId: 'emp-7', enabled: true, createdAt: '2024-01-01' },
  { id: 'dept-5', name: '财务部', code: 'FIN', parentId: 'dept-1', leaderId: 'emp-9', enabled: true, createdAt: '2024-01-01' },
  { id: 'dept-6', name: '销售部', code: 'SALES', parentId: 'dept-1', leaderId: 'emp-11', enabled: true, createdAt: '2024-01-01' },
  { id: 'dept-7', name: '前端组', code: 'FE', parentId: 'dept-2', leaderId: 'emp-3', enabled: true, createdAt: '2024-01-01' },
  { id: 'dept-8', name: '后端组', code: 'BE', parentId: 'dept-2', leaderId: 'emp-4', enabled: true, createdAt: '2024-01-01' },
]

// ===== 员工 =====
export const mockEmployees: Employee[] = [
  {
    id: 'emp-1', name: '张伟', employeeNo: 'E001', departmentId: 'dept-1', position: '总经理',
    hireDate: '2020-01-01', phone: '13800000001', email: 'zhangwei@company.com',
    salaryBase: 25000, positionAllowance: 3000, overtimeHourlyRate: 150,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding001', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-2', name: '李明', employeeNo: 'E002', departmentId: 'dept-2', position: '技术总监',
    hireDate: '2020-03-15', phone: '13800000002', email: 'liming@company.com',
    salaryBase: 20000, positionAllowance: 2000, overtimeHourlyRate: 120,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding002', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-3', name: '王芳', employeeNo: 'E003', departmentId: 'dept-7', position: '高级前端工程师',
    hireDate: '2021-06-01', phone: '13800000003', email: 'wangfang@company.com',
    salaryBase: 15000, positionAllowance: 1000, overtimeHourlyRate: 90,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding003', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-4', name: '陈刚', employeeNo: 'E004', departmentId: 'dept-8', position: '后端架构师',
    hireDate: '2020-09-10', phone: '13800000004', email: 'chengang@company.com',
    salaryBase: 18000, positionAllowance: 1500, overtimeHourlyRate: 110,
    workSchedule: '做五休二', workStartTime: '09:30', workEndTime: '18:30',
    dingUserId: 'ding004', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-5', name: '刘洋', employeeNo: 'E005', departmentId: 'dept-3', position: '产品总监',
    hireDate: '2021-01-20', phone: '13800000005', email: 'liuyang@company.com',
    salaryBase: 18000, positionAllowance: 2000, overtimeHourlyRate: 110,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding005', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-6', name: '赵静', employeeNo: 'E006', departmentId: 'dept-3', position: '产品经理',
    hireDate: '2022-03-01', phone: '13800000006', email: 'zhaojing@company.com',
    salaryBase: 13000, positionAllowance: 800, overtimeHourlyRate: 80,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding006', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-7', name: '孙丽', employeeNo: 'E007', departmentId: 'dept-4', position: 'HR经理',
    hireDate: '2021-07-01', phone: '13800000007', email: 'sunli@company.com',
    salaryBase: 10000, positionAllowance: 500, overtimeHourlyRate: 60,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding007', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-8', name: '周磊', employeeNo: 'E008', departmentId: 'dept-4', position: '行政专员',
    hireDate: '2023-01-10', phone: '13800000008', email: 'zhoulei@company.com',
    salaryBase: 7000, positionAllowance: 300, overtimeHourlyRate: 45,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding008', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-9', name: '吴敏', employeeNo: 'E009', departmentId: 'dept-5', position: '财务总监',
    hireDate: '2020-05-01', phone: '13800000009', email: 'wumin@company.com',
    salaryBase: 16000, positionAllowance: 1500, overtimeHourlyRate: 95,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding009', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-10', name: '郑浩', employeeNo: 'E010', departmentId: 'dept-5', position: '会计',
    hireDate: '2022-08-15', phone: '13800000010', email: 'zhenghao@company.com',
    salaryBase: 8000, positionAllowance: 400, overtimeHourlyRate: 50,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding010', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-11', name: '冯娟', employeeNo: 'E011', departmentId: 'dept-6', position: '销售总监',
    hireDate: '2021-04-01', phone: '13800000011', email: 'fengjuan@company.com',
    salaryBase: 12000, positionAllowance: 2000, overtimeHourlyRate: 75,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding011', enabled: true, createdAt: '2024-01-01'
  },
  {
    id: 'emp-12', name: '韩超', employeeNo: 'E012', departmentId: 'dept-6', position: '销售经理',
    hireDate: '2022-11-01', phone: '13800000012', email: 'hanchao@company.com',
    salaryBase: 9000, positionAllowance: 1500, overtimeHourlyRate: 55,
    workSchedule: '做五休二', workStartTime: '09:00', workEndTime: '18:00',
    dingUserId: 'ding012', enabled: true, createdAt: '2024-01-01'
  },
]

// ===== 考勤规则默认值 =====
export const defaultAttendanceRules: AttendanceRules = {
  workStartTime: '09:00',
  workEndTime: '18:00',
  lateGrace: 5,
  earlyLeaveGrace: 5,
  overtimeStartAfter: 30,
  overtimeRounding: [
    { minMinutes: 15, maxMinutes: 44, roundTo: 0.5 },
    { minMinutes: 45, maxMinutes: 999, roundTo: 1 },
  ],
  overtimeRateWeekday: 1.5,
  overtimeRateWeekend: 2.0,
  overtimeRateHoliday: 3.0,
  fullAttendanceBonus: 200,
  fullAttendanceBonusInBase: false,
  lunchBreakMinutes: 60,
  deductionRules: [
    {
      type: 'late',
      name: '迟到扣款',
      tiers: [
        { minMinutes: 1, maxMinutes: 10, amount: 20, dailySalaryRatio: null },
        { minMinutes: 11, maxMinutes: 30, amount: 50, dailySalaryRatio: null },
        { minMinutes: 31, maxMinutes: null, amount: null, dailySalaryRatio: 0.5 },
      ]
    },
    {
      type: 'earlyLeave',
      name: '早退扣款',
      tiers: [
        { minMinutes: 1, maxMinutes: 10, amount: 20, dailySalaryRatio: null },
        { minMinutes: 11, maxMinutes: 30, amount: 50, dailySalaryRatio: null },
        { minMinutes: 31, maxMinutes: null, amount: null, dailySalaryRatio: 0.5 },
      ]
    },
    {
      type: 'absenteeism',
      name: '旷工扣款',
      tiers: [
        { minMinutes: 0, maxMinutes: null, amount: null, dailySalaryRatio: 1.0 },
      ]
    },
  ]
}

// ===== 节假日 =====
export const mockHolidays: Holiday[] = [
  { id: 'h1', date: '2025-01-01', name: '元旦', type: 'holiday' },
  { id: 'h2', date: '2025-01-26', name: '春节前调休补班', type: 'workday' },
  { id: 'h3', date: '2025-01-28', name: '春节', type: 'holiday' },
  { id: 'h4', date: '2025-01-29', name: '春节', type: 'holiday' },
  { id: 'h5', date: '2025-01-30', name: '春节', type: 'holiday' },
  { id: 'h6', date: '2025-01-31', name: '春节', type: 'holiday' },
  { id: 'h7', date: '2025-02-01', name: '春节', type: 'holiday' },
  { id: 'h8', date: '2025-02-02', name: '春节', type: 'holiday' },
  { id: 'h9', date: '2025-02-03', name: '春节', type: 'holiday' },
  { id: 'h10', date: '2025-02-08', name: '春节后调休补班', type: 'workday' },
  { id: 'h11', date: '2025-04-04', name: '清明节', type: 'holiday' },
  { id: 'h12', date: '2025-04-05', name: '清明节', type: 'holiday' },
  { id: 'h13', date: '2025-04-06', name: '清明节', type: 'holiday' },
  { id: 'h14', date: '2025-05-01', name: '劳动节', type: 'holiday' },
  { id: 'h15', date: '2025-05-02', name: '劳动节', type: 'holiday' },
  { id: 'h16', date: '2025-05-03', name: '劳动节', type: 'holiday' },
  { id: 'h17', date: '2025-05-04', name: '劳动节', type: 'holiday' },
  { id: 'h18', date: '2025-05-05', name: '劳动节', type: 'holiday' },
  { id: 'h19', date: '2025-10-01', name: '国庆节', type: 'holiday' },
  { id: 'h20', date: '2025-10-02', name: '国庆节', type: 'holiday' },
  { id: 'h21', date: '2025-10-03', name: '国庆节', type: 'holiday' },
  { id: 'h22', date: '2025-10-04', name: '国庆节', type: 'holiday' },
  { id: 'h23', date: '2025-10-05', name: '国庆节', type: 'holiday' },
  { id: 'h24', date: '2025-10-06', name: '国庆节', type: 'holiday' },
  { id: 'h25', date: '2025-10-07', name: '国庆节', type: 'holiday' },
]

// ===== 请假类型 =====
export const defaultLeaveTypes: LeaveType[] = [
  { id: 'lt1', name: '年假', ratio: 0, color: '#22c55e' },
  { id: 'lt2', name: '病假', ratio: 0.8, color: '#f59e0b' },
  { id: 'lt3', name: '事假', ratio: 1.0, color: '#ef4444' },
  { id: 'lt4', name: '婚假', ratio: 0, color: '#8b5cf6' },
  { id: 'lt5', name: '产假', ratio: 0, color: '#ec4899' },
  { id: 'lt6', name: '丧假', ratio: 0, color: '#6b7280' },
  { id: 'lt7', name: '外勤', ratio: 0, color: '#3b82f6' },
]

// ===== 生成模拟考勤记录（2025-03月份） =====
export function generateMockAttendance(year: number, month: number): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  mockEmployees.forEach(emp => {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayOfWeek = new Date(date).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isHoliday = mockHolidays.some(h => h.date === date && h.type === 'holiday')

      if (isWeekend || isHoliday) {
        // 偶尔有加班
        const rand = Math.random()
        if (rand > 0.85) {
          records.push({
            id: `att-${emp.id}-${date}`,
            employeeId: emp.id,
            employeeName: emp.name,
            departmentId: emp.departmentId,
            date,
            checkIn: '09:30',
            checkOut: '17:30',
            status: isHoliday ? '节假日' : '周末',
            lateMinutes: 0,
            earlyLeaveMinutes: 0,
            overtimeHours: isHoliday ? 6 : 6,
            workHours: 7,
            leaveType: null,
            leaveHours: 0,
            remark: isHoliday ? '节假日加班' : '周末加班',
            manualAdjusted: false,
            adjustedBy: null,
            adjustedAt: null,
          })
        }
        return
      }

      const rand = Math.random()
      let status: AttendanceRecord['status'] = '正常'
      let checkIn: string | null = '08:58'
      let checkOut: string | null = '18:05'
      let lateMinutes = 0
      let earlyLeaveMinutes = 0
      let overtimeHours = 0
      let leaveType = null
      let leaveHours = 0

      if (rand < 0.05) {
        // 旷工
        status = '旷工'
        checkIn = null
        checkOut = null
      } else if (rand < 0.12) {
        // 请假
        status = '请假'
        checkIn = null
        checkOut = null
        leaveType = rand < 0.08 ? '事假' : '病假'
        leaveHours = 8
      } else if (rand < 0.20) {
        // 迟到
        const lateMin = Math.floor(Math.random() * 45) + 6
        status = '迟到'
        checkIn = addMinutesToTime('09:00', lateMin)
        checkOut = '18:05'
        lateMinutes = lateMin
      } else if (rand < 0.25) {
        // 早退
        const earlyMin = Math.floor(Math.random() * 40) + 10
        status = '早退'
        checkIn = '08:58'
        checkOut = subtractMinutesFromTime('18:00', earlyMin)
        earlyLeaveMinutes = earlyMin
      } else if (rand < 0.30) {
        // 缺卡
        status = '缺卡'
        checkIn = Math.random() > 0.5 ? '09:02' : null
        checkOut = checkIn === null ? '18:10' : null
      } else if (rand > 0.75) {
        // 加班
        const overtimeMin = Math.floor(Math.random() * 90) + 30
        checkOut = addMinutesToTime('18:00', overtimeMin + 30)
        if (overtimeMin >= 45) overtimeHours = 1
        else if (overtimeMin >= 15) overtimeHours = 0.5
      }

      if (status === '正常' || status === '迟到' || status === '早退' || status === '缺卡') {
        records.push({
          id: `att-${emp.id}-${date}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentId: emp.departmentId,
          date,
          checkIn,
          checkOut,
          status,
          lateMinutes,
          earlyLeaveMinutes,
          overtimeHours,
          workHours: checkIn && checkOut ? 8 : 0,
          leaveType,
          leaveHours,
          remark: '',
          manualAdjusted: false,
          adjustedBy: null,
          adjustedAt: null,
        })
      } else {
        records.push({
          id: `att-${emp.id}-${date}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentId: emp.departmentId,
          date,
          checkIn,
          checkOut,
          status,
          lateMinutes,
          earlyLeaveMinutes,
          overtimeHours,
          workHours: 0,
          leaveType,
          leaveHours,
          remark: '',
          manualAdjusted: false,
          adjustedBy: null,
          adjustedAt: null,
        })
      }
    }
  })

  return records
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + minutes
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`
}

function subtractMinutesFromTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m - minutes
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`
}

// ===== 生成月度考勤汇总 =====
export function generateMonthlySummary(records: AttendanceRecord[], year: number, month: number): MonthlyAttendanceSummary[] {
  const summaries: MonthlyAttendanceSummary[] = []

  mockEmployees.forEach(emp => {
    const empRecords = records.filter(r => r.employeeId === emp.id)
    const workdays = empRecords.filter(r => r.status !== '节假日' && r.status !== '周末')

    summaries.push({
      employeeId: emp.id,
      employeeName: emp.name,
      departmentId: emp.departmentId,
      year,
      month,
      requiredDays: workdays.length,
      actualDays: workdays.filter(r => r.status === '正常' || r.status === '迟到' || r.status === '早退').length,
      lateTimes: workdays.filter(r => r.status === '迟到' || r.status === '迟到且早退').length,
      earlyLeaveTimes: workdays.filter(r => r.status === '早退' || r.status === '迟到且早退').length,
      absentTimes: workdays.filter(r => r.status === '缺卡').length,
      absenteeismDays: workdays.filter(r => r.status === '旷工').length,
      sickLeaveDays: workdays.filter(r => r.leaveType === '病假').length,
      personalLeaveDays: workdays.filter(r => r.leaveType === '事假').length,
      annualLeaveDays: workdays.filter(r => r.leaveType === '年假').length,
      otherLeaveDays: workdays.filter(r => r.leaveType && !['病假', '事假', '年假'].includes(r.leaveType)).length,
      overtimeHoursWeekday: empRecords.filter(r => r.status !== '周末' && r.status !== '节假日').reduce((s, r) => s + r.overtimeHours, 0),
      overtimeHoursWeekend: empRecords.filter(r => r.status === '周末').reduce((s, r) => s + r.overtimeHours, 0),
      overtimeHoursHoliday: empRecords.filter(r => r.status === '节假日').reduce((s, r) => s + r.overtimeHours, 0),
      totalOvertimeHours: empRecords.reduce((s, r) => s + r.overtimeHours, 0),
    })
  })

  return summaries
}
