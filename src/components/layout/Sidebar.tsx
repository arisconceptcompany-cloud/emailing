import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  LayoutTemplate,
  LifeBuoy,
  Mail,
  Send,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useStore } from '../../store/store-context'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const mainNav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/campagnes', label: 'Campagnes', icon: Send },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/modeles', label: 'Modèles', icon: LayoutTemplate },
  { to: '/analyses', label: 'Analyses', icon: BarChart3 },
]

const secondaryNav = [
  { to: '/parametres', label: 'Paramètres', icon: Settings },
  { to: '/aide', label: 'Aide & support', icon: LifeBuoy },
]

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="grid size-9.5 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand to-violet-500 text-white shadow-lg shadow-brand/30">
        <Mail className="size-[18px]" />
      </div>
      <div className={cn('min-w-0 transition-opacity', collapsed && 'lg:hidden')}>
        <p className="text-[15px] leading-tight font-extrabold tracking-tight text-ink">Aris</p>
        <p className="text-[9.5px] font-semibold tracking-[0.18em] text-muted uppercase">
          Emailing suite
        </p>
      </div>
    </div>
  )
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { campaigns, settings, user, logout } = useStore()
  const navigate = useNavigate()
  const accountName = user?.name || (settings
    ? `${settings.firstName} ${settings.lastName}`.trim() || 'Mon compte'
    : 'Mon compte')
  const accountEmail = user?.email ?? settings?.email ?? ''

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }
  const activeCount = campaigns.filter(
    (campaign) => campaign.status === 'sending' || campaign.status === 'scheduled'
  ).length

  const renderLink = (item: (typeof mainNav)[number], badge?: number) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onMobileClose}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
            isActive
              ? 'bg-brand-soft font-semibold text-brand-strong'
              : 'text-muted hover:bg-surface-2 hover:text-ink',
            collapsed && 'lg:justify-center lg:px-0'
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn(
                'size-[18px] shrink-0 transition',
                isActive ? 'text-brand-strong' : 'text-muted group-hover:text-ink'
              )}
            />
            <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
            {badge ? (
              <span
                className={cn(
                  'ml-auto rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-strong',
                  collapsed && 'lg:hidden'
                )}
              >
                {badge}
              </span>
            ) : null}
            {isActive && (
              <span className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
            )}
          </>
        )}
      </NavLink>
    )
  }

  return (
    <>
      <div
        onClick={onMobileClose}
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-line bg-surface transition-[transform,width] duration-300 lg:z-30 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-[84px]' : 'lg:w-[270px]'
        )}
      >
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Déplier la navigation' : 'Replier la navigation'}
          className="absolute top-20 -right-3 z-10 hidden size-6 place-items-center rounded-full border border-line bg-surface text-muted shadow-soft transition hover:text-ink lg:grid"
        >
          {collapsed ? (
            <ChevronsRight className="size-3.5" />
          ) : (
            <ChevronsLeft className="size-3.5" />
          )}
        </button>

        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Logo collapsed={collapsed} />
          <button
            onClick={onMobileClose}
            aria-label="Fermer le menu"
            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink lg:hidden"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            <p
              className={cn(
                'mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-muted/80 uppercase',
                collapsed && 'lg:hidden'
              )}
            >
              Espace de travail
            </p>
            {mainNav.map((item) =>
              renderLink(item, item.to === '/campagnes' ? activeCount : undefined)
            )}
          </div>

          <div className="space-y-1">
            <p
              className={cn(
                'mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-muted/80 uppercase',
                collapsed && 'lg:hidden'
              )}
            >
              Compte
            </p>
            {secondaryNav.map((item) => renderLink(item))}
          </div>
        </div>

        <div className="shrink-0 space-y-3 border-t border-line p-3">
          <NavLink
            to="/parametres"
            onClick={onMobileClose}
            className={cn(
              'flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-surface-2',
              collapsed && 'lg:justify-center'
            )}
          >
            <Avatar name={accountName} size="sm" />
            <div className={cn('min-w-0 flex-1', collapsed && 'lg:hidden')}>
              <p className="truncate text-[12.5px] font-semibold text-ink">{accountName}</p>
              <p className="truncate text-[10.5px] text-muted">
                {accountEmail || 'Administrateur'}
              </p>
            </div>
            <Settings
              className={cn('size-4 shrink-0 text-muted', collapsed && 'lg:hidden')}
            />
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            className={cn(
              'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-muted transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400',
              collapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <LogOut className="size-4 shrink-0" />
            <span className={cn(collapsed && 'lg:hidden')}>Se déconnecter</span>
          </button>
        </div>
      </aside>
    </>
  )
}
