'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLicenseStore } from '@/store/license'
import { DEMO_KEYS, TRIAL_DAYS } from '@/lib/license'
import { ActivationModal } from '@/components/license/ActivationModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  CheckCircle, Zap, Shield, Star, Crown, Building2,
  KeyRound, Clock, CreditCard, QrCode, MessageCircle,
  Copy, ChevronRight, ArrowLeft, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'standard',
    name: '标准版',
    icon: Star,
    price: 299,
    unit: '/年',
    originalPrice: 399,
    color: '#3b82f6',
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    popular: false,
    desc: '适合 50 人以内的中小企业',
    features: [
      '最多 50 名员工档案',
      '考勤数据导入（Excel/CSV）',
      '薪酬自动核算',
      '标准报表导出',
      '单机授权',
      '1 年免费升级',
      '邮件工单支持',
    ],
    unavailable: ['钉钉 API 自动同步', '多端同时登录', '优先技术支持'],
  },
  {
    id: 'professional',
    name: '专业版',
    icon: Zap,
    price: 899,
    unit: '/年',
    originalPrice: 1299,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    popular: true,
    desc: '适合 200 人以内的成长型企业',
    features: [
      '最多 200 名员工档案',
      '钉钉 API 自动同步 ✦',
      '薪酬核算（含五险一金+个税）',
      '全维度报表 + 数据可视化',
      '3 端同时登录',
      '1 年免费升级',
      '在线客服优先支持',
    ],
    unavailable: ['不限员工数量', '专属实施顾问'],
  },
  {
    id: 'enterprise',
    name: '企业版',
    icon: Crown,
    price: 2999,
    unit: '/年',
    originalPrice: 4999,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    popular: false,
    desc: '适合大型企业或定制化需求',
    features: [
      '员工数量不限',
      '钉钉 API 全量同步',
      '完整薪酬体系（社保/个税/调休）',
      '全维度报表 + 数据可视化',
      '不限登录端数',
      '永久免费升级',
      '专属实施顾问 + SLA 保障',
    ],
    unavailable: [],
  },
]

type PayMethod = 'wechat' | 'alipay'

export default function ActivatePage() {
  const router = useRouter()
  const { status, daysLeft, isActivated, plan: activatedPlan, activatedAt } = useLicenseStore()

  const [activationModalOpen, setActivationModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [payMethod, setPayMethod] = useState<PayMethod>('wechat')
  const [showPayment, setShowPayment] = useState(false)

  const s = status()
  const days = daysLeft()
  const activated = isActivated()

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => toast.success('激活码已复制'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-800">钉钉考勤薪酬管理系统</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activated ? (
              <Badge variant="success">
                <Sparkles size={12} />已激活 · {activatedPlan === 'standard' ? '标准版' : activatedPlan === 'professional' ? '专业版' : '企业版'}
              </Badge>
            ) : s === 'trial' ? (
              <Badge variant="warning"><Clock size={12} />剩余 {days} 天试用</Badge>
            ) : (
              <Badge variant="danger">试用已到期</Badge>
            )}
            <Button size="sm" onClick={() => setActivationModalOpen(true)}>
              <KeyRound size={14} />输入激活码
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">

        {/* Already activated banner */}
        {activated && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">软件已激活 🎉</h2>
              <p className="text-green-100 text-sm">
                当前版本：<strong>{activatedPlan === 'standard' ? '标准版' : activatedPlan === 'professional' ? '专业版' : '企业版'}</strong>
                &nbsp;·&nbsp;激活时间：{activatedAt ? new Date(activatedAt).toLocaleDateString('zh-CN') : '-'}
              </p>
            </div>
            <Button variant="secondary" className="ml-auto" onClick={() => router.push('/')}>
              返回使用 <ChevronRight size={14} />
            </Button>
          </div>
        )}

        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="info" className="mx-auto text-sm px-4 py-1.5">
            <Sparkles size={13} />限时优惠，立省最高 2000 元
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900">
            选择适合您企业的<span className="text-gradient bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent"> 版本</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            一次购买，永久使用。所有版本均含 1 年免费升级服务，到期后仍可使用当前版本。
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              onClick={() => { setSelectedPlan(plan.id); setShowPayment(false) }}
              className={`relative bg-white rounded-3xl border-2 p-7 cursor-pointer transition-all hover:shadow-xl ${
                selectedPlan === plan.id
                  ? `border-current shadow-lg shadow-current/10`
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              style={selectedPlan === plan.id ? { borderColor: plan.color } : {}}
            >
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-xs font-bold rounded-full shadow-lg"
                  style={{ background: plan.color }}
                >
                  🔥 最受欢迎
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${plan.gradient}`}>
                <plan.icon size={22} className="text-white" />
              </div>

              <div className="mb-1">
                <span className="text-xl font-bold text-gray-800">{plan.name}</span>
              </div>
              <div className="text-xs text-gray-400 mb-4">{plan.desc}</div>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">¥{plan.price}</span>
                <span className="text-gray-400 text-sm mb-1">{plan.unit}</span>
                <span className="text-gray-300 line-through text-sm mb-1">¥{plan.originalPrice}</span>
              </div>

              <div className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                    {f}
                  </div>
                ))}
                {plan.unavailable.map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-gray-300 line-through">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 flex-shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={e => { e.stopPropagation(); setSelectedPlan(plan.id); setShowPayment(true) }}
                className={`w-full py-3 rounded-2xl text-sm font-bold text-white transition-all bg-gradient-to-r ${plan.gradient} hover:opacity-90 shadow-md`}
              >
                立即购买
              </button>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        {showPayment && selectedPlan && (() => {
          const plan = PLANS.find(p => p.id === selectedPlan)!
          return (
            <div id="payment-section" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                完成购买 — <span style={{ color: plan.color }}>{plan.name}</span>
                <span className="text-gray-400 font-normal text-base ml-2">¥{plan.price}/年</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Payment method */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">选择支付方式</p>
                  <div className="flex gap-3 mb-6">
                    {([
                      { id: 'wechat', label: '微信支付', icon: '💚', color: '#07c160' },
                      { id: 'alipay', label: '支付宝', icon: '💙', color: '#1677ff' },
                    ] as const).map(m => (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        className={`flex-1 flex items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                          payMethod === m.id ? 'border-current' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        style={payMethod === m.id ? { borderColor: m.color, background: `${m.color}0d` } : {}}
                      >
                        <span className="text-2xl">{m.icon}</span>
                        <span className="font-semibold text-sm text-gray-700">{m.label}</span>
                        {payMethod === m.id && <CheckCircle size={16} className="ml-auto" style={{ color: m.color }} />}
                      </button>
                    ))}
                  </div>

                  {/* QR placeholder */}
                  <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl">
                    <div className="w-40 h-40 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300">
                      <QrCode size={40} />
                      <span className="text-xs text-center">
                        {payMethod === 'wechat' ? '微信扫码支付' : '支付宝扫码支付'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      ⚠️ 演示模式：实际支付功能对接后显示真实二维码
                    </p>
                    <div className="text-2xl font-extrabold text-gray-800">¥{plan.price}</div>
                  </div>
                </div>

                {/* Right: Order info + manual activation */}
                <div className="space-y-4">
                  <div className="p-5 bg-gray-50 rounded-2xl space-y-3 text-sm">
                    <p className="font-semibold text-gray-700">订单信息</p>
                    {[
                      { label: '产品', value: `钉钉考勤薪酬 · ${plan.name}` },
                      { label: '授权期限', value: '1 年（支持续费）' },
                      { label: '授权设备', value: plan.id === 'standard' ? '单机' : plan.id === 'professional' ? '3 台' : '不限' },
                      { label: '实付金额', value: `¥${plan.price}（原价 ¥${plan.originalPrice}）` },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-gray-400">{row.label}</span>
                        <span className="font-medium text-gray-700">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 bg-primary-50 rounded-2xl border border-primary-100 space-y-2 text-sm">
                    <p className="font-semibold text-primary-700">📩 付款后如何激活？</p>
                    <div className="space-y-1.5 text-gray-500 text-xs">
                      <p>① 完成支付后，激活码将通过以下方式发送：</p>
                      <p className="pl-3">• 支付手机号对应的短信</p>
                      <p className="pl-3">• 购买时填写的邮箱地址</p>
                      <p>② 收到激活码后，点击右上角「输入激活码」</p>
                      <p>③ 填入激活码，点击激活，即刻解锁全部功能</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setActivationModalOpen(true)}>
                      <KeyRound size={13} />已有激活码
                    </Button>
                    <Button size="sm" className="flex-1">
                      <CreditCard size={13} />确认支付 ¥{plan.price}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Demo Keys Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">演示激活码</h3>
              <p className="text-xs text-gray-400">以下激活码仅供功能演示，每次重置会生成新码</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEMO_KEYS.map(dk => {
              const plan = PLANS.find(p => p.id === dk.plan)!
              return (
                <div key={dk.key} className={`p-4 rounded-2xl border ${plan.borderColor} ${plan.bgLight}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <plan.icon size={15} style={{ color: plan.color }} />
                    <span className="text-sm font-semibold" style={{ color: plan.color }}>{plan.name}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-gray-700 tracking-widest mb-3">
                    {dk.key}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyKey(dk.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-current rounded-xl hover:bg-white/50 transition-colors font-medium"
                      style={{ color: plan.color, borderColor: plan.color }}
                    >
                      <Copy size={12} />复制
                    </button>
                    <button
                      onClick={() => { setActivationModalOpen(true) }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-white rounded-xl font-medium"
                      style={{ background: plan.color }}
                    >
                      <Zap size={12} />激活
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: '购买后如何获取激活码？', a: '付款成功后，激活码会在 5 分钟内通过短信和邮件发送，请注意查收。如未收到请联系客服。' },
            { q: '激活码可以重复使用吗？', a: '每个激活码只能绑定一台/若干台设备（视版本而定），不可转让或重复激活。' },
            { q: '到期后还能继续使用吗？', a: '年度授权到期后，软件仍可继续使用当前版本，但无法获得新功能更新。续费后立即恢复。' },
            { q: '支持退款吗？', a: '自激活之日起 7 天内，如对产品不满意可申请全额退款，退款成功后激活码将失效。' },
          ].map(item => (
            <div key={item.q} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1.5">{item.q}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-sm text-gray-400">如需帮助，请联系我们</p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>📧 support@dingding-hr.com</span>
            <span>💬 微信客服：DingHR2025</span>
            <span>📞 400-888-0000（工作日 9:00-18:00）</span>
          </div>
        </div>
      </main>

      <ActivationModal
        open={activationModalOpen}
        onClose={() => setActivationModalOpen(false)}
        onSuccess={() => router.push('/')}
      />
    </div>
  )
}
