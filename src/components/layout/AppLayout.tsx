import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette } from './CommandPalette'
import { CreateCampaignModal } from '../CreateCampaignModal'
import { cn } from '../../lib/utils'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen min-w-0">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      <div
        className={cn(
          'flex min-h-screen min-w-0 flex-col transition-[padding] duration-300',
          collapsed ? 'lg:pl-[84px]' : 'lg:pl-[270px]'
        )}
      >
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 overflow-x-clip px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        <footer className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-2 border-t border-line/70 px-4 py-5 text-[11px] text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Aris emailing — la plateforme d’emailing qui respire.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Tous les services opérationnels
            </span>
            <a href="#" className="transition hover:text-ink">
              Statut
            </a>
            <a href="#" className="transition hover:text-ink">
              Confidentialité
            </a>
          </div>
        </footer>
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CreateCampaignModal />
    </div>
  )
}
