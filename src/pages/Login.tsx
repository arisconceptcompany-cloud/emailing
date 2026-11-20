import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { ApiError } from '../lib/api'
import { useStore } from '../store/store-context'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { cn } from '../lib/utils'

type Mode = 'login' | 'register'

interface LoginProps {
  initialMode?: Mode
}

const highlights = [
  { icon: Send, label: 'Campagnes', detail: 'Créez, planifiez et envoyez vos emails.' },
  { icon: Users, label: 'Contacts', detail: 'Gérez vos listes et vos destinataires.' },
  { icon: BarChart3, label: 'Analyses', detail: 'Suivez les ouvertures en temps réel.' },
]

export function Login({ initialMode = 'login' }: LoginProps) {
  const { user, signIn, signUp } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from =
    (location.state as { from?: string } | null)?.from ?? '/'

  // Déjà connecté : on entre directement dans l'application.
  if (user) return <Navigate to={from} replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (mode === 'register') {
      if (password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères.')
        return
      }
      if (password !== passwordConfirm) {
        setError('Les mots de passe ne correspondent pas.')
        return
      }
      if (!termsAccepted || !privacyAccepted) {
        setError(
          'Veuillez accepter les conditions d’utilisation et la politique de confidentialité.'
        )
        return
      }
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn({ email: email.trim(), password })
      } else {
        await signUp({
          name: name.trim(),
          email: email.trim(),
          password,
          passwordConfirm,
          termsAccepted,
          privacyAccepted,
        })
      }
      navigate(from, { replace: true })
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Une erreur est survenue. Réessayez dans un instant.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[1.05fr_1fr]">
      {/* Panneau de présentation */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-brand via-violet-600 to-indigo-700 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute -top-32 -right-24 size-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[420px] rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
            <Mail className="size-5" />
          </div>
          <div>
            <p className="text-lg leading-tight font-extrabold tracking-tight">Aris</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/70 uppercase">
              Emailing suite
            </p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur">
            <ShieldCheck className="size-3.5" /> Espace sécurisé
          </span>
          <h1 className="mt-5 text-[38px] leading-[1.1] font-extrabold tracking-tight xl:text-[46px]">
            Vos campagnes, <br />
            votre espace.
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/75">
            Connectez-vous pour piloter vos emails, vos contacts et vos analyses depuis un seul
            endroit.
          </p>

          <div className="mt-9 space-y-3">
            {highlights.map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-[13px] font-bold">{label}</p>
                  <p className="text-[11.5px] text-white/70">{detail}</p>
                </div>
                <Check className="ml-auto mt-1 size-4 shrink-0 text-emerald-300" />
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-white/50">
          © 2026 Aris emailing — la plateforme d’emailing qui respire.
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-2xl bg-linear-to-br from-brand to-violet-500 text-white shadow-lg shadow-brand/25">
              <Mail className="size-5" />
            </div>
            <div>
              <p className="text-[15px] font-extrabold tracking-tight text-ink">Aris</p>
              <p className="text-[9px] font-semibold tracking-[0.18em] text-muted uppercase">
                Emailing suite
              </p>
            </div>
          </div>

          <h2 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
            {mode === 'login' ? 'Bon retour parmi nous' : 'Créer votre compte'}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {mode === 'login'
              ? 'Connectez-vous pour accéder à votre espace de travail.'
              : 'Quelques informations et votre espace est prêt.'}
          </p>

          <div className="mt-6 flex rounded-xl border border-line bg-surface-2/60 p-1">
            {(['login', 'register'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchMode(item)}
                className={cn(
                  'flex-1 rounded-lg py-2 text-[12.5px] font-semibold transition',
                  mode === item
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-muted hover:text-ink-soft'
                )}
              >
                {item === 'login' ? 'Se connecter' : "S’inscrire"}
              </button>
            ))}
          </div>

          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-300/60 bg-rose-500/10 px-3.5 py-3 text-[12px] leading-relaxed text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <Input
                label="Nom complet"
                placeholder="Maminiaina Sarobidy"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            )}

            <Input
              label="Adresse email"
              type="email"
              placeholder="vous@exemple.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div>
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? '8 caractères minimum' : 'Votre mot de passe'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
              </button>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <Input
                    label="Confirmer le mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ressaisissez votre mot de passe"
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    required
                  />
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="mt-1.5 text-[11.5px] font-medium text-rose-500">
                      Les mots de passe ne correspondent pas.
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 rounded-xl border border-line bg-surface-2/40 p-3.5">
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-line accent-brand"
                    />
                    <span className="text-[11.5px] leading-relaxed text-ink-soft">
                      J’accepte les{' '}
                      <Link
                        to="/conditions"
                        target="_blank"
                        className="font-semibold text-brand hover:underline"
                      >
                        conditions d’utilisation
                      </Link>
                      .
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(event) => setPrivacyAccepted(event.target.checked)}
                      className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-line accent-brand"
                    />
                    <span className="text-[11.5px] leading-relaxed text-ink-soft">
                      J’accepte la{' '}
                      <Link
                        to="/confidentialite"
                        target="_blank"
                        className="font-semibold text-brand hover:underline"
                      >
                        politique de confidentialité
                      </Link>
                      .
                    </span>
                  </label>
                </div>
              </>
            )}

            <Button type="submit" size="lg" loading={busy} className="w-full" icon={<ArrowRight className="size-4" />}>
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-surface px-3.5 py-3">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-brand" />
            <p className="text-[11px] leading-relaxed text-muted">
              Vos identifiants sont vérifiés par l’API sécurisée d’Aris. Les mots de passe sont
              hachés et ne sont jamais stockés en clair.
            </p>
          </div>

          <p className="mt-5 text-center text-[11.5px] text-muted">
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-brand transition hover:text-brand-strong hover:underline"
            >
              {mode === 'login' ? 'Inscrivez-vous' : 'Connectez-vous'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
