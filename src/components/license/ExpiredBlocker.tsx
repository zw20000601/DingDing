'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ShoppingCart, KeyRound, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ActivationModal } from './ActivationModal'

export function ExpiredBlocker() {
  const router = useRouter()
  const [activationOpen, setActivationOpen] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={36} className="text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">试用期已结束</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          您的 3 天免费试用已到期。<br />
          请购买激活码以继续使用全部功能。
        </p>

        {/* Trial features recap */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">激活后即可解锁</p>
          <div className="space-y-2">
            {[
              '员工档案管理与批量导入',
              '考勤数据处理与异常审核',
              '薪酬自动核算与一键发薪',
              '多维报表生成与导出',
              '钉钉 API 自动同步',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push('/activate')}
          >
            <ShoppingCart size={16} />
            查看购买方案
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => setActivationOpen(true)}
          >
            <KeyRound size={16} />
            已有激活码，立即激活
          </Button>
        </div>

        <p className="text-xs text-gray-300 mt-6">
          如有疑问请联系客服 · support@dingding-hr.com
        </p>
      </div>

      <ActivationModal
        open={activationOpen}
        onClose={() => setActivationOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
