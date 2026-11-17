import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useStore } from '../../store/store-context'
import { cn } from '../../lib/utils'

const variantStyles = {
  success: {
    icon: CheckCircle2,
    wrap: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10',
  },
  error: {
    icon: AlertTriangle,
    wrap: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-500/10',
  },
  info: {
    icon: Info,
    wrap: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-500/10',
  },
}

export function Toaster() {
  const { toasts, dismissToast } = useStore()

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant]
        const Icon = style.icon
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex animate-slide-in items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-lift"
          >
            <div className={cn('grid size-8 shrink-0 place-items-center rounded-xl', style.iconBg)}>
              <Icon className={cn('size-4.5', style.wrap)} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] font-semibold text-ink">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Fermer la notification"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
