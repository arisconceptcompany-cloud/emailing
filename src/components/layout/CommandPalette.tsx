import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  Mail,
  Search,
  Send,
  Settings,
  Users,
} from 'lucide-react'
import { useStore } from '../../store/store-context'
import { cn } from '../../lib/utils'

interface CommandItem {
  id: string
  title: string
  subtitle: string
  category: string
  icon: typeof Mail
  to: string
}

const pages: CommandItem[] = [
  {
    id: 'page-dashboard',
    title: 'Tableau de bord',
    subtitle: 'Vue d’ensemble des performances',
    category: 'Pages',
    icon: LayoutDashboard,
    to: '/',
  },
  {
    id: 'page-campaigns',
    title: 'Campagnes',
    subtitle: 'Créer et suivre vos envois',
    category: 'Pages',
    icon: Send,
    to: '/campagnes',
  },
  {
    id: 'page-contacts',
    title: 'Contacts',
    subtitle: 'Gérer vos audiences et vos listes',
    category: 'Pages',
    icon: Users,
    to: '/contacts',
  },
  {
    id: 'page-templates',
    title: 'Modèles',
    subtitle: 'Bibliothèque de designs d’emails',
    category: 'Pages',
    icon: LayoutTemplate,
    to: '/modeles',
  },
  {
    id: 'page-analytics',
    title: 'Analyses',
    subtitle: 'Ouvertures et conversions',
    category: 'Pages',
    icon: BarChart3,
    to: '/analyses',
  },
  {
    id: 'page-settings',
    title: 'Paramètres',
    subtitle: 'Compte, expéditeur et domaine',
    category: 'Pages',
    icon: Settings,
    to: '/parametres',
  },
  {
    id: 'page-help',
    title: 'Aide & support',
    subtitle: 'Guides et contact de l’équipe',
    category: 'Pages',
    icon: LifeBuoy,
    to: '/aide',
  },
]

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { campaigns, contacts, templates } = useStore()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  const items = useMemo(() => {
    const all: CommandItem[] = [
      ...pages,
      ...campaigns.map((campaign) => ({
        id: `campaign-${campaign.id}`,
        title: campaign.name,
        subtitle: campaign.subject,
        category: 'Campagnes',
        icon: Send,
        to: '/campagnes',
      })),
      ...contacts.slice(0, 14).map((contact) => ({
        id: `contact-${contact.id}`,
        title: contact.name,
        subtitle: contact.email,
        category: 'Contacts',
        icon: Users,
        to: '/contacts',
      })),
      ...templates.map((template) => ({
        id: `template-${template.id}`,
        title: template.name,
        subtitle: `${template.category} · ${template.usage} utilisations`,
        category: 'Modèles',
        icon: FileText,
        to: '/modeles',
      })),
    ]

    const term = query.trim().toLowerCase()
    if (!term) return all.slice(0, 16)
    return all
      .filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(term))
      .slice(0, 16)
  }, [query, campaigns, contacts, templates])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const grouped = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? []
    acc[item.category].push(item)
    return acc
  }, {})

  const select = (item?: CommandItem) => {
    if (!item) return
    onClose()
    navigate(item.to)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % Math.max(1, items.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(
        (current) => (current - 1 + Math.max(1, items.length)) % Math.max(1, items.length)
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      select(items[active])
    }
  }

  let index = -1

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[9vh] sm:pt-[12vh]">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4.5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Rechercher une page, une campagne, un contact…"
            className="h-13 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
          />
          <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            Échap
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-10 text-center">
              <Search className="size-5 text-muted/60" />
              <p className="text-[13px] font-semibold text-ink">Aucun résultat</p>
              <p className="text-[11.5px] text-muted">Essayez un autre mot-clé.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category} className="mb-1 last:mb-0">
                <p className="px-2.5 pt-2 pb-1 text-[9.5px] font-bold tracking-[0.14em] text-muted/80 uppercase">
                  {category}
                </p>
                {categoryItems.map((item) => {
                  index += 1
                  const Icon = item.icon
                  const isActive = index === active
                  return (
                    <button
                      key={item.id}
                      ref={isActive ? activeRef : undefined}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => select(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition',
                        isActive ? 'bg-surface-2' : 'hover:bg-surface-2/60'
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface',
                          isActive ? 'text-brand' : 'text-muted'
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-semibold text-ink">
                          {item.title}
                        </span>
                        <span className="block truncate text-[11px] text-muted">
                          {item.subtitle}
                        </span>
                      </span>
                      <ArrowRight
                        className={cn(
                          'size-3.5 shrink-0 transition',
                          isActive ? 'text-brand opacity-100' : 'text-muted opacity-0'
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface-2/50 px-4 py-2.5 text-[10.5px] text-muted">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-semibold">↑</kbd>
              <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-semibold">↓</kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-semibold">↵</kbd>
              ouvrir
            </span>
          </span>
          <span className="hidden sm:inline">Recherche globale</span>
        </div>
      </div>
    </div>
  )
}
