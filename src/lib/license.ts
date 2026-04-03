/**
 * 授权码引擎
 * 格式: XXXX-XXXX-XXXX-XXXX (每段4位大写字母+数字)
 * 校验: 第4段 = 前3段拼接的哈希值（可离线验证）
 * 前缀编码产品版本:
 *   DING = 标准版  DNGP = 专业版  DNGE = 企业版
 */

export type LicensePlan = 'standard' | 'professional' | 'enterprise'

export interface LicenseInfo {
  valid: boolean
  plan: LicensePlan
  message: string
}

const PLAN_PREFIX: Record<string, LicensePlan> = {
  DING: 'standard',
  DNGP: 'professional',
  DNGE: 'enterprise',
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** 生成4位校验段 */
function makeChecksum(seg1: string, seg2: string, seg3: string): string {
  const str = seg1 + seg2 + seg3
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
    h = h >>> 0  // unsigned 32-bit
  }
  let result = ''
  let n = h
  for (let i = 0; i < 4; i++) {
    result += CHARS[n % CHARS.length]
    n = Math.floor(n / CHARS.length)
  }
  return result
}

/** 生成一个激活码 */
export function generateKey(plan: LicensePlan = 'standard'): string {
  const prefix = Object.entries(PLAN_PREFIX).find(([, v]) => v === plan)?.[0] || 'DING'
  const randSeg = () => Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
  const seg2 = randSeg()
  const seg3 = randSeg()
  const seg4 = makeChecksum(prefix, seg2, seg3)
  return `${prefix}-${seg2}-${seg3}-${seg4}`
}

/** 验证激活码 */
export function validateKey(rawKey: string): LicenseInfo {
  const key = rawKey.trim().toUpperCase().replace(/\s/g, '')

  // 格式校验
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
    return { valid: false, plan: 'standard', message: '激活码格式错误，正确格式为 XXXX-XXXX-XXXX-XXXX' }
  }

  const [seg1, seg2, seg3, seg4] = key.split('-')

  // 前缀识别
  const plan = PLAN_PREFIX[seg1]
  if (!plan) {
    return { valid: false, plan: 'standard', message: '无效的激活码前缀，请检查后重新输入' }
  }

  // 校验段验证
  const expected = makeChecksum(seg1, seg2, seg3)
  if (expected !== seg4) {
    return { valid: false, plan: 'standard', message: '激活码校验失败，请确认输入无误' }
  }

  const planLabel: Record<LicensePlan, string> = {
    standard: '标准版',
    professional: '专业版',
    enterprise: '企业版',
  }

  return { valid: true, plan, message: `${planLabel[plan]}激活码验证成功` }
}

/** 预置演示激活码（用于界面展示） */
export const DEMO_KEYS: Array<{ key: string; plan: LicensePlan; label: string }> = [
  { key: generateKey('standard'), plan: 'standard', label: '标准版演示码' },
  { key: generateKey('professional'), plan: 'professional', label: '专业版演示码' },
  { key: generateKey('enterprise'), plan: 'enterprise', label: '企业版演示码' },
]

/** 试用天数 */
export const TRIAL_DAYS = 3

/** 计算试用剩余天数 */
export function getTrialDaysLeft(trialStartDate: string): number {
  const start = new Date(trialStartDate).getTime()
  const now = Date.now()
  const elapsed = (now - start) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsed))
}

/** 试用是否已过期 */
export function isTrialExpired(trialStartDate: string): boolean {
  return getTrialDaysLeft(trialStartDate) === 0
}
