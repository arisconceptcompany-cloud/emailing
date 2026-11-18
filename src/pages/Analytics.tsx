import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  MailOpen,
  TrendingUp,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '../store/store-context'
import {
  deviceData,
  funnelData,
  hourlyData,
  weeklySeries,
} from '../lib/data'
import {
  cn,
  formatCompact,
  formatNumber,
  formatPercent,
  percent,
} from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { ChartTooltip } from '../components/ChartTooltip'

function AnalyticsKpi({
  label,
  value,
  delta,
  trend,
  good = true,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  good?: boolean
  icon: typeof MailOpen
  tone: string
}) {
  return (
    <Card className="card-sheen p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted">{label}</p>
          <p className="mt-1.5 text-[23px] leading-none font-extrabold tracking-tight text-ink tabular-nums">
            {value}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px]">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold',
                good
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              )}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {delta}
            </span>
            <span className="text-muted">vs période précédente</span>
          </div>
        </div>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', tone)}>
          <Icon className="size-4" />
        </span>
      </div>
    </Card>
  )
}

interface AnalyticsTooltipEntry {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
}

function AnalyticsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: AnalyticsTooltipEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[170px] rounded-xl border border-line bg-surface/95 p-3 shadow-lift backdrop-blur">
      {label && (
        <p className="mb-2 text-[10.5px] font-bold tracking-wider text-muted uppercase">
          Semaine du {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey)}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted">
              <span
                className="size-2 rounded-full"
                style={{ background: entry.color ?? 'var(--brand)' }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-ink tabular-nums">
              {entry.dataKey === 'openRate'
                ? formatPercent(Number(entry.value))
                : formatNumber(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Analytics() {
  const { campaigns, toast } = useStore()
  const [period, setPeriod] = useState<'4' | '8' | '12'>('12')
  const weeks = Number(period)
  const chartData = weeklySeries.slice(-weeks)

  const topCampaigns = useMemo(
    () =>
      [...campaigns]
        .filter((campaign) => campaign.sent > 0)
        .sort((a, b) => percent(b.opened, b.sent) - percent(a.opened, a.sent))
        .slice(0, 4),
    [campaigns]
  )

  const maxHour = Math.max(...hourlyData.map((hour) => hour.value))
  const peakHour = hourlyData.find((hour) => hour.value === maxHour)?.hour

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analyses"
        subtitle="Comprenez ce qui fonctionne : ouvertures, appareils et meilleurs moments d’envoi."
        actions={
          <>
            <Select
              value={period}
              onChange={(event) => setPeriod(event.target.value as typeof period)}
              wrapperClassName="w-[188px]"
              aria-label="Période d’analyse"
            >
              <option value="4">4 dernières semaines</option>
              <option value="8">8 dernières semaines</option>
              <option value="12">12 dernières semaines</option>
            </Select>
            <Button
              variant="secondary"
              icon={<Download className="size-4" />}
              onClick={() =>
                toast('Rapport en préparation', {
                  description: 'Votre export PDF sera disponible dans quelques instants.',
                  variant: 'info',
                })
              }
            >
              Exporter
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <AnalyticsKpi
          label="Taux d’ouverture"
          value="47,9 %"
          delta="+3,2 pts"
          trend="up"
          icon={MailOpen}
          tone="bg-brand-soft text-brand-strong"
        />
        <AnalyticsKpi
          label="Taux de rebond"
          value="0,9 %"
          delta="-0,2 pt"
          trend="down"
          good
          icon={AlertTriangle}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-4 sm:p-5 xl:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[14px] font-bold tracking-tight text-ink">
                Volume et engagement
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                Emails envoyés et taux d’ouverture par semaine
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" /> Tendance positive
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-muted">
              <span className="size-2 rounded-sm bg-[#6d5dfc]" /> Emails envoyés
            </span>
            <span className="flex items-center gap-1.5 font-medium text-muted">
              <span className="size-2 rounded-full bg-[#22d3ee]" /> Taux d’ouverture
            </span>
          </div>

          <div className="mt-2 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#8b7dff" stopOpacity={0.45} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted)', fontSize: 10.5 }}
                  interval="preserveStartEnd"
                  minTickGap={16}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fill: 'var(--muted)', fontSize: 10.5 }}
                  tickFormatter={(value: number) => formatCompact(value)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  domain={[0, 60]}
                  tick={{ fill: 'var(--muted)', fontSize: 10.5 }}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip
                  content={<AnalyticsTooltip />}
                  cursor={{ fill: 'var(--surface-2)', opacity: 0.6 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="sent"
                  name="Emails envoyés"
                  fill="url(#barFill)"
                  radius={[5, 5, 0, 0]}
                  barSize={weeks > 8 ? 18 : 30}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="openRate"
                  name="Taux d’ouverture"
                  stroke="#22d3ee"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-[14px] font-bold tracking-tight text-ink">Appareils</p>
          <p className="mt-0.5 text-[11.5px] text-muted">Répartition des ouvertures</p>
          <div className="relative mx-auto mt-2 h-[184px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={4}
                  stroke="none"
                >
                  {deviceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-[22px] leading-none font-extrabold tracking-tight text-ink">
                  54 %
                </p>
                <p className="mt-1 text-[9.5px] font-medium tracking-wide text-muted uppercase">
                  sur mobile
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {deviceData.map((device) => (
              <div key={device.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2 text-muted">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: device.color }}
                  />
                  {device.name}
                </span>
                <span className="font-semibold text-ink tabular-nums">{device.value} %</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-tight text-ink">
                Entonnoir de conversion
              </p>
              <p className="mt-0.5 text-[11px] text-muted">Sur les 30 derniers jours</p>
            </div>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-strong">
              3 % de conversion
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {funnelData.map((step, index) => {
              const base = funnelData[0].value
              const value = percent(step.value, base)
              return (
                <div key={step.label}>
                  <div className="mb-1 flex items-center justify-between text-[10.5px]">
                    <span className="font-medium text-ink-soft">{step.label}</span>
                    <span className="font-semibold text-ink tabular-nums">
                      {formatNumber(step.value)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={cn('h-full rounded-full bg-linear-to-r', step.color)}
                      style={{ width: `${Math.max(3, value)}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[9px] text-muted">
                    {index === 0 ? '100 %' : `${value.toFixed(1).replace('.', ',')} % des envois`}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-tight text-ink">Meilleures heures</p>
              <p className="mt-0.5 text-[11px] text-muted">Ouvertures par heure de la journée</p>
            </div>
            <CalendarDays className="size-4 text-muted" />
          </div>
          <div className="mt-3 h-[164px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'var(--surface-2)', opacity: 0.6 }}
                />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  interval={5}
                  tick={{ fill: 'var(--muted)', fontSize: 9 }}
                />
                <Bar dataKey="value" name="Ouvertures" radius={[3, 3, 0, 0]}>
                  {hourlyData.map((hour) => (
                    <Cell
                      key={hour.hour}
                      fill={hour.value === maxHour ? '#6d5dfc' : '#8b7dff'}
                      fillOpacity={hour.value === maxHour ? 1 : 0.28}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[10px] text-muted">
            Pic d’activité à{' '}
            <span className="font-bold text-ink">{peakHour}</span> — planifiez vos envois juste
            avant.
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-[13px] font-bold tracking-tight text-ink">
              Campagnes les plus performantes
            </p>
            <p className="mt-0.5 text-[11px] text-muted">Classées par taux d’ouverture</p>
          </div>
          <span className="hidden rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted sm:block">
            Top {topCampaigns.length}
          </span>
        </div>
        <div className="overflow-x-auto [contain:paint]">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-y border-line bg-surface-2/60 text-[10px] font-bold tracking-wider text-muted uppercase">
                <th className="px-4 py-2 font-bold sm:px-5">#</th>
                <th className="px-3 py-2 font-bold">Campagne</th>
                <th className="px-3 py-2 text-right font-bold">Envoyés</th>
                <th className="px-3 py-2 text-right font-bold">Ouverture</th>
              </tr>
            </thead>
            <tbody>
              {topCampaigns.map((campaign, index) => (
                <tr
                  key={campaign.id}
                  className="border-b border-line/60 last:border-0 hover:bg-surface-2/50"
                >
                  <td className="px-4 py-2.5 sm:px-5">
                    <span
                      className={cn(
                        'grid size-5 place-items-center rounded-md text-[9.5px] font-bold',
                        index === 0
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-surface-2 text-muted'
                      )}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="max-w-[320px] truncate text-[12px] font-semibold text-ink">
                      {campaign.name}
                    </p>
                    <p className="max-w-[320px] truncate text-[10px] text-muted">
                      {campaign.subject}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-right text-[11.5px] font-medium text-ink-soft tabular-nums">
                    {formatNumber(campaign.sent)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                      {percent(campaign.opened, campaign.sent).toFixed(1).replace('.', ',')} %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
