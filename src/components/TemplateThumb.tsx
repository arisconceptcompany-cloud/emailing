import type { Template } from '../lib/types'
import { cn } from '../lib/utils'

function Line({
  width,
  className,
  large,
}: {
  width: string
  className?: string
  large?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-full bg-slate-200',
        large ? 'h-2' : 'h-1',
        className
      )}
      style={{ width }}
    />
  )
}

function Body({ template, large }: { template: Template; large?: boolean }) {
  const { accent, layout } = template
  const gradient = cn('bg-linear-to-br', accent)

  if (layout === 'welcome') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <div className={cn('rounded-full', large ? 'size-14' : 'size-9', gradient)} />
        <Line width="62%" className="mt-1 bg-slate-300" large={large} />
        <Line width="44%" large={large} />
        <Line width="52%" large={large} />
        <div className={cn('mt-2 rounded-full', large ? 'h-7 w-28' : 'h-4 w-16', gradient)} />
        <Line width="30%" className="mt-2 bg-slate-100" large={large} />
      </div>
    )
  }

  if (layout === 'promo') {
    return (
      <div className="flex h-full flex-col gap-2">
        <div className={cn('relative overflow-hidden rounded-lg p-3', gradient)}>
          <Line width="30%" className="bg-white/50" large={large} />
          <Line width="74%" className="mt-2 bg-white/95" large={large} />
          <Line width="48%" className="mt-1 bg-white/60" large={large} />
        </div>
        <div
          className={cn(
            'flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50',
            large ? 'h-12' : 'h-8'
          )}
        >
          <Line width="42%" className="bg-slate-400/60" large={large} />
        </div>
        <Line width="86%" large={large} />
        <Line width="70%" large={large} />
        <div className={cn('mt-auto w-full rounded-lg', large ? 'h-8' : 'h-5', gradient)} />
      </div>
    )
  }

  if (layout === 'event') {
    return (
      <div className="flex h-full gap-2.5">
        <div
          className={cn(
            'flex w-2/5 shrink-0 flex-col items-center justify-center gap-1 rounded-lg',
            gradient
          )}
        >
          <div className={cn('rounded-md bg-white/90', large ? 'size-9' : 'size-6')} />
          <Line width="46%" className="bg-white/80" large={large} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
          <Line width="34%" className="bg-slate-300" large={large} />
          <Line width="88%" className="mt-1 bg-slate-300" large={large} />
          <Line width="72%" large={large} />
          <Line width="80%" large={large} />
          <Line width="55%" large={large} />
          <div className={cn('mt-auto w-2/3 rounded-full', large ? 'h-6' : 'h-4', gradient)} />
        </div>
      </div>
    )
  }

  if (layout === 'product') {
    return (
      <div className="flex h-full flex-col gap-2">
        <div className={cn('flex-1 overflow-hidden rounded-lg', gradient)}>
          <div className="flex h-full items-end justify-end p-2">
            <div className={cn('rounded-md bg-white/30', large ? 'size-10' : 'size-7')} />
          </div>
        </div>
        <Line width="64%" className="mt-1 bg-slate-300" large={large} />
        <Line width="88%" large={large} />
        <div className="mt-auto flex items-center justify-between">
          <div className={cn('rounded-full', large ? 'h-6 w-20' : 'h-4 w-14', gradient)} />
          <Line width="20%" large={large} />
        </div>
      </div>
    )
  }

  if (layout === 'minimal') {
    return (
      <div className="flex h-full flex-col gap-2.5 py-2">
        <div className={cn('rounded-full', large ? 'h-2 w-14' : 'h-1.5 w-10', gradient)} />
        <Line width="72%" className="mt-2 bg-slate-300" large={large} />
        <Line width="92%" large={large} />
        <Line width="84%" large={large} />
        <Line width="88%" large={large} />
        <Line width="46%" large={large} />
        <div className="mt-auto flex flex-col gap-1.5">
          <Line width="38%" className="bg-slate-300" large={large} />
          <Line width="26%" large={large} />
        </div>
      </div>
    )
  }

  // newsletter
  return (
    <div className="flex h-full flex-col gap-2">
      <div className={cn('relative overflow-hidden rounded-lg p-3', gradient)}>
        <Line width="26%" className="bg-white/50" large={large} />
        <Line width="76%" className="mt-2 bg-white/95" large={large} />
        <Line width="52%" className="mt-1 bg-white/60" large={large} />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        <div className="rounded-md bg-slate-100" />
        <div className="space-y-1.5 py-1">
          <Line width="88%" className="bg-slate-300" large={large} />
          <Line width="72%" large={large} />
          <Line width="80%" large={large} />
          <Line width="50%" large={large} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Line width="30%" large={large} />
        <div className={cn('rounded-full', large ? 'h-6 w-20' : 'h-4 w-14', gradient)} />
      </div>
    </div>
  )
}

interface TemplateThumbProps {
  template: Template
  className?: string
  large?: boolean
  chrome?: boolean
}

export function TemplateThumb({
  template,
  className,
  large,
  chrome = true,
}: TemplateThumbProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10',
        className
      )}
    >
      <div className="flex h-full w-full flex-col bg-white">
        {chrome && (
          <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 px-2.5 py-2">
            <span className="size-1.5 rounded-full bg-rose-400" />
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <div className="ml-2 h-1 w-14 rounded-full bg-slate-200" />
          </div>
        )}
        <div className={cn('min-h-0 flex-1 overflow-hidden', large ? 'p-6' : 'p-3')}>
          <Body template={template} large={large} />
        </div>
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-3 py-2">
          <div className="h-1 w-12 rounded-full bg-slate-200" />
          <div className="h-1 w-6 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  )
}
