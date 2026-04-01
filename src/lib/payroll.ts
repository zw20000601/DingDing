import { Employee, MonthlyAttendanceSummary, AttendanceRules, PayrollRecord } from '@/types'

export function calculatePayroll(
  emp: Employee,
  summary: MonthlyAttendanceSummary,
  rules: AttendanceRules,
  year: number,
  month: number,
  extraAllowances: Array<{ name: string; amount: number }> = []
): PayrollRecord {
  const id = `pay-${emp.id}-${year}-${String(month).padStart(2, '0')}`

  // 1. 基本工资
  const requiredDays = summary.requiredDays || 22
  const actualDays = summary.actualDays || requiredDays
  const basicSalary = Math.round((emp.salaryBase * (actualDays / requiredDays)) * 100) / 100

  // 2. 加班费
  const overtimePayWeekday = Math.round(summary.overtimeHoursWeekday * emp.overtimeHourlyRate * rules.overtimeRateWeekday * 100) / 100
  const overtimePayWeekend = Math.round(summary.overtimeHoursWeekend * emp.overtimeHourlyRate * rules.overtimeRateWeekend * 100) / 100
  const overtimePayHoliday = Math.round(summary.overtimeHoursHoliday * emp.overtimeHourlyRate * rules.overtimeRateHoliday * 100) / 100
  const totalOvertimePay = overtimePayWeekday + overtimePayWeekend + overtimePayHoliday

  // 3. 全勤奖
  const hasFullAttendance = summary.lateTimes === 0 && summary.earlyLeaveTimes === 0 &&
    summary.absentTimes === 0 && summary.absenteeismDays === 0 &&
    summary.personalLeaveDays === 0 && summary.sickLeaveDays === 0
  const fullAttendanceBonus = hasFullAttendance ? rules.fullAttendanceBonus : 0

  // 4. 扣款计算
  const dailySalary = emp.salaryBase / 22
  const hourlyRate = dailySalary / 8

  // 迟到扣款
  const lateDeduction = calculateDeduction(summary.lateTimes * 15, rules.deductionRules.find(r => r.type === 'late'), dailySalary)
  // 早退扣款
  const earlyLeaveDeduction = calculateDeduction(summary.earlyLeaveTimes * 15, rules.deductionRules.find(r => r.type === 'earlyLeave'), dailySalary)
  // 旷工扣款
  const absenteeismDeduction = Math.round(summary.absenteeismDays * dailySalary * 100) / 100
  // 事假扣款
  const personalLeaveDeduction = Math.round(summary.personalLeaveDays * dailySalary * 1.0 * 100) / 100
  // 病假扣款（80%）
  const sickLeaveDeduction = Math.round(summary.sickLeaveDays * dailySalary * 0.8 * 100) / 100
  const absentDeduction = personalLeaveDeduction + sickLeaveDeduction + (summary.absentTimes * dailySalary * 0.5)

  // 5. 补贴
  const totalAllowances = extraAllowances.reduce((s, a) => s + a.amount, 0)

  // 6. 社保 (简化计算: 个人缴纳 ~11%)
  const socialInsuranceBase = emp.salaryBase
  const socialInsurance = Math.round(socialInsuranceBase * 0.105 * 100) / 100

  // 7. 应发工资
  const grossSalary = basicSalary + totalOvertimePay + fullAttendanceBonus +
    emp.positionAllowance + totalAllowances

  // 8. 个税（简化：应税收入 = 应发 - 5000起征点 - 社保）
  const taxableIncome = Math.max(0, grossSalary - lateDeduction - earlyLeaveDeduction -
    absenteeismDeduction - absentDeduction - socialInsurance - 5000)
  const incomeTax = calculateIncomeTax(taxableIncome)

  // 9. 实发工资
  const netSalary = Math.round(
    (grossSalary - lateDeduction - earlyLeaveDeduction - absenteeismDeduction -
      absentDeduction - socialInsurance - incomeTax) * 100
  ) / 100

  return {
    id,
    employeeId: emp.id,
    employeeName: emp.name,
    departmentId: emp.departmentId,
    year,
    month,
    salaryBase: emp.salaryBase,
    requiredDays,
    actualDays,
    basicSalary,
    positionAllowance: emp.positionAllowance,
    overtimePayWeekday,
    overtimePayWeekend,
    overtimePayHoliday,
    totalOvertimePay,
    fullAttendanceBonus,
    allowances: extraAllowances,
    totalAllowances,
    lateDeduction,
    earlyLeaveDeduction,
    absentDeduction: Math.round(absentDeduction * 100) / 100,
    absenteeismDeduction,
    socialInsurance,
    incomeTax,
    grossSalary: Math.round(grossSalary * 100) / 100,
    netSalary,
    status: '待审核',
    calculatedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    remark: '',
  }
}

function calculateDeduction(
  totalMinutes: number,
  rule: { tiers: Array<{ minMinutes: number; maxMinutes: number | null; amount: number | null; dailySalaryRatio: number | null }> } | undefined,
  dailySalary: number
): number {
  if (!rule || totalMinutes === 0) return 0
  for (const tier of rule.tiers) {
    if (totalMinutes >= tier.minMinutes && (tier.maxMinutes === null || totalMinutes <= tier.maxMinutes)) {
      if (tier.amount !== null) return tier.amount
      if (tier.dailySalaryRatio !== null) return Math.round(dailySalary * tier.dailySalaryRatio * 100) / 100
    }
  }
  return 0
}

function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  const brackets = [
    { limit: 3000, rate: 0.03, deduction: 0 },
    { limit: 12000, rate: 0.10, deduction: 210 },
    { limit: 25000, rate: 0.20, deduction: 1410 },
    { limit: 35000, rate: 0.25, deduction: 2660 },
    { limit: 55000, rate: 0.30, deduction: 4410 },
    { limit: 80000, rate: 0.35, deduction: 7160 },
    { limit: Infinity, rate: 0.45, deduction: 15160 },
  ]
  for (const b of brackets) {
    if (taxableIncome <= b.limit) {
      return Math.round((taxableIncome * b.rate - b.deduction) * 100) / 100
    }
  }
  return 0
}
