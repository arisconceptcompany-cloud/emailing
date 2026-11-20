import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '../components/ui/BrandLogo'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-grid relative mb-6 grid size-24 place-items-center rounded-3xl border border-line bg-surface shadow-soft">
        <BrandLogo className="size-14" />
      </div>
      <p className="text-[11px] font-bold tracking-[0.2em] text-muted uppercase">Erreur 404</p>
      <h1 className="mt-2 text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
        Cette page s’est perdue en chemin
      </h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
        La page que vous cherchez n’existe pas ou a été déplacée. Revenez à votre tableau de bord
        pour continuer.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-linear-to-br from-brand to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:brightness-105"
      >
        <ArrowLeft className="size-4" /> Retour au tableau de bord
      </Link>
    </div>
  )
}
