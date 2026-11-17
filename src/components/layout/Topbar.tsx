import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  CalendarClock,
  Menu,
  Moon,
  Search,
  Send,
  Sun,
  UserPlus,
  Users,
} from 'lucide-react'
import { useStore } from '../../store/store-context'
import { cn, relativeTime } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'

const pageTitles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/campagnes': 'Campagnes',
  '/contacts': 'Contacts',
  '/modeles': 'Modèles',
  '/analyses': 'Analyses',
  '/parametres': 'Paramètres',
  '/aide': 'Aide & support',
}

const notifications = [
  {
    id: 'n1',
    icon: Send,
    tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    title: 'Newsletter #42 en cours d’envoi',
    meta: '5 210 emails délivrés sur 8 420',
    time: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'n2',
    icon: UserPlus,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    title: '148 nouveaux contacts importés',
    meta: 'Liste « Prospects »',
    time: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'n3',
    icon: CalendarClock,
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    title: 'Campagne planifiée pour jeudi',
    meta: 'Invitation — Webinar productivité',
    time: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
]

interface TopbarProps {
  onOpenMobile: () => void
  onOpenSearch: () => void
}

export function Topbar({ onOpenMobile, onOpenSearch }: TopbarProps) {
  const { theme, toggleTheme, settings } = useStore()
  const accountName = settings
    ? `${settings.firstName} ${settings.lastName}`.trim()
    : 'Awa Diop'
  const accountEmail = settings?.email ?? 'awa@aris.email'
  const location = useLocation()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unread, setUnread] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const title = pageTitles[location.pathname] ?? 'Aris'

  useEffect(() => {
    if (!notificationsOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [notificationsOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onOpenMobile}
          aria-label="Ouvrir le menu"
          className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wide text-muted uppercase">
            <span className="hidden sm:inline">Espace de travail</span>
            <span className="hidden text-muted/50 sm:inline">/</span>
            <span className="truncate text-ink-soft normal-case">{title}</span>
          </div>
          <h2 className="truncate text-[15px] font-bold tracking-tight text-ink sm:hidden">
            {title}
          </h2>
        </div>

        <div className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-muted xl:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Tous les systèmes opérationnels
        </div>

        <button
          onClick={onOpenSearch}
          className="hidden h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-[12.5px] text-muted transition hover:border-line-strong hover:text-ink sm:flex sm:w-52 lg:w-60"
        >
          <Search className="size-4" />
          <span>Rechercher…</span>
          <kbd className="ml-auto rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenSearch}
          aria-label="Rechercher"
          className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink sm:hidden"
        >
          <Search className="size-4.5" />
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Changer de thème"
          className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          {theme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => {
              setNotificationsOpen((open) => !open)
              setUnread(false)
            }}
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <Bell className="size-4.5" />
            {unread && (
              <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-canvas" />
            )}
          </button>

          {notificationsOpen && (
            <div
              ref={panelRef}
              className="absolute right-0 mt-2 w-[min(90vw,340px)] animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-[13px] font-bold text-ink">Notifications</p>
                <button
                  onClick={() => setUnread(false)}
                  className="text-[11px] font-semibold text-brand hover:text-brand-strong"
                >
                  Tout marquer comme lu
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <div
                      key={notification.id}
                      className="flex gap-3 border-b border-line/60 px-4 py-3 transition last:border-0 hover:bg-surface-2"
                    >
                      <div
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-xl',
                          notification.tone
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] leading-snug font-semibold text-ink">
                          {notification.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-muted">
                          {notification.meta}
                        </p>
                        <p className="mt-1 text-[10.5px] text-muted/80">
                          {relativeTime(notification.time)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Link
                to="/campagnes"
                onClick={() => setNotificationsOpen(false)}
                className="flex items-center justify-center gap-1.5 border-t border-line bg-surface-2/60 px-4 py-2.5 text-[11.5px] font-semibold text-brand transition hover:bg-surface-2"
              >
                <Users className="size-3.5" />
                Voir toute l’activité
              </Link>
            </div>
          )}
        </div>

        <div className="mx-1 hidden h-6 w-px bg-line sm:block" />

        <Link
          to="/parametres"
          className="flex items-center gap-2.5 rounded-xl p-1 transition hover:bg-surface-2"
        >
          <Avatar name={accountName} size="sm" />
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-[12.5px] leading-tight font-semibold text-ink">
              {accountName}
            </p>
            <p className="truncate text-[10.5px] text-muted">{accountEmail}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
