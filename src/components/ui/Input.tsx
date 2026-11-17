import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FieldWrapper {
  label?: string
  hint?: string
  error?: string
  wrapperClassName?: string
  action?: ReactNode
}

const controlClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-muted/70 hover:border-line-strong focus:border-brand/60 focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60'

function FieldHeader({
  id,
  label,
  action,
}: FieldWrapper & { id: string }) {
  if (!label && !action) return null
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      {label && (
        <label htmlFor={id} className="text-[12.5px] font-semibold text-ink-soft">
          {label}
        </label>
      )}
      {action}
    </div>
  )
}

export function Input({
  label,
  hint,
  error,
  wrapperClassName,
  action,
  className,
  id,
  ...props
}: FieldWrapper & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={wrapperClassName}>
      <FieldHeader id={inputId} label={label} hint={hint} error={error} action={action} />
      <input
        id={inputId}
        className={cn(controlClass, 'h-10', error && 'border-rose-400 focus:border-rose-400', className)}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-[11.5px] font-medium text-rose-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Textarea({
  label,
  hint,
  error,
  wrapperClassName,
  action,
  className,
  id,
  ...props
}: FieldWrapper & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={wrapperClassName}>
      <FieldHeader id={inputId} label={label} hint={hint} error={error} action={action} />
      <textarea
        id={inputId}
        className={cn(controlClass, 'min-h-28 resize-y py-2.5 leading-relaxed', className)}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-[11.5px] font-medium text-rose-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Select({
  label,
  hint,
  error,
  wrapperClassName,
  action,
  className,
  id,
  children,
  ...props
}: FieldWrapper & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={wrapperClassName}>
      <FieldHeader id={inputId} label={label} hint={hint} error={error} action={action} />
      <div className="relative">
        <select
          id={inputId}
          className={cn(controlClass, 'h-10 cursor-pointer appearance-none pr-9', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
      </div>
      {error ? (
        <p className="mt-1.5 text-[11.5px] font-medium text-rose-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
