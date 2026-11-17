import { formatNumber } from '../lib/utils'

interface TooltipEntry {
  name?: string | number
  value?: number | string
  color?: string
  dataKey?: string | number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  formatter?: (value: number) => string
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-[160px] animate-fade-in rounded-xl border border-line bg-surface/95 p-3 shadow-lift backdrop-blur">
      {label !== undefined && (
        <p className="mb-2 text-[10.5px] font-bold tracking-wider text-muted uppercase">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey ?? entry.name)}
            className="flex items-center justify-between gap-5 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted">
              <span
                className="size-2 rounded-full"
                style={{ background: entry.color ?? 'var(--brand)' }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-ink tabular-nums">
              {formatter
                ? formatter(Number(entry.value))
                : formatNumber(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
