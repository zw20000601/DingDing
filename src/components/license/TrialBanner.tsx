'use client'
import { useState } from 'react'
import { useLicenseStore } from '@/store/license'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Zap, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TrialBanner() {
  const { status, daysLeft, isActivated } = useLicenseStore()
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  const s = status()
  const days = daysLeft()

  if (isActivated() || dismissed) return null

  const isUrgent = days <= 1
  const isWarning = days <= 2

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all',
      isUrgent
        ? 'bg-red-500 text-white'
        : isWarning
        ? 'bg-orange-500 text-white'
        : 'bg-primary-600 text-white'
    )}>
      <div className="flex items-center gap-2.5">
        {isUrgent
          ? <AlertTriangle size={15} className="flex-shrink-0 animate-pulse" />
          : <Clock size={15} className="flex-shrink-0" />
        }
        <span>
          {s === 'trial'
            ? <><strong>试用版</strong> · 剩余 <strong>{days}</strong> 天免费试用{isUrgent ? '，今日到期，请及时激活！' : '，到期后将无法访问。'}</>
            : <><strong>试用已到期</strong> · 请激活软件以继续使用。</>
          }
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push('/activate')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
            'bg-white/20 hover:bg-white/30'
          )}
        >
          <Zap size={12} />
          立即激活
        </button>
        {s === 'trial' && !isUrgent && (
          <button onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100">
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
