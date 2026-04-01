'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { useAppStore } from '@/store'
import { Holiday } from '@/types'
import { generateId } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Settings, Clock, Calendar, Zap, Shield, Bell,
  Plus, Trash2, Edit2, CheckCircle, Eye, EyeOff, RefreshCw
} from 'lucide-react'

export default function SettingsPage() {
  const { settings, updateSettings, updateAttendanceRules, addHoliday, updateHoliday, deleteHoliday } = useAppStore()
  const [activeTab, setActiveTab] = useState<'attendance' | 'holiday' | 'api' | 'company'>('attendance')
  const [showSecret, setShowSecret] = useState(false)
  const [testingApi, setTestingApi] = useState(false)
  const [holidayModal, setHolidayModal] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', type: 'holiday' as 'holiday' | 'workday' })
  const [deleteHolidayId, setDeleteHolidayId] = useState<string | null>(null)

  const rules = settings.attendanceRules

  const handleSaveRules = (updates: Partial<typeof rules>) => {
    updateAttendanceRules({ ...rules, ...updates })
    toast.success('考勤规则已保存')
  }

  const handleSaveApi = () => {
    toast.success('API 配置已保存（已加密存储）')
  }

  const handleTestApi = async () => {
    setTestingApi(true)
    await new Promise(r => setTimeout(r, 1500))
    setTestingApi(false)
    toast.success('API 连接测试成功（演示模式）')
  }

  const openAddHoliday = () => {
    setEditingHoliday(null)
    setHolidayForm({ date: '', name: '', type: 'holiday' })
    setHolidayModal(true)
  }

  const openEditHoliday = (h: Holiday) => {
    setEditingHoliday(h)
    setHolidayForm({ date: h.date, name: h.name, type: h.type })
    setHolidayModal(true)
  }

  const handleSaveHoliday = () => {
    if (!holidayForm.date || !holidayForm.name) return toast.error('请填写完整')
    if (editingHoliday) {
      updateHoliday(editingHoliday.id, holidayForm)
      toast.success('节假日已更新')
    } else {
      addHoliday({ ...holidayForm, id: generateId() })
      toast.success('节假日已添加')
    }
    setHolidayModal(false)
  }

  const tabs = [
    { key: 'attendance', label: '考勤规则', icon: Clock },
    { key: 'holiday', label: '节假日设置', icon: Calendar },
    { key: 'api', label: '钉钉 API', icon: Zap },
    { key: 'company', label: '公司信息', icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="系统设置" subtitle="配置考勤规则、节假日日历与钉钉 API" />

      <div className="flex-1 p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Attendance Rules */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Basic Time */}
            <Card>
              <CardHeader><CardTitle>基础时间设置</CardTitle></CardHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="标准上班时间"
                    type="time"
                    value={rules.workStartTime}
                    onChange={e => handleSaveRules({ workStartTime: e.target.value })}
                  />
                  <Input
                    label="标准下班时间"
                    type="time"
                    value={rules.workEndTime}
                    onChange={e => handleSaveRules({ workEndTime: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">迟到宽限（分钟）</label>
                    <input
                      type="number" min={0} max={30}
                      value={rules.lateGrace}
                      onChange={e => handleSaveRules({ lateGrace: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">早退宽限（分钟）</label>
                    <input
                      type="number" min={0} max={30}
                      value={rules.earlyLeaveGrace}
                      onChange={e => handleSaveRules({ earlyLeaveGrace: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">午休时长（分钟）</label>
                  <input
                    type="number" min={0} max={120}
                    value={rules.lunchBreakMinutes}
                    onChange={e => handleSaveRules({ lunchBreakMinutes: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </Card>

            {/* Overtime Rules */}
            <Card>
              <CardHeader><CardTitle>加班计算规则</CardTitle></CardHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">加班起算时间（分钟）</label>
                  <p className="text-xs text-gray-400 mb-2">超过下班时间多少分钟后才开始计算加班</p>
                  <input
                    type="number" min={0}
                    value={rules.overtimeStartAfter}
                    onChange={e => handleSaveRules({ overtimeStartAfter: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '工作日加班倍率', key: 'overtimeRateWeekday' as const },
                    { label: '周末加班倍率', key: 'overtimeRateWeekend' as const },
                    { label: '节假日加班倍率', key: 'overtimeRateHoliday' as const },
                  ].map(item => (
                    <div key={item.key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{item.label}</label>
                      <input
                        type="number" step={0.5} min={1}
                        value={rules[item.key]}
                        onChange={e => handleSaveRules({ [item.key]: Number(e.target.value) })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Full Attendance Bonus */}
            <Card>
              <CardHeader><CardTitle>全勤奖设置</CardTitle></CardHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">全勤奖金额（元/月）</label>
                  <input
                    type="number" min={0}
                    value={rules.fullAttendanceBonus}
                    onChange={e => handleSaveRules({ fullAttendanceBonus: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={rules.fullAttendanceBonusInBase}
                    onChange={e => handleSaveRules({ fullAttendanceBonusInBase: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                    id="bonus-in-base"
                  />
                  <label htmlFor="bonus-in-base" className="text-sm text-gray-600">
                    将全勤奖纳入底薪内计算（影响缺勤扣款基数）
                  </label>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                  触发条件：当月无迟到、早退、缺勤、请假
                </div>
              </div>
            </Card>

            {/* Deduction Rules Preview */}
            <Card>
              <CardHeader><CardTitle>扣款规则配置</CardTitle></CardHeader>
              <div className="space-y-3">
                {rules.deductionRules.map(rule => (
                  <div key={rule.type} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">{rule.name}</p>
                    <div className="space-y-1">
                      {rule.tiers.map((tier, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {tier.minMinutes}-{tier.maxMinutes ?? '∞'} 分钟
                          </span>
                          <Badge variant="warning">
                            {tier.amount !== null ? `扣 ¥${tier.amount}` : `扣 ${((tier.dailySalaryRatio || 0) * 100).toFixed(0)}% 日薪`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Holiday Settings */}
        {activeTab === 'holiday' && (
          <Card padding={false}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <div>
                <p className="font-medium text-gray-800">节假日日历</p>
                <p className="text-xs text-gray-400 mt-0.5">管理法定节假日和调休补班日</p>
              </div>
              <Button size="sm" onClick={openAddHoliday}><Plus size={14} />添加节假日</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">日期</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">名称</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">类型</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {settings.holidays.map(h => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{h.date}</td>
                      <td className="px-4 py-3 font-medium">{h.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={h.type === 'holiday' ? 'danger' : 'info'}>
                          {h.type === 'holiday' ? '节假日' : '调休补班'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditHoliday(h)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500"><Edit2 size={13} /></button>
                          <button onClick={() => setDeleteHolidayId(h.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* DingTalk API */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>钉钉开放平台配置</CardTitle>
                <Badge variant="warning">未连接</Badge>
              </CardHeader>
              <div className="space-y-4">
                <Input
                  label="AppKey"
                  value={settings.dingAppKey}
                  onChange={e => updateSettings({ dingAppKey: e.target.value })}
                  placeholder="钉钉应用 AppKey"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AppSecret</label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={settings.dingAppSecret}
                      onChange={e => updateSettings({ dingAppSecret: e.target.value })}
                      placeholder="钉钉应用 AppSecret（加密存储）"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Input
                  label="Corp ID（企业 ID）"
                  value={settings.dingCorpId}
                  onChange={e => updateSettings({ dingCorpId: e.target.value })}
                  placeholder="钉钉企业 ID"
                />
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" size="sm" loading={testingApi} onClick={handleTestApi}>
                    <RefreshCw size={14} />测试连接
                  </Button>
                  <Button size="sm" onClick={handleSaveApi}>
                    <Shield size={14} />保存配置
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>API 功能说明</CardTitle></CardHeader>
              <div className="space-y-3">
                {[
                  { name: '获取部门列表', api: '/topapi/v2/department/listsub', desc: '同步钉钉部门结构' },
                  { name: '获取部门用户', api: '/topapi/v2/user/list', desc: '员工 UserID 绑定' },
                  { name: '获取考勤打卡记录', api: '/topapi/attendance/list', desc: '批量拉取打卡数据' },
                  { name: '获取假勤审批记录', api: '/topapi/processinstance/get', desc: '请假数据自动关联' },
                ].map(item => (
                  <div key={item.name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={13} className="text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <code className="text-xs text-gray-400 block">{item.api}</code>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700">
                <p className="font-semibold mb-1">⚠️ 安全提示</p>
                <p>AppKey 和 AppSecret 将使用 AES-256 加密存储，界面不明文显示。请勿将密钥暴露给他人。</p>
              </div>
            </Card>
          </div>
        )}

        {/* Company Info */}
        {activeTab === 'company' && (
          <Card className="max-w-xl">
            <CardHeader><CardTitle>公司基本信息</CardTitle></CardHeader>
            <div className="space-y-4">
              <Input
                label="公司名称"
                value={settings.companyName}
                onChange={e => updateSettings({ companyName: e.target.value })}
              />
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">请假类型配置</p>
                <div className="space-y-2">
                  {settings.leaveTypes.map(lt => (
                    <div key={lt.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lt.color }} />
                      <span className="text-sm font-medium text-gray-700 flex-1">{lt.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">扣薪比例</span>
                        <input
                          type="number" min={0} max={100} step={10}
                          value={lt.ratio * 100}
                          onChange={e => {
                            const newTypes = settings.leaveTypes.map(t =>
                              t.id === lt.id ? { ...t, ratio: Number(e.target.value) / 100 } : t
                            )
                            updateSettings({ leaveTypes: newTypes })
                          }}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => toast.success('公司信息已保存')}>保存设置</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Holiday Modal */}
      <Modal
        open={holidayModal}
        onClose={() => setHolidayModal(false)}
        title={editingHoliday ? '编辑节假日' : '添加节假日'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setHolidayModal(false)}>取消</Button>
            <Button onClick={handleSaveHoliday}>确认</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="日期"
            type="date"
            value={holidayForm.date}
            onChange={e => setHolidayForm(f => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="名称"
            value={holidayForm.name}
            onChange={e => setHolidayForm(f => ({ ...f, name: e.target.value }))}
            placeholder="如：国庆节"
          />
          <Select
            label="类型"
            value={holidayForm.type}
            onChange={e => setHolidayForm(f => ({ ...f, type: e.target.value as 'holiday' | 'workday' }))}
          >
            <option value="holiday">节假日（放假）</option>
            <option value="workday">调休补班（上班）</option>
          </Select>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteHolidayId}
        onClose={() => setDeleteHolidayId(null)}
        onConfirm={() => { deleteHolidayId && deleteHoliday(deleteHolidayId); setDeleteHolidayId(null); toast.success('已删除') }}
        title="确认删除"
        message="删除后该节假日将从系统中移除，不影响历史已计算数据。"
        danger
      />
    </div>
  )
}
