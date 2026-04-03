import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { validateKey, getTrialDaysLeft, isTrialExpired, LicensePlan, TRIAL_DAYS } from '@/lib/license'

export type LicenseStatus = 'trial' | 'activated' | 'expired'

export interface LicenseState {
  // 试用
  trialStartDate: string        // 首次启动时间
  // 激活
  licenseKey: string | null
  plan: LicensePlan | null
  activatedAt: string | null

  // 计算属性
  status: () => LicenseStatus
  daysLeft: () => number
  isActivated: () => boolean

  // 操作
  activate: (key: string) => { success: boolean; message: string }
  deactivate: () => void
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      trialStartDate: new Date().toISOString(),
      licenseKey: null,
      plan: null,
      activatedAt: null,

      status: () => {
        if (get().licenseKey) return 'activated'
        if (isTrialExpired(get().trialStartDate)) return 'expired'
        return 'trial'
      },

      daysLeft: () => {
        if (get().licenseKey) return Infinity
        return getTrialDaysLeft(get().trialStartDate)
      },

      isActivated: () => !!get().licenseKey,

      activate: (key: string) => {
        const result = validateKey(key)
        if (!result.valid) return { success: false, message: result.message }
        set({
          licenseKey: key.trim().toUpperCase(),
          plan: result.plan,
          activatedAt: new Date().toISOString(),
        })
        return { success: true, message: result.message }
      },

      deactivate: () => {
        set({ licenseKey: null, plan: null, activatedAt: null })
      },
    }),
    {
      name: 'dingtalk-license',
      partialize: (state) => ({
        trialStartDate: state.trialStartDate,
        licenseKey: state.licenseKey,
        plan: state.plan,
        activatedAt: state.activatedAt,
      }),
    }
  )
)
