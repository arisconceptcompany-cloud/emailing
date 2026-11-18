import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, MailOpen, Send, UserMinus } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '../store/store-context'
import { cn, formatNumber, percent } from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Select } from '../components/ui/Input'
import { ChartTooltip } from '../components/ChartTooltip'

function AnalyticsKpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  hint: string
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
          <p className="mt-2 text-[10.5px] text-muted">{hint}</p>
        </div>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', tone)}>
          <Icon className="size-4" />
        </span>
      </div>
    </Card>
  )
}

export function Analytics() {
  const { campaigns } = useStore()
  const [limit, setLimit] = useState<'5' | '10' | '20' | 'all'>('10')

  // Uniquement les campagnes réellement envoyées : aucune donnée de démo.
  const sentCampaigns = useMemo(
    () =>
      [...campaigns]
        .filter((campaign) => campaign.sent > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [campaigns]
  )

  const visible = useMemo(
    () => (limit === 'all' ? sentCampaigns : sentCampaigns.slice(0, Number(limit))),
    [sentCampaigns, limit]
  )

  const totals = useMemo(
    () =>
      visible.reduce(
        (acc, campaign) => ({
          sent: acc.sent + campaign.sent,
          opened: acc.opened + campaign.opened,
          bounced: acc.bounced + campaign.bounced,
          unsubscribed: acc.unsubscribed + campaign.unsubscribed,
        }),
        { sent: 0, opened: 0, bounced: 0, unsubscribed: 0 }
      ),
    [visible]
  )

  // Ordre chronologique pour le graphique.
  const chartData = useMemo(
    () =>
      [...visible]
        .reverse()
        .map((campaign) => ({
          label: campaign.name,
          envoyes: campaign.sent,
          ouverts: campaign.opened,
        })),
    [visible]
  )

  const topCampaigns = useMemo(
    () =>
      [...visible]
        .sort((a, b) => percent(b.opened, b.sent) - percent(a.opened, a.sent))
        .slice(0, 5),
    [visible]
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analyses"
        subtitle="Statistiques réelles de vos campagnes : envois, ouvertures, rebonds et désabonnements."
        actions={
          <Select
            value={limit}
            onChange={(event) => setLimit(event.target.value as typeof limit)}
            wrapperClassName="w-[188px]"
            aria-label="Période d’analyse"
          >
            <option value="5">5 dernières campagnes</option>
            <option value="10">10 dernières campagnes</option>
            <option value="20">20 dernières campagnes</option>
            <option value="all">Toutes les campagnes</option>
          </Select>
        }
      />

      {sentCampaigns.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[13px] font-bold text-ink">Aucune campagne envoyée pour l’instant</p>
          <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-relaxed text-muted">
            Les statistiques apparaîtront ici dès votre premier envoi. Créez une campagne et
            lancez-la pour suivre les ouvertures, les rebonds et les désabonnements.
          </p>
          <Link
            to="/campagnes"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-brand-strong"
          >
            <Send className="size-3.5" />
            Aller aux campagnes
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <AnalyticsKpi
              label="Emails envoyés"
              value={formatNumber(totals.sent)}
              hint={`${formatNumber(visible.length)} campagne${visible.length > 1 ? 's' : ''}`}
              icon={Send}
              tone="bg-brand-soft text-brand-strong"
            />
            <AnalyticsKpi
              label="Taux d’ouverture"
              value={totals.sent ? `${percent(totals.opened, totals.sent).toFixed(1).replace('.', ',')} %` : '—'}
              hint={`${formatNumber(totals.opened)} ouverture${totals.opened > 1 ? 's' : ''}`}
              icon={MailOpen}
              tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            />
            <AnalyticsKpi
              label="Rebonds"
              value={formatNumber(totals.bounced)}
              hint={totals.sent ? `${percent(totals.bounced, totals.sent).toFixed(1).replace('.', ',')} % des envois` : '—'}
              icon={AlertTriangle}
              tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
            <AnalyticsKpi
              label="Désabonnés"
              value={formatNumber(totals.unsubscribed)}
              hint={totals.sent ? `${percent(totals.unsubscribed, totals.sent).toFixed(1).replace('.', ',')} % des envois` : '—'}
              icon={UserMinus}
              tone="bg-rose-500/10 text-rose-600 dark:text-rose-400"
            />
          </div>

          <Card className="p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[14px] font-bold tracking-tight text-ink">
                  Volume et engagement
                </p>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Emails envoyés et ouverts, campagne par campagne
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-muted">
                <span className="size-2 rounded-sm bg-[#6d5dfc]" /> Emails envoyés
              </span>
              <span className="flex items-center gap-1.5 font-medium text-muted">
                <span className="size-2 rounded-sm bg-[#22d3ee]" /> Emails ouverts
              </span>
            </div>

            <div className="mt-2 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted)', fontSize: 10 }}
                    interval={0}
                    tickFormatter={(value: string) =>
                      value.length > 16 ? `${value.slice(0, 15)}…` : value
                    }
                    dy={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    allowDecimals={false}
                    tick={{ fill: 'var(--muted)', fontSize: 10.5 }}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'var(--surface-2)', opacity: 0.6 }}
                  />
                  <Bar
                    dataKey="envoyes"
                    name="Emails envoyés"
                    fill="#6d5dfc"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="ouverts"
                    name="Emails ouverts"
                    fill="#22d3ee"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

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
                    <th className="px-3 py-2 text-right font-bold">Ouverts</th>
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
                      <td className="px-3 py-2.5 text-right text-[11.5px] font-medium text-ink-soft tabular-nums">
                        {formatNumber(campaign.opened)}
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
        </>
      )}
    </div>
  )
}
