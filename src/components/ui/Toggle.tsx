import { cn } from '../../lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: ToggleProps) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-surface-3'
      )}
    >
      <span
        className={cn(
          'inline-block size-4.5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  )

  if (!label && !description) return <span className={className}>{control}</span>

  return (
    <div className={cn('flex items-start justify-between gap-6', className)}>
      <div className="min-w-0">
        {label && <p className="text-sm font-semibold text-ink">{label}</p>}
        {description && (
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {control}
    </div>
  )
}
