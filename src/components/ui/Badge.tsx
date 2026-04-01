import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  default: 'bg-gray-50 text-gray-700 border border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      variantMap[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function StatusDot({ variant }: { variant: BadgeVariant }) {
  const colorMap: Record<BadgeVariant, string> = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-400',
    purple: 'bg-purple-500',
  }
  return <span className={cn('w-2 h-2 rounded-full inline-block', colorMap[variant])} />
}
