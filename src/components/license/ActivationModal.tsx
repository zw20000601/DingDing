'use client'
import { useState, useRef } from 'react'
import { useLicenseStore } from '@/store/license'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { KeyRound, CheckCircle, AlertCircle, ClipboardPaste, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ActivationModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ActivationModal({ open, onClose, onSuccess }: ActivationModalProps) {
  const { activate } = useLicenseStore()
  const [segments, setSegments] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleSegmentChange = (index: number, value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    const next = [...segments]
    next[index] = clean
    setSegments(next)
    setResult(null)
    // Auto-focus next
    if (clean.length === 4 && index < 3) {
      inputRefs[index + 1].current?.focus()
      inputRefs[index + 1].current?.select()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && segments[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus()
      inputRefs[index - 1].current?.select()
    }
    if (e.key === '-' || e.key === 'Tab') {
      e.preventDefault()
      if (index < 3) inputRefs[index + 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9-]/g, '')
    const parts = text.split('-').filter(Boolean).slice(0, 4).map(p => p.slice(0, 4))
    if (parts.length > 0) {
      const next = ['', '', '', '']
      parts.forEach((p, i) => { next[i] = p })
      setSegments(next)
      const lastFilled = Math.min(parts.length, 3)
      setTimeout(() => inputRefs[lastFilled].current?.focus(), 0)
    }
  }

  const handleActivate = async () => {
    const key = segments.join('-')
    if (segments.some(s => s.length < 4)) {
      setResult({ success: false, message: '请填写完整的激活码（每段4位）' })
      return
    }
    setLoading(true)
    setResult(null)
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800))
    const res = activate(key)
    setLoading(false)
    setResult(res)
    if (res.success) {
      toast.success('🎉 软件激活成功！感谢您的购买')
      setTimeout(() => {
        onClose()
        onSuccess?.()
        setSegments(['', '', '', ''])
        setResult(null)
      }, 1500)
    }
  }

  const isFull = segments.every(s => s.length === 4)

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) {
          onClose()
          setResult(null)
        }
      }}
      title="输入激活码"
      size="md"
    >
      <div className="space-y-6">
        {/* Header illustration */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <KeyRound size={28} className="text-primary-600" />
          </div>
          <p className="text-sm text-gray-500">
            输入您购买后收到的激活码，格式为
            <code className="mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 text-xs font-mono">XXXX-XXXX-XXXX-XXXX</code>
          </p>
        </div>

        {/* Key input segments */}
        <div>
          <div className="flex items-center justify-center gap-2">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  ref={inputRefs[i]}
                  value={seg}
                  onChange={e => handleSegmentChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  maxLength={4}
                  placeholder="XXXX"
                  spellCheck={false}
                  className={cn(
                    'w-20 text-center font-mono text-lg font-bold tracking-widest uppercase py-3 border-2 rounded-xl focus:outline-none transition-all',
                    seg.length === 4
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 focus:border-primary-400 focus:bg-white',
                    result?.success === false && 'border-red-300 bg-red-50'
                  )}
                />
                {i < 3 && <span className="text-gray-300 font-bold text-xl select-none">—</span>}
              </div>
            ))}
          </div>

          {/* Paste hint */}
          <div className="flex justify-center mt-2">
            <button
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText()
                  const cleaned = text.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                  const parts = cleaned.split('-').filter(Boolean).slice(0, 4).map(p => p.slice(0, 4))
                  if (parts.length === 4) {
                    setSegments([parts[0], parts[1], parts[2], parts[3]])
                    toast.success('已从剪贴板粘贴激活码')
                  } else {
                    toast.error('剪贴板内容不是有效的激活码格式')
                  }
                } catch {
                  toast.error('无法读取剪贴板，请手动粘贴（Ctrl+V）')
                }
              }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-500 transition-colors mt-1"
            >
              <ClipboardPaste size={13} />从剪贴板粘贴
            </button>
          </div>
        </div>

        {/* Result message */}
        {result && (
          <div className={cn(
            'flex items-start gap-3 p-3 rounded-xl text-sm border',
            result.success
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          )}>
            {result.success
              ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              : <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            }
            <span>{result.message}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            稍后激活
          </Button>
          <Button
            className="flex-1"
            loading={loading}
            disabled={!isFull}
            onClick={handleActivate}
          >
            <Zap size={15} />
            {loading ? '验证中…' : '立即激活'}
          </Button>
        </div>

        {/* Buy link hint */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            还没有激活码？
            <button
              className="text-primary-500 hover:underline ml-1"
              onClick={() => { onClose(); window.open('/activate', '_self') }}
            >
              查看购买方案 →
            </button>
          </p>
        </div>
      </div>
    </Modal>
  )
}
