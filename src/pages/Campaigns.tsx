import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  Eye,
  Mail,
  MailX,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import { useStore } from '../store/store-context'
import { api, type EmailMessage } from '../lib/api'
import type { Campaign, CampaignStatus } from '../lib/types'
import {
  cn,
  formatDate,
  formatDateTime,
  formatNumber,
  percent,
} from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { CampaignStatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Progress } from '../components/ui/Progress'

const filterOrder: Array<CampaignStatus | 'all'> = [
  'all',
  'sending',
  'scheduled',
  'sent',
  'draft',
  'paused',
]

const filterLabels: Record<CampaignStatus | 'all', string> = {
  all: 'Toutes',
  sending: 'En cours',
  scheduled: 'Planifiées',
  sent: 'Envoyées',
  draft: 'Brouillons',
  paused: 'En pause',
}

export function Campaigns() {
  const {
    campaigns,
    lists,
    openComposer,
    duplicateCampaign,
    removeCampaign,
    toggleCampaignPause,
    sendCampaign,
    refreshCampaign,
    toast,
  } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CampaignStatus | 'all'>('all')
  const [sort, setSort] = useState<'recent' | 'open' | 'name'>('recent')
  const [detail, setDetail] = useState<Campaign | null>(null)
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const detailId = detail?.id
  const detailStatus = detail?.status

  useEffect(() => {
    if (!detailId) {
      setMessages([])
      return
    }
    let active = true
    setLoadingMessages(true)
    api.campaigns
      .messages(detailId)
      .then((data) => {
        if (active) setMessages(data)
      })
      .catch(() => {
        if (active) setMessages([])
      })
      .finally(() => {
        if (active) setLoadingMessages(false)
      })
    return () => {
      active = false
    }
  }, [detailId])

  // Rafraîchit la progression tant que la campagne est en cours d'envoi.
  useEffect(() => {
    if (!detailId || detailStatus !== 'sending') return
    let active = true
    let ticks = 0
    const maxTicks = 240 // ~10 min, garde-fou
    const tick = async () => {
      const [campaign, msgs] = await Promise.all([
        refreshCampaign(detailId),
        api.campaigns.messages(detailId).catch(() => [] as EmailMessage[]),
      ])
      if (!active) return
      setMessages(msgs)
      if (campaign) setDetail(campaign)
    }
    const interval = window.setInterval(() => {
      ticks += 1
      if (ticks > maxTicks) {
        window.clearInterval(interval)
        return
      }
      void tick()
    }, 2500)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [detailId, detailStatus, refreshCampaign])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const result = campaigns.filter((campaign) => {
      const matchesStatus = status === 'all' || campaign.status === status
      const matchesQuery =
        !term ||
        `${campaign.name} ${campaign.subject}`.toLowerCase().includes(term)
      return matchesStatus && matchesQuery
    })

    return [...result].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'fr')
      if (sort === 'open') return percent(b.opened, b.sent) - percent(a.opened, a.sent)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [campaigns, query, status, sort])

  const listName = (campaign: Campaign) => {
    const count = campaign.contactIds?.length ?? 0
    if (count > 0)
      return `${formatNumber(count)} contact${count > 1 ? 's' : ''} ciblé${count > 1 ? 's' : ''}`
    return lists.find((list) => list.id === campaign.audienceId)?.name ?? 'Tous les contacts'
  }

  const audienceCount = (campaign: Campaign) => {
    const count = campaign.contactIds?.length ?? 0
    if (count > 0) return count
    return lists.find((list) => list.id === campaign.audienceId)?.count ?? 0
  }

  const duplicate = async (campaign: Campaign) => {
    const ok = await duplicateCampaign(campaign.id)
    if (!ok) return
    toast('Campagne dupliquée', {
      description: `« ${campaign.name} » a été copiée en brouillon.`,
    })
  }

  const remove = async (campaign: Campaign) => {
    const ok = await removeCampaign(campaign.id)
    if (!ok) return
    toast('Campagne supprimée', {
      description: `« ${campaign.name} » a été retirée de votre espace.`,
      variant: 'info',
    })
  }

  const send = async (campaign: Campaign) => {
    const ok = await sendCampaign(campaign.id)
    if (!ok) return
    toast('Envoi lancé', {
      description: `« ${campaign.name} » est en cours d’envoi. Suivez la progression dans le détail.`,
    })
  }

  const detailSent = detail?.sent ?? 0
  const detailStats = detail
    ? [
        { label: 'Envoyés', value: formatNumber(detail.sent), hint: 'destinataires' },
        {
          label: 'Ouverts',
          value: formatNumber(detail.opened),
          hint: detail.sent ? `${percent(detail.opened, detail.sent).toFixed(1).replace('.', ',')} %` : '—',
        },
        { label: 'Rebonds', value: formatNumber(detail.bounced), hint: 'adresses invalides' },
        {
          label: 'Désabonnés',
          value: formatNumber(detail.unsubscribed),
          hint: 'sur cet envoi',
        },
      ]
    : []

  return (
    <div className="space-y-5">
      <PageHeader
        title="Campagnes"
        subtitle="Créez, planifiez et suivez toutes vos campagnes d’emailing depuis un seul endroit."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => openComposer()}>
            Nouvelle campagne
          </Button>
        }
      />

      <Card className="p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto [contain:paint]">
            {filterOrder.map((item) => {
              const count =
                item === 'all'
                  ? campaigns.length
                  : campaigns.filter((campaign) => campaign.status === item).length
              return (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition',
                    status === item
                      ? 'bg-brand text-white shadow-sm shadow-brand/25'
                      : 'text-muted hover:bg-surface-2 hover:text-ink'
                  )}
                >
                  {filterLabels[item]}
                  <span
                    className={cn(
                      'rounded-md px-1 py-px text-[9.5px] font-bold tabular-nums',
                      status === item ? 'bg-white/20' : 'bg-surface-2 text-muted'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-64">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une campagne…"
                className="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-[12.5px] text-ink transition outline-none placeholder:text-muted/70 hover:border-line-strong focus:border-brand/60 focus:ring-4 focus:ring-brand/10"
              />
            </div>
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              wrapperClassName="sm:w-44"
              aria-label="Trier les campagnes"
            >
              <option value="recent">Plus récentes</option>
              <option value="open">Meilleure ouverture</option>
              <option value="name">Nom (A–Z)</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <p className="text-[12.5px] font-bold text-ink">
            {filtered.length} campagne{filtered.length > 1 ? 's' : ''}
          </p>
          <p className="hidden text-[10.5px] text-muted sm:block">
            Cliquez sur une ligne pour voir les détails
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <span className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-muted">
              <MailX className="size-5" />
            </span>
            <p className="text-[13px] font-semibold text-ink">Aucune campagne trouvée</p>
            <p className="max-w-xs text-[11.5px] leading-relaxed text-muted">
              Essayez de modifier vos filtres ou créez une nouvelle campagne pour démarrer.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-1"
              icon={<Plus className="size-3.5" />}
              onClick={() => openComposer()}
            >
              Créer une campagne
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto [contain:paint]">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-[10px] font-bold tracking-wider text-muted uppercase">
                  <th className="px-4 py-2.5 font-bold sm:px-5">Campagne</th>
                  <th className="px-3 py-2.5 font-bold">Statut</th>
                  <th className="px-3 py-2.5 font-bold">Audience</th>
                  <th className="px-3 py-2.5 text-right font-bold">Envoyés</th>
                  <th className="px-3 py-2.5 text-right font-bold">Ouverture</th>
                  <th className="px-3 py-2.5 font-bold">Date</th>
                  <th className="px-4 py-2.5 text-right font-bold sm:px-5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((campaign) => (
                  <tr
                    key={campaign.id}
                    onClick={() => setDetail(campaign)}
                    className="group cursor-pointer border-b border-line/60 transition last:border-0 hover:bg-surface-2/50"
                  >
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8.5 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                          <Mail className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate text-[12.5px] font-semibold text-ink">
                            {campaign.name}
                          </p>
                          <p className="max-w-[280px] truncate text-[10.5px] text-muted">
                            {campaign.subject}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[11.5px] font-medium text-ink-soft">
                        {listName(campaign)}
                      </p>
                      <p className="text-[10px] text-muted">
                        {formatNumber(audienceCount(campaign))} contacts
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-[12px] font-semibold text-ink tabular-nums">
                        {campaign.sent ? formatNumber(campaign.sent) : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-[12px] font-semibold text-ink tabular-nums">
                        {campaign.sent
                          ? `${percent(campaign.opened, campaign.sent).toFixed(1).replace('.', ',')} %`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] text-muted">{formatDate(campaign.date)}</span>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center justify-end gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                        {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              send(campaign)
                            }}
                            aria-label="Envoyer maintenant"
                            title="Envoyer maintenant"
                            className="grid size-7.5 place-items-center rounded-lg text-muted transition hover:bg-brand/10 hover:text-brand"
                          >
                            <Send className="size-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            setDetail(campaign)
                          }}
                          aria-label="Voir les détails"
                          className="grid size-7.5 place-items-center rounded-lg text-muted transition hover:bg-surface-3 hover:text-ink"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            duplicate(campaign)
                          }}
                          aria-label="Dupliquer"
                          className="grid size-7.5 place-items-center rounded-lg text-muted transition hover:bg-surface-3 hover:text-ink"
                        >
                          <Copy className="size-3.5" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            remove(campaign)
                          }}
                          aria-label="Supprimer"
                          className="grid size-7.5 place-items-center rounded-lg text-muted transition hover:bg-rose-500/10 hover:text-rose-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        size="lg"
        title={detail?.name}
        description={detail?.subject}
        footer={
          <>
            {detail && (detail.status === 'draft' || detail.status === 'scheduled') && (
              <Button
                onClick={async () => {
                  const campaign = detail
                  const ok = await sendCampaign(campaign.id)
                  if (!ok) return
                  toast('Envoi lancé', {
                    description: `« ${campaign.name} » est en cours d’envoi.`,
                  })
                  setDetail({ ...campaign, status: 'sending' })
                }}
                icon={<Send className="size-4" />}
                className="sm:mr-auto"
              >
                Envoyer maintenant
              </Button>
            )}
            {detail && (detail.status === 'sending' || detail.status === 'paused') && (
              <Button
                variant="secondary"
                onClick={async () => {
                  const wasPaused = detail.status === 'paused'
                  const ok = await toggleCampaignPause(detail.id)
                  if (!ok) return
                  toast(wasPaused ? 'Campagne relancée' : 'Campagne mise en pause', {
                    description: detail.name,
                    variant: 'info',
                  })
                  setDetail(null)
                }}
                icon={
                  detail.status === 'paused' ? (
                    <Play className="size-4" />
                  ) : (
                    <Pause className="size-4" />
                  )
                }
                className="sm:mr-auto"
              >
                {detail.status === 'paused' ? 'Reprendre' : 'Mettre en pause'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setDetail(null)}>
              Fermer
            </Button>
            {detail && (
              <Button
                icon={<Copy className="size-4" />}
                onClick={() => {
                  duplicate(detail)
                  setDetail(null)
                }}
              >
                Dupliquer
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <CampaignStatusBadge status={detail.status} />
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-medium text-muted">
                <Users className="size-3" />
                {listName(detail)} · {formatNumber(audienceCount(detail))} contacts
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-medium text-muted">
                <CalendarClock className="size-3" />
                {detail.status === 'scheduled'
                  ? formatDateTime(detail.date)
                  : formatDate(detail.date)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {detailStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-line bg-surface-2/50 p-3"
                >
                  <p className="text-[10px] font-semibold text-muted">{stat.label}</p>
                  <p className="mt-1 text-[19px] leading-none font-extrabold tracking-tight text-ink tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[9.5px] text-muted">{stat.hint}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold text-ink">Entonnoir de performance</p>
                <span className="text-[10.5px] text-muted">
                  Base : {formatNumber(detailSent)} emails
                </span>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: 'Envoyés', value: detail.sent },
                  { label: 'Ouverts', value: detail.opened },
                ].map((step) => (
                  <div key={step.label}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-ink-soft">{step.label}</span>
                      <span className="font-semibold text-ink tabular-nums">
                        {formatNumber(step.value)}{' '}
                        <span className="text-muted">
                          ({detailSent ? percent(step.value, detailSent).toFixed(1).replace('.', ',') : 0} %)
                        </span>
                      </span>
                    </div>
                    <Progress
                      value={detailSent ? percent(step.value, detailSent) : 0}
                      size="md"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 rounded-xl border border-line bg-surface-2/40 p-3.5 text-[11.5px] sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Objet</p>
                <p className="mt-1 font-medium text-ink">{detail.subject}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
                  Expéditeur
                </p>
                <p className="mt-1 font-medium text-ink">
                  {detail.sender} · {detail.senderEmail || 'hello@aris.email'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
                  Délivrabilité
                </p>
                <p className="mt-1 inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Excellente (99,2 %)
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
                  Rebonds / désabonnements
                </p>
                <p className="mt-1 font-medium text-ink">
                  {formatNumber(detail.bounced)} rebonds · {formatNumber(detail.unsubscribed)}{' '}
                  désabonnés
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[12px] font-bold text-ink">Journal des envois</p>
                {messages.length > 0 && (
                  <span className="text-[10.5px] text-muted">
                    {formatNumber(messages.filter((m) => m.status === 'sent').length)} envoyés ·{' '}
                    {formatNumber(messages.filter((m) => m.status === 'failed').length)} échecs
                  </span>
                )}
              </div>
              {loadingMessages ? (
                <p className="text-[11.5px] text-muted">Chargement…</p>
              ) : messages.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line bg-surface-2/40 p-3 text-[11.5px] leading-relaxed text-muted">
                  Aucun envoi pour l’instant. Lancez la campagne pour voir apparaître chaque
                  destinataire ici.
                </p>
              ) : (
                <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-line">
                  {messages.map((message) => (
                    <li
                      key={message.id}
                      className="flex items-center justify-between gap-3 border-b border-line/60 px-3 py-2 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-medium text-ink">
                          {message.recipientName || message.recipient}
                        </p>
                        <p className="truncate text-[10px] text-muted">{message.recipient}</p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase',
                          message.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : message.status === 'failed'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-surface-2 text-muted'
                        )}
                        title={message.error ?? undefined}
                      >
                        {message.status === 'sent'
                          ? 'envoyé'
                          : message.status === 'failed'
                            ? 'échec'
                            : 'en attente'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
