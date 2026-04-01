import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Department, Employee, AttendanceRecord, MonthlyAttendanceSummary,
  PayrollRecord, SystemSettings, AuditLog, Holiday, LeaveType
} from '@/types'
import {
  mockDepartments, mockEmployees, defaultAttendanceRules,
  mockHolidays, defaultLeaveTypes, generateMockAttendance, generateMonthlySummary
} from '@/lib/mockData'
import { generateId } from '@/lib/utils'

// ========== 全局 App Store ==========
interface AppStore {
  // 部门
  departments: Department[]
  setDepartments: (deps: Department[]) => void
  addDepartment: (dep: Department) => void
  updateDepartment: (id: string, data: Partial<Department>) => void
  deleteDepartment: (id: string) => void

  // 员工
  employees: Employee[]
  setEmployees: (emps: Employee[]) => void
  addEmployee: (emp: Employee) => void
  updateEmployee: (id: string, data: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  // 考勤记录
  attendanceRecords: AttendanceRecord[]
  setAttendanceRecords: (records: AttendanceRecord[]) => void
  updateAttendanceRecord: (id: string, data: Partial<AttendanceRecord>) => void
  generateAttendance: (year: number, month: number) => void

  // 月度汇总
  monthlySummaries: MonthlyAttendanceSummary[]
  setMonthlySummaries: (summaries: MonthlyAttendanceSummary[]) => void

  // 薪资记录
  payrollRecords: PayrollRecord[]
  setPayrollRecords: (records: PayrollRecord[]) => void
  addPayrollRecord: (record: PayrollRecord) => void
  updatePayrollRecord: (id: string, data: Partial<PayrollRecord>) => void

  // 系统设置
  settings: SystemSettings
  updateSettings: (data: Partial<SystemSettings>) => void
  updateAttendanceRules: (rules: SystemSettings['attendanceRules']) => void
  addHoliday: (holiday: Holiday) => void
  updateHoliday: (id: string, data: Partial<Holiday>) => void
  deleteHoliday: (id: string) => void

  // 操作日志
  auditLogs: AuditLog[]
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void

  // UI 状态
  currentYear: number
  currentMonth: number
  setCurrentYearMonth: (year: number, month: number) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
}

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const initialAttendance = generateMockAttendance(currentYear, currentMonth)
const initialSummaries = generateMonthlySummary(initialAttendance, currentYear, currentMonth)

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      departments: mockDepartments,
      setDepartments: (deps) => set({ departments: deps }),
      addDepartment: (dep) => set(s => ({ departments: [...s.departments, dep] })),
      updateDepartment: (id, data) => set(s => ({
        departments: s.departments.map(d => d.id === id ? { ...d, ...data } : d)
      })),
      deleteDepartment: (id) => set(s => ({
        departments: s.departments.filter(d => d.id !== id)
      })),

      employees: mockEmployees,
      setEmployees: (emps) => set({ employees: emps }),
      addEmployee: (emp) => set(s => ({ employees: [...s.employees, emp] })),
      updateEmployee: (id, data) => set(s => ({
        employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e)
      })),
      deleteEmployee: (id) => set(s => ({
        employees: s.employees.filter(e => e.id !== id)
      })),

      attendanceRecords: initialAttendance,
      setAttendanceRecords: (records) => set({ attendanceRecords: records }),
      updateAttendanceRecord: (id, data) => set(s => ({
        attendanceRecords: s.attendanceRecords.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      generateAttendance: (year, month) => {
        const records = generateMockAttendance(year, month)
        const summaries = generateMonthlySummary(records, year, month)
        set({ attendanceRecords: records, monthlySummaries: summaries })
      },

      monthlySummaries: initialSummaries,
      setMonthlySummaries: (summaries) => set({ monthlySummaries: summaries }),

      payrollRecords: [],
      setPayrollRecords: (records) => set({ payrollRecords: records }),
      addPayrollRecord: (record) => set(s => ({
        payrollRecords: [...s.payrollRecords.filter(r => r.id !== record.id), record]
      })),
      updatePayrollRecord: (id, data) => set(s => ({
        payrollRecords: s.payrollRecords.map(r => r.id === id ? { ...r, ...data } : r)
      })),

      settings: {
        companyName: '示例科技有限公司',
        dingAppKey: '',
        dingAppSecret: '',
        dingCorpId: '',
        attendanceRules: defaultAttendanceRules,
        leaveTypes: defaultLeaveTypes,
        holidays: mockHolidays,
      },
      updateSettings: (data) => set(s => ({ settings: { ...s.settings, ...data } })),
      updateAttendanceRules: (rules) => set(s => ({
        settings: { ...s.settings, attendanceRules: rules }
      })),
      addHoliday: (holiday) => set(s => ({
        settings: { ...s.settings, holidays: [...s.settings.holidays, holiday] }
      })),
      updateHoliday: (id, data) => set(s => ({
        settings: {
          ...s.settings,
          holidays: s.settings.holidays.map(h => h.id === id ? { ...h, ...data } : h)
        }
      })),
      deleteHoliday: (id) => set(s => ({
        settings: {
          ...s.settings,
          holidays: s.settings.holidays.filter(h => h.id !== id)
        }
      })),

      auditLogs: [],
      addAuditLog: (log) => set(s => ({
        auditLogs: [{
          ...log,
          id: generateId(),
          timestamp: new Date().toISOString()
        }, ...s.auditLogs].slice(0, 1000)
      })),

      currentYear,
      currentMonth,
      setCurrentYearMonth: (year, month) => {
        set({ currentYear: year, currentMonth: month })
        get().generateAttendance(year, month)
      },

      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    {
      name: 'dingtalk-attendance-storage',
      partialize: (state) => ({
        departments: state.departments,
        employees: state.employees,
        payrollRecords: state.payrollRecords,
        settings: state.settings,
        auditLogs: state.auditLogs,
      }),
    }
  )
)
