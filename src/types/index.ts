// ============ 部门 ============
export interface Department {
  id: string
  name: string
  code: string
  parentId: string | null
  leaderId: string | null
  enabled: boolean
  createdAt: string
}

// ============ 员工 ============
export type WorkSchedule = '做五休二' | '单休' | '大小周' | '排班制'

export interface Employee {
  id: string
  name: string
  employeeNo: string
  departmentId: string
  position: string
  hireDate: string
  phone: string
  email: string
  salaryBase: number
  positionAllowance: number
  overtimeHourlyRate: number
  workSchedule: WorkSchedule
  workStartTime: string  // "09:00"
  workEndTime: string    // "18:00"
  dingUserId: string | null
  enabled: boolean
  createdAt: string
}

// ============ 考勤规则 ============
export interface AttendanceRules {
  workStartTime: string      // "09:00"
  workEndTime: string        // "18:00"
  lateGrace: number          // 分钟
  earlyLeaveGrace: number    // 分钟
  overtimeStartAfter: number // 分钟：超出下班时间多少分钟后开始计算加班
  overtimeRounding: OvertimeRoundingRule[]
  overtimeRateWeekday: number   // 1.5
  overtimeRateWeekend: number   // 2.0
  overtimeRateHoliday: number   // 3.0
  fullAttendanceBonus: number   // 元
  fullAttendanceBonusInBase: boolean
  lunchBreakMinutes: number     // 午休分钟数
  deductionRules: DeductionRule[]
}

export interface OvertimeRoundingRule {
  minMinutes: number
  maxMinutes: number
  roundTo: number  // 小时
}

export interface DeductionRule {
  type: 'late' | 'earlyLeave' | 'absent' | 'sickLeave' | 'personalLeave' | 'absenteeism'
  name: string
  tiers: DeductionTier[]
}

export interface DeductionTier {
  minMinutes: number
  maxMinutes: number | null
  amount: number | null      // 固定金额
  dailySalaryRatio: number | null  // 日薪比例
}

// ============ 节假日 ============
export interface Holiday {
  id: string
  date: string   // "2025-01-01"
  name: string
  type: 'holiday' | 'workday'  // 节假日 or 补班日
}

// ============ 请假类型 ============
export interface LeaveType {
  id: string
  name: string
  ratio: number  // 折算比例 0~1
  color: string
}

// ============ 打卡记录（原始） ============
export interface CheckRecord {
  id: string
  employeeId: string
  date: string          // "2025-01-15"
  checkIn: string | null   // "08:55"
  checkOut: string | null  // "18:30"
  source: 'api' | 'import' | 'manual'
  rawData?: Record<string, unknown>
}

// ============ 考勤状态 ============
export type AttendanceStatus =
  | '正常'
  | '迟到'
  | '早退'
  | '迟到且早退'
  | '缺卡'
  | '旷工'
  | '请假'
  | '节假日'
  | '周末'

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  lateMinutes: number
  earlyLeaveMinutes: number
  overtimeHours: number
  workHours: number
  leaveType: string | null
  leaveHours: number
  remark: string
  manualAdjusted: boolean
  adjustedBy: string | null
  adjustedAt: string | null
}

// ============ 月度考勤汇总 ============
export interface MonthlyAttendanceSummary {
  employeeId: string
  employeeName: string
  departmentId: string
  year: number
  month: number
  requiredDays: number
  actualDays: number
  lateTimes: number
  earlyLeaveTimes: number
  absentTimes: number
  absenteeismDays: number
  sickLeaveDays: number
  personalLeaveDays: number
  annualLeaveDays: number
  otherLeaveDays: number
  overtimeHoursWeekday: number
  overtimeHoursWeekend: number
  overtimeHoursHoliday: number
  totalOvertimeHours: number
}

// ============ 薪资单 ============
export type PayrollStatus = '草稿' | '待审核' | '已审核' | '已发放'

export interface Allowance {
  name: string
  amount: number
}

export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  year: number
  month: number
  salaryBase: number
  requiredDays: number
  actualDays: number
  basicSalary: number
  positionAllowance: number
  overtimePayWeekday: number
  overtimePayWeekend: number
  overtimePayHoliday: number
  totalOvertimePay: number
  fullAttendanceBonus: number
  allowances: Allowance[]
  totalAllowances: number
  lateDeduction: number
  earlyLeaveDeduction: number
  absentDeduction: number
  absenteeismDeduction: number
  socialInsurance: number
  incomeTax: number
  grossSalary: number
  netSalary: number
  status: PayrollStatus
  calculatedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  remark: string
}

// ============ 操作日志 ============
export interface AuditLog {
  id: string
  operator: string
  action: string
  target: string
  targetId: string
  beforeValue: string
  afterValue: string
  timestamp: string
}

// ============ 系统设置 ============
export interface SystemSettings {
  companyName: string
  dingAppKey: string
  dingAppSecret: string
  dingCorpId: string
  attendanceRules: AttendanceRules
  leaveTypes: LeaveType[]
  holidays: Holiday[]
}

// ============ 报表筛选 ============
export interface ReportFilter {
  year: number
  month: number
  departmentId: string | null
  employeeId: string | null
}

// ============ 用户角色与权限 ============
export type UserRole = 'admin' | 'hr' | 'finance' | 'employee'

export interface RolePermission {
  role: UserRole
  label: string
  description: string
  color: string
  permissions: Permission[]
}

export type Permission =
  | 'dashboard.view'
  | 'employee.view'
  | 'employee.create'
  | 'employee.edit'
  | 'employee.delete'
  | 'attendance.view'
  | 'attendance.edit'
  | 'attendance.import'
  | 'attendance.sync'
  | 'payroll.view'
  | 'payroll.calculate'
  | 'payroll.review'
  | 'payroll.issue'
  | 'reports.view'
  | 'reports.export'
  | 'settings.view'
  | 'settings.edit'
  | 'admin.users'
  | 'my.attendance'
  | 'my.payroll'

// ============ 系统用户 ============
export interface SystemUser {
  id: string
  username: string
  passwordHash: string   // 生产环境应 bcrypt，演示使用 base64
  displayName: string
  role: UserRole
  employeeId: string | null   // 关联员工档案（普通员工必填）
  departmentId: string | null
  email: string
  phone: string
  avatar: string | null
  enabled: boolean
  lastLogin: string | null
  createdAt: string
  createdBy: string
}

// ============ 登录会话 ============
export interface AuthSession {
  user: SystemUser
  loginAt: string
  expiresAt: string
}
