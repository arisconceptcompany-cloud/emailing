import { useEffect, useState } from 'react'
import {
  Check,
  Globe,
  Inbox,
  KeyRound,
  Mail,
  Moon,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Server,
  ShieldCheck,
  Sun,
  Trash2,
} from 'lucide-react'
import { useStore } from '../store/store-context'
import {
  api,
  type DnsCheck,
  type MailDomainStatus,
  type MailStatus,
  type SmtpConfig,
} from '../lib/api'
import { cn } from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'

function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-4">
      <p className="text-[13.5px] font-bold tracking-tight text-ink">{title}</p>
      <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{description}</p>
    </div>
  )
}

const domainStatusMeta: Record<
  MailDomainStatus['status'],
  { label: string; tone: string }
> = {
  healthy: {
    label: 'Sain',
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  partial: {
    label: 'Partiel',
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  unconfigured: {
    label: 'À configurer',
    tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
}

const checkStatusMeta: Record<DnsCheck['status'], { label: string; tone: string }> = {
  ok: { label: 'Configuré', tone: 'text-emerald-600 dark:text-emerald-400' },
  managed: { label: 'Géré', tone: 'text-sky-600 dark:text-sky-400' },
  missing: { label: 'Absent', tone: 'text-rose-600 dark:text-rose-400' },
}

interface SmtpForm {
  host: string
  port: string
  user: string
  password: string
  starttls: boolean
  ssl: boolean
  mailFrom: string
  mailFromName: string
}

export function Settings() {
  const { theme, setTheme, toast, settings, updateSettings } = useStore()

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
  })

  const [sender, setSender] = useState({
    name: '',
    email: '',
    replyTo: '',
  })

  const [notifications, setNotifications] = useState({
    weekly: true,
    campaign: true,
    contacts: false,
    tips: true,
  })

  const [saving, setSaving] = useState(false)

  const [smtp, setSmtp] = useState<SmtpConfig | null>(null)
  const [smtpForm, setSmtpForm] = useState<SmtpForm>({
    host: '',
    port: '587',
    user: '',
    password: '',
    starttls: true,
    ssl: false,
    mailFrom: '',
    mailFromName: '',
  })
  const [smtpTestEmail, setSmtpTestEmail] = useState('')
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)

  useEffect(() => {
    if (!settings) return
    setProfile({
      firstName: settings.firstName,
      lastName: settings.lastName,
      email: settings.email,
      company: settings.company,
      role: settings.role,
    })
    setSender({
      name: settings.senderName,
      email: settings.senderEmail,
      replyTo: settings.replyTo,
    })
    setNotifications({
      weekly: settings.notifWeekly,
      campaign: settings.notifCampaign,
      contacts: settings.notifContacts,
      tips: settings.notifTips,
    })
  }, [settings])

  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.trim().toUpperCase() || '?'

  const save = async () => {
    setSaving(true)
    const ok = await updateSettings({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      company: profile.company,
      role: profile.role,
      senderName: sender.name,
      senderEmail: sender.email,
      replyTo: sender.replyTo,
      notifWeekly: notifications.weekly,
      notifCampaign: notifications.campaign,
      notifContacts: notifications.contacts,
      notifTips: notifications.tips,
    })
    setSaving(false)
    if (!ok) return
    toast('Paramètres enregistrés', {
      description: 'Vos modifications ont bien été prises en compte.',
    })
  }

  const [mail, setMail] = useState<MailStatus | null>(null)
  const [checkingMail, setCheckingMail] = useState(false)

  const [domain, setDomain] = useState<MailDomainStatus | null>(null)
  const [checkingDomain, setCheckingDomain] = useState(false)
  const [domainError, setDomainError] = useState(false)

  const checkMail = async (force = false) => {
    setCheckingMail(true)
    try {
      setMail(await api.mail.status(force))
    } catch {
      setMail(null)
    } finally {
      setCheckingMail(false)
    }
  }

  const checkDomain = async () => {
    setCheckingDomain(true)
    setDomainError(false)
    try {
      setDomain(await api.mail.domain())
    } catch {
      setDomain(null)
      setDomainError(true)
    } finally {
      setCheckingDomain(false)
    }
  }

  useEffect(() => {
    void checkMail()
    void checkDomain()
  }, [])

  const reloadSmtp = async (config?: SmtpConfig) => {
    const data = config ?? (await api.settings.getSmtp())
    const configured = Boolean(data.smtpHost)
    setSmtp(data)
    setSmtpForm({
      host: configured ? data.smtpHost : data.activeHost,
      port: String(configured ? data.smtpPort : data.activePort || 587),
      user: configured ? data.smtpUser : data.activeUser,
      password: '',
      starttls: configured ? data.smtpStarttls : data.activeStarttls,
      ssl: configured ? data.smtpSsl : data.activeSsl,
      mailFrom: configured ? data.mailFrom : data.activeMailFrom,
      mailFromName: configured ? data.mailFromName : data.activeMailFromName,
    })
    if (!smtpTestEmail) setSmtpTestEmail(data.activeMailFrom)
  }

  useEffect(() => {
    void reloadSmtp().catch(() => {
      /* la carte affichera un état vide si l'API est indisponible */
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveSmtp = async () => {
    const port = Number(smtpForm.port)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      toast('Port SMTP invalide', { description: 'Choisissez un port entre 1 et 65535.', variant: 'error' })
      return
    }
    setSavingSmtp(true)
    try {
      const updated = await api.settings.updateSmtp({
        smtpHost: smtpForm.host.trim(),
        smtpPort: port,
        smtpUser: smtpForm.user.trim(),
        smtpPassword: smtpForm.password,
        smtpStarttls: smtpForm.starttls,
        smtpSsl: smtpForm.ssl,
        mailFrom: smtpForm.mailFrom.trim(),
        mailFromName: smtpForm.mailFromName.trim(),
      })
      await reloadSmtp(updated)
      void checkMail()
      void checkDomain()
      toast('Configuration SMTP enregistrée', {
        description: 'Le nouvel expéditeur est utilisé immédiatement, sans redémarrage.',
      })
    } catch (error) {
      toast('Enregistrement impossible', {
        description: error instanceof Error ? error.message : 'Vérifiez les informations saisies.',
        variant: 'error',
      })
    } finally {
      setSavingSmtp(false)
    }
  }

  const testSmtp = async () => {
    if (!smtpTestEmail.trim()) {
      toast('Adresse de test requise', { description: 'Saisissez une adresse pour recevoir le mail de test.', variant: 'error' })
      return
    }
    setTestingSmtp(true)
    try {
      await api.mail.testSmtp({
        email: smtpTestEmail.trim(),
        smtpHost: smtpForm.host.trim(),
        smtpPort: Number(smtpForm.port) || 587,
        smtpUser: smtpForm.user.trim(),
        smtpPassword: smtpForm.password || undefined,
        smtpStarttls: smtpForm.starttls,
        smtpSsl: smtpForm.ssl,
        mailFrom: smtpForm.mailFrom.trim(),
        mailFromName: smtpForm.mailFromName.trim(),
      })
      toast('Email de test envoyé', {
        description: `Vérifiez la boîte ${smtpTestEmail.trim()} (et vos courriers indésirables).`,
      })
    } catch (error) {
      toast('Test de connexion échoué', {
        description: error instanceof Error ? error.message : 'Vérifiez l’hôte, le port et le mot de passe d’application.',
        variant: 'error',
      })
    } finally {
      setTestingSmtp(false)
    }
  }

  const resetSmtp = async () => {
    setSavingSmtp(true)
    try {
      const updated = await api.settings.updateSmtp({ clearSmtp: true })
      await reloadSmtp(updated)
      void checkMail()
      void checkDomain()
      toast('Configuration SMTP effacée', { description: 'La configuration du serveur est de nouveau utilisée.' })
    } catch {
      toast('Effacement impossible', { variant: 'error' })
    } finally {
      setSavingSmtp(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Paramètres"
        subtitle="Gérez votre profil, votre identité d’expéditeur et la configuration de votre domaine."
        actions={
          <Button icon={<Save className="size-4" />} loading={saving} onClick={() => void save()}>
            Enregistrer les modifications
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="p-5">
            <SectionHeading
              title="Profil"
              description="Ces informations apparaissent dans votre espace et sur vos emails."
            />
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br from-violet-500 to-indigo-500 text-base font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-ink">Photo de profil</p>
                <p className="text-[10.5px] text-muted">PNG ou JPG, 2 Mo maximum.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast('Import de photo', { description: 'Fonction disponible prochainement.', variant: 'info' })}
              >
                Changer
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Prénom"
                value={profile.firstName}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, firstName: event.target.value }))
                }
              />
              <Input
                label="Nom"
                value={profile.lastName}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, lastName: event.target.value }))
                }
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, email: event.target.value }))
                }
              />
              <Input
                label="Entreprise"
                value={profile.company}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, company: event.target.value }))
                }
              />
              <Input
                label="Fonction"
                value={profile.role}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, role: event.target.value }))
                }
                wrapperClassName="sm:col-span-2"
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <SectionHeading
                title="Expéditeur par défaut"
                description="L’identité utilisée par défaut lorsque vous créez une campagne."
              />
              {mail?.connected ? (
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="size-2.5" /> Connecté
                </span>
              ) : (
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9.5px] font-bold text-amber-600 dark:text-amber-400">
                  {checkingMail ? 'Vérification…' : 'Non connecté'}
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nom affiché"
                value={sender.name}
                onChange={(event) =>
                  setSender((current) => ({ ...current, name: event.target.value }))
                }
              />
              <Input
                label="Email d’envoi"
                type="email"
                value={sender.email}
                onChange={(event) =>
                  setSender((current) => ({ ...current, email: event.target.value }))
                }
              />
              <Input
                label="Répondre à"
                type="email"
                value={sender.replyTo}
                onChange={(event) =>
                  setSender((current) => ({ ...current, replyTo: event.target.value }))
                }
                wrapperClassName="sm:col-span-2"
                hint="Les réponses de vos contacts seront envoyées à cette adresse."
              />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-surface-2/40 p-3">
              <Mail className="size-4 shrink-0 text-brand" />
              <p className="text-[10.5px] leading-relaxed text-muted">
                Aperçu : vos contacts recevront{' '}
                <span className="font-semibold text-ink">
                  {sender.name} &lt;{sender.email}&gt;
                </span>
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <SectionHeading
                title="Serveur SMTP"
                description="Configurez la boîte qui envoie réellement vos emails. Aucun redémarrage du serveur n’est nécessaire."
              />
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold',
                  smtp?.smtpHost
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : 'bg-surface-2 text-muted'
                )}
              >
                <Server className="size-2.5" />
                {smtp?.smtpHost ? 'Enregistré ici' : 'Configuration serveur'}
              </span>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface-2/40 p-3">
              <KeyRound className="size-4 shrink-0 text-brand" />
              <p className="text-[10.5px] leading-relaxed text-muted">
                Actif :{' '}
                <span className="font-semibold text-ink">
                  {smtp ? `${smtp.activeMailFromName} <${smtp.activeMailFrom}>` : '—'}
                </span>
                {smtp && ` · ${smtp.activeHost}:${smtp.activePort}`}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Hôte SMTP"
                placeholder="smtp.gmail.com"
                value={smtpForm.host}
                onChange={(event) =>
                  setSmtpForm((current) => ({ ...current, host: event.target.value }))
                }
              />
              <Input
                label="Port"
                type="number"
                min={1}
                max={65535}
                value={smtpForm.port}
                onChange={(event) =>
                  setSmtpForm((current) => ({ ...current, port: event.target.value }))
                }
              />
              <Input
                label="Utilisateur SMTP"
                placeholder="votre.adresse@gmail.com"
                value={smtpForm.user}
                onChange={(event) =>
                  setSmtpForm((current) => ({ ...current, user: event.target.value }))
                }
              />
              <Input
                label="Mot de passe d’application"
                type="password"
                autoComplete="new-password"
                placeholder={
                  smtp?.smtpPasswordSet
                    ? 'Enregistré — laissez vide pour conserver'
                    : 'xxxxxxxxxxxxxxxx'
                }
                value={smtpForm.password}
                onChange={(event) =>
                  setSmtpForm((current) => ({ ...current, password: event.target.value }))
                }
                hint={
                  smtpForm.host.includes('gmail') || smtpForm.user.includes('gmail')
                    ? 'Gmail : utilisez un mot de passe d’application (16 caractères), pas le mot de passe du compte.'
                    : 'Le mot de passe est chiffré et n’est jamais réaffiché.'
                }
              />
              <Input
                label="Adresse d’envoi"
                type="email"
                placeholder="votre.adresse@gmail.com"
                value={smtpForm.mailFrom}
                onChange={(event) =>
                  setSmtpForm((current) => ({ ...current, mailFrom: event.target.value }))
                }
                hint="Doit correspondre au compte SMTP ou à un alias vérifié."
              />
              <Input
                label="Nom affiché"
                placeholder="Votre nom ou votre marque"
                value={smtpForm.mailFromName}
                onChange={(event) =>
                  setSmtpForm((current) => ({ ...current, mailFromName: event.target.value }))
                }
              />
            </div>

            <div className="mt-4 divide-y divide-line/70 rounded-xl border border-line px-3">
              <Toggle
                label="STARTTLS"
                description="Chiffrement recommandé pour le port 587."
                checked={smtpForm.starttls}
                onChange={(value) =>
                  setSmtpForm((current) => ({
                    ...current,
                    starttls: value,
                    ssl: value ? false : current.ssl,
                  }))
                }
                className="py-3 first:pt-0"
              />
              <Toggle
                label="SSL / TLS"
                description="Pour un serveur sur le port 465."
                checked={smtpForm.ssl}
                onChange={(value) =>
                  setSmtpForm((current) => ({
                    ...current,
                    ssl: value,
                    starttls: value ? false : current.starttls,
                  }))
                }
                className="py-3 last:pb-0"
              />
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2/30 p-3">
              <p className="text-[11.5px] font-semibold text-ink">Tester avant d’enregistrer</p>
              <p className="mt-0.5 text-[10.5px] text-muted">
                Un véritable email part avec les valeurs ci-dessus, sans rien sauvegarder.
              </p>
              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Adresse qui recevra le test"
                  value={smtpTestEmail}
                  onChange={(event) => setSmtpTestEmail(event.target.value)}
                  wrapperClassName="flex-1"
                />
                <Button
                  variant="secondary"
                  icon={<Send className="size-4" />}
                  loading={testingSmtp}
                  onClick={() => void testSmtp()}
                >
                  Envoyer le test
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                icon={<Save className="size-4" />}
                loading={savingSmtp}
                onClick={() => void saveSmtp()}
              >
                Enregistrer SMTP
              </Button>
              {smtp?.smtpHost && (
                <Button
                  variant="ghost"
                  icon={<RotateCcw className="size-4" />}
                  disabled={savingSmtp}
                  onClick={() => void resetSmtp()}
                >
                  Revenir au serveur
                </Button>
              )}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              Les campagnes déjà créées gardent l’expéditeur choisi au moment de leur création.
            </p>
          </Card>

          <Card className="p-5">
            <SectionHeading
              title="Notifications"
              description="Choisissez les alertes que vous souhaitez recevoir par email."
            />
            <div className="divide-y divide-line/70">
              <Toggle
                label="Rapport hebdomadaire"
                description="Un résumé des performances chaque lundi matin."
                checked={notifications.weekly}
                onChange={(value) =>
                  setNotifications((current) => ({ ...current, weekly: value }))
                }
                className="py-3 first:pt-0"
              />
              <Toggle
                label="Alertes de campagne"
                description="Soyez prévenu quand un envoi se termine ou rencontre un problème."
                checked={notifications.campaign}
                onChange={(value) =>
                  setNotifications((current) => ({ ...current, campaign: value }))
                }
                className="py-3"
              />
              <Toggle
                label="Nouveaux contacts"
                description="Recevez une notification à chaque import de contacts."
                checked={notifications.contacts}
                onChange={(value) =>
                  setNotifications((current) => ({ ...current, contacts: value }))
                }
                className="py-3"
              />
              <Toggle
                label="Conseils produit"
                description="Astuces et bonnes pratiques pour améliorer vos campagnes."
                checked={notifications.tips}
                onChange={(value) =>
                  setNotifications((current) => ({ ...current, tips: value }))
                }
                className="py-3 last:pb-0"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[13.5px] font-bold tracking-tight text-ink">Domaine d’envoi</p>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Authentification de {domain?.domain ?? '—'}
                </p>
              </div>
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-lg',
                  domain ? domainStatusMeta[domain.status].tone : 'bg-surface-2 text-muted'
                )}
              >
                <Globe className="size-4" />
              </span>
            </div>

            {checkingDomain && !domain ? (
              <div className="grid h-24 place-items-center rounded-xl border border-line bg-surface-2/40">
                <span className="size-5 animate-spin rounded-full border-2 border-line border-t-brand" />
              </div>
            ) : domain ? (
              <>
                <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2/40 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-ink">{domain.domain}</p>
                    <p className="truncate text-[10px] text-muted">
                      {domain.provider
                        ? `Authentification gérée par ${domain.provider}`
                        : `Expéditeur : ${domain.mailFrom}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold',
                      domainStatusMeta[domain.status].tone
                    )}
                  >
                    <ShieldCheck className="size-3" /> {domainStatusMeta[domain.status].label}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {domain.checks.map((check) => {
                    const meta = checkStatusMeta[check.status]
                    return (
                      <div key={check.name} className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              'grid size-4 shrink-0 place-items-center rounded-full',
                              meta.tone
                            )}
                          >
                            <Check className="size-2.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10.5px] font-semibold text-ink">{check.name}</p>
                            <p
                              className="max-w-[170px] truncate text-[9.5px] text-muted"
                              title={check.value}
                            >
                              {check.value}
                            </p>
                          </div>
                        </div>
                        <span className={cn('shrink-0 text-[9.5px] font-semibold', meta.tone)}>
                          {meta.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
                  {domain.status === 'healthy'
                    ? 'Ces enregistrements DNS authentifient vos emails et améliorent la délivrabilité.'
                    : 'SPF, DKIM et DMARC se configurent dans le DNS du domaine (chez votre hébergeur), pas dans cette plateforme.'}
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-line bg-surface-2/40 px-3 py-4 text-center">
                <p className="text-[11px] text-muted">
                  {domainError
                    ? 'Vérification DNS impossible pour le moment.'
                    : 'Aucune information disponible.'}
                </p>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
              icon={<RefreshCw className={cn('size-3.5', checkingDomain && 'animate-spin')} />}
              onClick={() => void checkDomain()}
            >
              Vérifier le domaine (DNS)
            </Button>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[13.5px] font-bold tracking-tight text-ink">Envoi d’emails</p>
                <p className="mt-0.5 text-[11.5px] text-muted">Transport SMTP des campagnes</p>
              </div>
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-lg',
                  mail?.connected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                )}
              >
                <Inbox className="size-4" />
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2/40 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-ink">
                  {mail ? `${mail.smtpHost}:${mail.smtpPort}` : '—'}
                </p>
                <p className="truncate text-[10px] text-muted">
                  Expéditeur : {mail?.mailFrom ?? '—'}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold',
                  mail?.connected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                )}
              >
                {mail?.connected ? 'Connecté' : 'Injoignable'}
              </span>
            </div>

            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              {mail && /mailpit|127\.0\.0\.1|localhost/i.test(mail.smtpHost) ? (
                <>
                  En local, les emails sont capturés par <strong>Mailpit</strong> (aucun envoi
                  réel). Consultez-les sur{' '}
                  <a
                    href="http://localhost:8025"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    localhost:8025
                  </a>
                  .
                </>
              ) : (
                <>
                  Les emails sont envoyés réellement via{' '}
                  <strong>{mail ? `${mail.smtpHost}:${mail.smtpPort}` : 'SMTP'}</strong>. Assurez-vous
                  que l’expéditeur correspond au compte authentifié.
                </>
              )}
            </p>

            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
              icon={<RefreshCw className={cn('size-3.5', checkingMail && 'animate-spin')} />}
              onClick={() => void checkMail(true)}
            >
              Tester la connexion SMTP
            </Button>
          </Card>

          <Card className="p-5">
            <SectionHeading
              title="Apparence"
              description="Choisissez le thème de votre interface."
            />
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'light', label: 'Clair', icon: Sun },
                  { id: 'dark', label: 'Sombre', icon: Moon },
                ] as const
              ).map((option) => {
                const Icon = option.icon
                const active = theme === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      'rounded-xl border p-1.5 text-left transition',
                      active
                        ? 'border-brand ring-2 ring-brand/15'
                        : 'border-line hover:border-line-strong'
                    )}
                  >
                    <div
                      className={cn(
                        'h-14 rounded-lg border p-1.5',
                        option.id === 'light'
                          ? 'border-slate-200 bg-[#f5f6fb]'
                          : 'border-slate-800 bg-[#0e1119]'
                      )}
                    >
                      <div className="h-2 w-7 rounded bg-[#6d5dfc]" />
                      <div
                        className={cn(
                          'mt-1.5 h-2 w-full rounded',
                          option.id === 'light' ? 'bg-white' : 'bg-[#1c2231]'
                        )}
                      />
                      <div
                        className={cn(
                          'mt-1 h-2 w-2/3 rounded',
                          option.id === 'light' ? 'bg-white' : 'bg-[#1c2231]'
                        )}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between px-0.5">
                      <span className="flex items-center gap-1 text-[10.5px] font-semibold text-ink">
                        <Icon className="size-3" /> {option.label}
                      </span>
                      {active && <Check className="size-3 text-brand" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="border-rose-500/20 p-5">
            <p className="text-[13px] font-bold tracking-tight text-ink">Zone sensible</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
              La suppression de votre compte est définitive et efface toutes vos campagnes et
              contacts.
            </p>
            <Button
              variant="danger"
              size="sm"
              className="mt-3 w-full"
              icon={<Trash2 className="size-3.5" />}
              onClick={() =>
                toast('Suppression désactivée', {
                  description: 'Cette action est désactivée dans la démo.',
                  variant: 'error',
                })
              }
            >
              Supprimer le compte
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
