import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-linear-to-br from-brand to-violet-500 text-white shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:brightness-[1.06] active:scale-[0.98]',
  secondary:
    'border border-line bg-surface text-ink-soft shadow-sm hover:border-line-strong hover:bg-surface-2 active:scale-[0.98]',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
  danger:
    'bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 active:scale-[0.98]',
  soft: 'bg-brand-soft text-brand-strong hover:bg-brand/15',
}

const sizes: Record<Size, string> = {
  sm: 'h-8.5 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
  icon: 'size-9.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
