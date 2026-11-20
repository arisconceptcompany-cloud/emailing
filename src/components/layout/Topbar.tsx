import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Moon, Search, Sun } from 'lucide-react'
import { useStore } from '../../store/store-context'
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

interface TopbarProps {
  onOpenMobile: () => void
  onOpenSearch: () => void
}

export function Topbar({ onOpenMobile, onOpenSearch }: TopbarProps) {
  const { theme, toggleTheme, settings, user, logout } = useStore()
  const navigate = useNavigate()
  const accountName = user?.name || (settings
    ? `${settings.firstName} ${settings.lastName}`.trim() || 'Mon compte'
    : 'Mon compte')
  const accountEmail = user?.email ?? settings?.email ?? ''
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const title = pageTitles[location.pathname] ?? 'Aris'

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

        <button
          onClick={handleLogout}
          aria-label="Se déconnecter"
          title="Se déconnecter"
          className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
        >
          <LogOut className="size-4.5" />
        </button>

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
            {accountEmail && (
              <p className="truncate text-[10.5px] text-muted">{accountEmail}</p>
            )}
          </div>
        </Link>
      </div>
    </header>
  )
}
