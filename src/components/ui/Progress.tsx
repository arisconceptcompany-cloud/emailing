import { cn } from '../../lib/utils'

interface ProgressProps {
  value: number
  className?: string
  barClassName?: string
  size?: 'sm' | 'md'
}

export function Progress({ value, className, barClassName, size = 'sm' }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-3',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full bg-linear-to-r from-brand to-violet-400 transition-[width] duration-700 ease-out',
          barClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
