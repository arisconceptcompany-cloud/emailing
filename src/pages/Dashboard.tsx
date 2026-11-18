import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  LayoutTemplate,
  MailOpen,
  Send,
  Sparkles,
  Target,
  UserPlus,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '../store/store-context'
import { api, type OverviewStats } from '../lib/api'
import {
  kpiSparklines,
  monthlyGoal,
  performanceSeries,
  recentActivity,
} from '../lib/data'
import type { Campaign } from '../lib/types'
import {
  cn,
  countdown,
  formatCompact,
  formatNumber,
  formatPercent,
  percent,
  relativeTime,
} from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { Progress } from '../components/ui/Progress'
import { CampaignStatusBadge } from '../components/ui/Badge'
import { ChartTooltip } from '../components/ChartTooltip'

interface StatCardProps {
  label: string
  value: string
  delta: string
  deltaLabel: string
  icon: typeof Send
  tone: string
  trend: 'up' | 'down'
  good?: boolean
  spark: number[]
  sparkColor: string
  delay: number
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const gradientId = useId().replace(/:/g, '')
  const width = 92
  const height = 34
  const min = Math.min(...values)
  const max = Math.max(...values)
  const points = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * width
    const y = height - 3 - ((value - min) / Math.max(1, max - min)) * (height - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-[92px] overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points.join(' ')} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  tone,
  trend,
  good = true,
  spark,
  sparkColor,
  delay,
}: StatCardProps) {
  return (
    <Card
      className="card-sheen animate-fade-up overflow-hidden p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold text-muted">{label}</p>
          <p className="mt-1.5 text-[24px] leading-none font-extrabold tracking-tight text-ink tabular-nums">
            {value}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10.5px]">
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
            <span className="text-muted">{deltaLabel}</span>
          </div>
        </div>
        <span
          className={cn(
            'grid size-9.5 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-lg',
            tone
          )}
        >
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <Sparkline values={spark} color={sparkColor} />
        <span className="pb-1 text-[9px] font-medium tracking-wider text-muted/70 uppercase">
          30 derniers jours
        </span>
      </div>
    </Card>
  )
}

const activityIcon = {
  send: { icon: Send, tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  contact: {
    icon: UserPlus,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  template: {
    icon: LayoutTemplate,
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  alert: {
    icon: AlertTriangle,
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
}

const ranges = [
  { id: '30j', label: '30 jours' },
  { id: '90j', label: '90 jours' },
  { id: '12m', label: '12 mois' },
] as const

function UpcomingCampaign({ campaign }: { campaign: Campaign }) {
  const date = new Date(campaign.date)
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 transition hover:border-line-strong hover:bg-surface-2/60">
      <div className="flex w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-soft py-1.5">
        <span className="text-[14px] leading-none font-extrabold text-brand-strong">
          {date.getDate()}
        </span>
        <span className="mt-0.5 text-[8.5px] font-bold tracking-wide text-brand-strong/80 uppercase">
          {date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11.5px] font-semibold text-ink">{campaign.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
          <CalendarDays className="size-2.5" />
          {countdown(campaign.date)} ·{' '}
          {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { campaigns, openComposer, settings } = useStore()
  const greetingName = settings?.firstName?.trim() || 'Awa'
  const [range, setRange] = useState<(typeof ranges)[number]['id']>('30j')
  const [stats, setStats] = useState<OverviewStats | null>(null)

  useEffect(() => {
    let active = true
    api.stats
      .overview()
      .then((data) => {
        if (active) setStats(data)
      })
      .catch(() => {
        /* les KPI retombent sur les valeurs de démonstration */
      })
    return () => {
      active = false
    }
  }, [])

  const data = performanceSeries[range]
  const goalPct = (monthlyGoal.current / monthlyGoal.target) * 100
  const scheduled = campaigns
    .filter((campaign) => campaign.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const recent = campaigns.slice(0, 5)
  const today = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  const totals = data.reduce(
    (acc, point) => ({
      sent: acc.sent + point.sent,
      opened: acc.opened + point.opened,
    }),
    { sent: 0, opened: 0 }
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span>
            Bonjour, {greetingName} <span className="inline-block">👋</span>
          </span>
        }
        subtitle={`Nous sommes le ${today}. Voici ce qui se passe dans votre espace emailing.`}
        actions={
          <>
            <Select
              value={range}
              onChange={(event) => setRange(event.target.value as typeof range)}
              wrapperClassName="w-[148px]"
              aria-label="Période"
            >
              <option value="30j">30 derniers jours</option>
              <option value="90j">90 derniers jours</option>
              <option value="12m">12 derniers mois</option>
            </Select>
            <Button icon={<Sparkles className="size-4" />} onClick={() => openComposer()}>
              Nouvelle campagne
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Emails envoyés"
          value={stats ? formatNumber(stats.campaigns.sent) : '128 940'}
          delta="+12,4 %"
          deltaLabel="vs mois dernier"
          icon={Send}
          tone="from-indigo-500 to-violet-500 shadow-indigo-500/30"
          trend="up"
          spark={kpiSparklines.sent}
          sparkColor="#6d5dfc"
          delay={0}
        />
        <StatCard
          label="Taux d’ouverture"
          value={stats ? formatPercent(stats.campaigns.openRate) : '47,9 %'}
          delta="+3,2 pts"
          deltaLabel="vs mois dernier"
          icon={MailOpen}
          tone="from-sky-500 to-cyan-400 shadow-sky-500/30"
          trend="up"
          spark={kpiSparklines.open}
          sparkColor="#0ea5e9"
          delay={60}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-4 sm:p-5 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[14px] font-bold tracking-tight text-ink">
                Performance des envois
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                {formatNumber(totals.sent)} emails envoyés ·{' '}
                {formatNumber(totals.opened)} ouverts sur la période
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-2 p-0.5">
              {ranges.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRange(item.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition',
                    range === item.id
                      ? 'bg-surface text-ink shadow-sm'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-muted">
              <span className="size-2 rounded-full bg-[#6d5dfc]" /> Envoyés
            </span>
            <span className="flex items-center gap-1.5 font-medium text-muted">
              <span className="size-2 rounded-full bg-[#22d3ee]" /> Ouverts
            </span>
            <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {totals.sent ? `${((totals.opened / totals.sent) * 100).toFixed(1).replace('.', ',')} % d’ouverture` : '—'}
            </span>
          </div>

          <div className="mt-2 h-[250px] w-full sm:h-[276px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 12, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6d5dfc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="openedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted)', fontSize: 10.5 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: 'var(--muted)', fontSize: 10.5 }}
                  tickFormatter={(value: number) => formatCompact(value)}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'var(--line-strong)', strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  name="Envoyés"
                  stroke="#6d5dfc"
                  strokeWidth={2.2}
                  fill="url(#sentFill)"
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="opened"
                  name="Ouverts"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#openedFill)"
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Card className="card-sheen p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-bold tracking-tight text-ink">Objectif du mois</p>
                <p className="mt-0.5 text-[11px] text-muted">Emails envoyés en novembre</p>
              </div>
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                <Target className="size-4" />
              </span>
            </div>

            <div className="relative mx-auto mt-3 size-[136px]">
              <svg viewBox="0 0 128 128" className="size-full -rotate-90">
                <defs>
                  <linearGradient id="goalGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="var(--surface-3)"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="url(#goalGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(goalPct / 100) * 339.29} 339.29`}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-[26px] leading-none font-extrabold tracking-tight text-ink">
                    {Math.round(goalPct)} %
                  </p>
                  <p className="mt-1 text-[9.5px] font-medium tracking-wide text-muted uppercase">
                    de l’objectif
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10.5px]">
              <span className="font-semibold text-ink">{formatNumber(monthlyGoal.current)}</span>
              <span className="text-muted">/ {formatNumber(monthlyGoal.target)}</span>
            </div>
            <Progress value={goalPct} className="mt-1.5" />
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
              Encore{' '}
              <span className="font-semibold text-ink">
                {formatNumber(monthlyGoal.target - monthlyGoal.current)}
              </span>{' '}
              emails pour atteindre l’objectif.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold tracking-tight text-ink">Prochaines campagnes</p>
              <Link
                to="/campagnes"
                className="flex items-center gap-0.5 text-[10.5px] font-semibold text-brand hover:text-brand-strong"
              >
                Voir tout <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {scheduled.length ? (
                scheduled.slice(0, 2).map((campaign) => (
                  <UpcomingCampaign key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-line p-4 text-center text-[11px] text-muted">
                  Aucune campagne planifiée.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
            <div>
              <p className="text-[13px] font-bold tracking-tight text-ink">Campagnes récentes</p>
              <p className="mt-0.5 text-[11px] text-muted">Vos derniers envois et brouillons</p>
            </div>
            <Link
              to="/campagnes"
              className="flex items-center gap-0.5 text-[10.5px] font-semibold text-brand hover:text-brand-strong"
            >
              Tout voir <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="overflow-x-auto [contain:paint]">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line bg-surface-2/60 text-[10px] font-bold tracking-wider text-muted uppercase">
                  <th className="px-4 py-2 font-bold sm:px-5">Campagne</th>
                  <th className="px-3 py-2 font-bold">Statut</th>
                  <th className="px-3 py-2 text-right font-bold">Ouverture</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="group border-b border-line/60 transition last:border-0 hover:bg-surface-2/50"
                  >
                    <td className="px-4 py-2.5 sm:px-5">
                      <Link to="/campagnes" className="block min-w-0">
                        <p className="max-w-[300px] truncate text-[12px] font-semibold text-ink group-hover:text-brand-strong">
                          {campaign.name}
                        </p>
                        <p className="max-w-[300px] truncate text-[10.5px] text-muted">
                          {campaign.subject}
                        </p>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] font-semibold text-ink tabular-nums">
                        {campaign.sent
                          ? `${percent(campaign.opened, campaign.sent).toFixed(1).replace('.', ',')} %`
                          : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold tracking-tight text-ink">Activité récente</p>
            <span className="flex items-center gap-1 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> En direct
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {recentActivity.map((activity) => {
              const meta = activityIcon[activity.type]
              const Icon = meta.icon
              return (
                <div key={activity.id} className="flex gap-2.5">
                  <span
                    className={cn(
                      'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg',
                      meta.tone
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] leading-snug font-semibold text-ink">
                      {activity.title}
                    </p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
                      {activity.meta}
                    </p>
                    <p className="mt-0.5 text-[9.5px] text-muted/70">
                      {relativeTime(activity.time)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
