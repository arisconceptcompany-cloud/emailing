import type { CampaignStatus, ContactStatus } from './types'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const numberFormatter = new Intl.NumberFormat('fr-FR')

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
    .format(value)
    .replace('K', 'k')
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits).replace('.', ',')} %`
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function relativeTime(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const minutes = Math.round(diff / 60000)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)

  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  if (hours < 24) return `il y a ${hours} h`
  if (days === 1) return 'hier'
  if (days < 30) return `il y a ${days} jours`
  return formatDate(iso)
}

export function countdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (diff < 0) return 'Passée'
  if (days <= 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  return `Dans ${days} jours`
}

export function percent(part: number, total: number) {
  if (!total) return 0
  return (part / total) * 100
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export const avatarGradients = [
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-400',
  'from-rose-500 to-pink-500',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-fuchsia-500 to-purple-500',
  'from-blue-500 to-indigo-400',
  'from-teal-500 to-emerald-400',
]

export function avatarGradient(name: string) {
  const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return avatarGradients[sum % avatarGradients.length]
}

export function toDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface StatusMeta {
  label: string
  badge: string
  dot: string
}

export const campaignStatusMeta: Record<CampaignStatus, StatusMeta> = {
  draft: {
    label: 'Brouillon',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20',
    dot: 'bg-slate-400',
  },
  scheduled: {
    label: 'Planifiée',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-violet-500/25',
    dot: 'bg-violet-500',
  },
  sending: {
    label: 'En cours',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 ring-sky-500/25',
    dot: 'bg-sky-500 animate-pulse',
  },
  sent: {
    label: 'Envoyée',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  paused: {
    label: 'En pause',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-amber-500/25',
    dot: 'bg-amber-500',
  },
}

export const contactStatusMeta: Record<ContactStatus, StatusMeta> = {
  active: {
    label: 'Actif',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  unsubscribed: {
    label: 'Désabonné',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20',
    dot: 'bg-slate-400',
  },
  bounced: {
    label: 'Rebond',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 ring-rose-500/25',
    dot: 'bg-rose-500',
  },
}
