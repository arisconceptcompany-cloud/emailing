import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const sizes: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  '2xl': 'sm:max-w-5xl',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
  className?: string
  bodyClassName?: string
  hideClose?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  bodyClassName,
  hideClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 flex max-h-[92dvh] w-full animate-scale-in flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-lift sm:rounded-2xl',
          sizes[size],
          className
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-base font-bold tracking-tight text-ink sm:text-lg">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-4.5" />
              </button>
            )}
          </div>
        )}
        <div className={cn('flex-1 overflow-y-auto px-5 py-5 sm:px-6', bodyClassName)}>
          {children}
        </div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-2/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
