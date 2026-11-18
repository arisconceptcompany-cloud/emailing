import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  FlaskConical,
  Layers,
  Plus,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { useStore } from '../store/store-context'
import { ApiError, api } from '../lib/api'
import type { Template } from '../lib/types'
import { cn, formatNumber, toDateTimeLocal } from '../lib/utils'
import { Button } from './ui/Button'
import { Input, Textarea } from './ui/Input'
import { Modal } from './ui/Modal'
import { TemplateThumb } from './TemplateThumb'

const steps = ['Informations', 'Contenu', 'Audience', 'Envoi']

type AudienceMode = 'all' | 'list' | 'contacts'

interface CampaignForm {
  name: string
  subject: string
  senderName: string
  senderEmail: string
  preview: string
  templateId: string
  audienceMode: AudienceMode
  audienceId: string
  contactIds: string[]
  mode: 'now' | 'later'
  scheduledFor: string
}

type FormErrors = Partial<
  Record<'name' | 'subject' | 'senderEmail' | 'audience' | 'date', string>
>

export function CreateCampaignModal() {
  const {
    composer,
    closeComposer,
    templates,
    lists,
    contacts,
    addCampaign,
    sendCampaign,
    settings,
    toast,
  } = useStore()
  const navigate = useNavigate()

  const defaultSenderName = settings
    ? `${settings.firstName} ${settings.lastName}`.trim()
    : ''
  const defaultSenderEmail = settings?.senderEmail || ''

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [contactQuery, setContactQuery] = useState('')
  const [form, setForm] = useState<CampaignForm>({
    name: '',
    subject: '',
    senderName: defaultSenderName,
    senderEmail: defaultSenderEmail,
    preview: '',
    templateId: '',
    audienceMode: lists.length ? 'list' : 'all',
    audienceId: lists[0]?.id ?? '',
    contactIds: [],
    mode: 'now',
    scheduledFor: toDateTimeLocal(new Date(Date.now() + 2 * 86400000)),
  })

  useEffect(() => {
    if (!composer.open) return
    const template = templates.find((item) => item.id === composer.templateId)
    setStep(0)
    setErrors({})
    setMessage(template?.body ?? '')
    setTestEmail('')
    setContactQuery('')
    setForm({
      name: template ? `Campagne — ${template.name}` : '',
      subject: template?.subject ?? '',
      senderName: defaultSenderName,
      senderEmail: defaultSenderEmail,
      preview: template?.preview ?? '',
      templateId: composer.templateId ?? '',
      audienceMode: lists.length ? 'list' : 'all',
      audienceId: lists[0]?.id ?? '',
      contactIds: [],
      mode: 'now',
      scheduledFor: toDateTimeLocal(new Date(Date.now() + 2 * 86400000)),
    })
  }, [composer.open, composer.templateId, templates, lists, defaultSenderName, defaultSenderEmail])

  const activeContacts = contacts.filter((contact) => contact.status === 'active')
  const selectedList = lists.find((list) => list.id === form.audienceId)
  const selectedTemplate = templates.find((item) => item.id === form.templateId)
  const reach =
    form.audienceMode === 'all'
      ? activeContacts.length
      : form.audienceMode === 'list'
        ? Math.round((selectedList?.count ?? 0) * 0.955)
        : form.contactIds.length

  const filteredContacts = activeContacts.filter((contact) => {
    const query = contactQuery.trim().toLowerCase()
    if (!query) return true
    return (
      contact.name.toLowerCase().includes(query) || contact.email.toLowerCase().includes(query)
    )
  })
  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((contact) => form.contactIds.includes(contact.id))

  const toggleContact = (id: string) => {
    setForm((current) => ({
      ...current,
      contactIds: current.contactIds.includes(id)
        ? current.contactIds.filter((item) => item !== id)
        : [...current.contactIds, id],
    }))
    setErrors({})
  }

  const toggleAllFiltered = () => {
    setForm((current) => {
      const ids = filteredContacts.map((contact) => contact.id)
      const contactIds = allFilteredSelected
        ? current.contactIds.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current.contactIds, ...ids]))
      return { ...current, contactIds }
    })
    setErrors({})
  }

  const update = (key: keyof CampaignForm, value: CampaignForm[keyof CampaignForm]) => {
    setForm((current) => ({ ...current, [key]: value }) as CampaignForm)
    setErrors({})
  }

  const selectTemplate = (template: Template) => {
    setForm((current) => ({
      ...current,
      templateId: template.id,
      subject: template.subject || current.subject,
      preview: template.preview || current.preview,
    }))
    setMessage(template.body || '')
    setErrors({})
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (step === 0) {
      if (!form.name.trim()) nextErrors.name = 'Donnez un nom à votre campagne.'
      if (!form.subject.trim()) nextErrors.subject = 'L’objet de l’email est requis.'
      if (!/^\S+@\S+\.\S+$/.test(form.senderEmail))
        nextErrors.senderEmail = 'Adresse email invalide.'
    }
    if (step === 2) {
      if (form.audienceMode === 'list' && !form.audienceId)
        nextErrors.audience = 'Sélectionnez une liste de destinataires.'
      if (form.audienceMode === 'contacts' && form.contactIds.length === 0)
        nextErrors.audience = 'Sélectionnez au moins un contact.'
    }
    if (step === 3 && form.mode === 'later') {
      if (!form.scheduledFor) nextErrors.date = 'Choisissez une date et une heure.'
      else if (new Date(form.scheduledFor).getTime() < Date.now())
        nextErrors.date = 'La date doit être dans le futur.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    const campaign = await addCampaign({
      name: form.name.trim(),
      subject: form.subject.trim(),
      sender: form.senderName.trim() || 'Aris',
      senderEmail: form.senderEmail.trim(),
      audienceId: form.audienceMode === 'list' ? form.audienceId : null,
      contactIds: form.audienceMode === 'contacts' ? form.contactIds : [],
      templateId: form.templateId || undefined,
      preview: form.preview.trim(),
      body: message.trim(),
      scheduledFor:
        form.mode === 'later' ? new Date(form.scheduledFor).toISOString() : undefined,
    })
    if (!campaign) return

    if (form.mode === 'now') {
      const started = await sendCampaign(campaign.id)
      if (!started) return
    }

    toast(
      form.mode === 'later' ? 'Campagne planifiée' : 'Campagne en cours d’envoi',
      {
        description:
          form.mode === 'later'
            ? `« ${form.name} » partira le ${new Date(form.scheduledFor).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}.`
            : `« ${form.name} » est en cours d’envoi vers ${formatNumber(reach)} contacts.`,
      }
    )
    closeComposer()
    navigate('/campagnes')
  }

  const handleNext = () => {
    if (!validate()) return
    if (step === 3) {
      submit()
      return
    }
    setStep((current) => current + 1)
  }

  const goBack = () => {
    setErrors({})
    setStep((current) => Math.max(0, current - 1))
  }

  const sendTest = async () => {
    const recipients = Array.from(
      new Set(
        testEmail
          .split(/[;,\s]+/)
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    )
    if (recipients.length === 0) {
      toast('Adresse email requise', {
        description: 'Saisissez au moins une adresse pour recevoir le test.',
        variant: 'error',
      })
      return
    }
    const invalid = recipients.filter((value) => !/^\S+@\S+\.\S+$/.test(value))
    if (invalid.length > 0) {
      toast('Adresse email invalide', {
        description: `Vérifiez : ${invalid.join(', ')}.`,
        variant: 'error',
      })
      return
    }
    try {
      const result = await api.mail.test({
        email: recipients.join(', '),
        subject: form.subject.trim() || 'Test d’envoi Aris',
        sender: form.senderName.trim() || 'Aris',
        preview: form.preview.trim(),
        body: message.trim(),
        templateId: form.templateId || undefined,
      })
      toast(result.sent > 1 ? 'Emails de test envoyés' : 'Email de test envoyé', {
        description: `Un aperçu de « ${form.subject || 'votre campagne'} » a été envoyé à ${result.recipients.join(', ')}.`,
      })
    } catch (error) {
      const description =
        error instanceof ApiError ? error.message : 'Envoi du test impossible.'
      toast('Email de test non envoyé', { description, variant: 'error' })
    }
  }

  return (
    <Modal
      open={composer.open}
      onClose={closeComposer}
      size="xl"
      title="Nouvelle campagne"
      description="Créez, ciblez et programmez votre prochain email en quelques étapes."
      footer={
        <>
          {step > 0 && (
            <Button
              variant="secondary"
              onClick={goBack}
              icon={<ArrowLeft className="size-4" />}
              className="sm:mr-auto"
            >
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} icon={<ArrowRight className="size-4" />}>
              Continuer
            </Button>
          ) : (
            <Button
              onClick={submit}
              icon={
                form.mode === 'now' ? (
                  <Send className="size-4" />
                ) : (
                  <CalendarClock className="size-4" />
                )
              }
              className="w-full sm:w-auto"
            >
              {form.mode === 'now' ? 'Lancer la campagne' : 'Planifier l’envoi'}
            </Button>
          )}
        </>
      }
    >
      <div className="mb-6 flex items-center gap-2">
        {steps.map((label, index) => {
          const done = index < step
          const current = index === step
          return (
            <Fragment key={label}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'grid size-6.5 shrink-0 place-items-center rounded-full text-[11px] font-bold transition',
                    done
                      ? 'bg-brand text-white'
                      : current
                        ? 'bg-brand-soft text-brand-strong ring-2 ring-brand/25'
                        : 'bg-surface-2 text-muted'
                  )}
                >
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-[11.5px] font-semibold whitespace-nowrap sm:block',
                    current ? 'text-ink' : 'text-muted'
                  )}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-px flex-1 rounded-full transition-colors',
                    done ? 'bg-brand' : 'bg-line'
                  )}
                />
              )}
            </Fragment>
          )
        })}
      </div>

      {step === 0 && (
        <div className="grid animate-fade-up gap-4">
          <Input
            label="Nom interne de la campagne"
            placeholder="Ex. Newsletter #43 — Rétrospective produit"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            error={errors.name}
            autoFocus
          />
          <Input
            label="Objet de l’email"
            placeholder="Ex. Les nouveautés qui vont vous faire gagner du temps ✨"
            value={form.subject}
            onChange={(event) => update('subject', event.target.value)}
            error={errors.subject}
            hint="Utilisez {{prénom}} ou {{entreprise}} pour personnaliser l’objet."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom de l’expéditeur"
              value={form.senderName}
              onChange={(event) => update('senderName', event.target.value)}
            />
            <Input
              label="Email de l’expéditeur"
              type="email"
              value={form.senderEmail}
              onChange={(event) => update('senderEmail', event.target.value)}
              error={errors.senderEmail}
            />
          </div>
          <Input
            label="Texte de prévisualisation"
            placeholder="Une phrase qui donne envie d’ouvrir l’email"
            value={form.preview}
            onChange={(event) => update('preview', event.target.value)}
            hint="Affiché à côté de l’objet dans la boîte de réception."
          />
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-up">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="size-4 text-brand" />
            <p className="text-[12.5px] font-bold text-ink">Choisissez un modèle</p>
            <span className="ml-auto text-[11px] text-muted">
              {selectedTemplate ? selectedTemplate.name : 'Design libre'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => update('templateId', '')}
              className={cn(
                'flex h-[104px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed bg-surface-2/50 transition',
                form.templateId === ''
                  ? 'border-brand bg-brand-soft/40 ring-2 ring-brand/15'
                  : 'border-line hover:border-line-strong'
              )}
            >
              <Plus className="size-4 text-muted" />
              <span className="text-[10.5px] font-semibold text-muted">Page blanche</span>
            </button>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => selectTemplate(template)}
                className={cn(
                  'rounded-xl border p-1.5 text-left transition',
                  form.templateId === template.id
                    ? 'border-brand bg-brand-soft/30 ring-2 ring-brand/15'
                    : 'border-line hover:border-line-strong hover:bg-surface-2'
                )}
              >
                <TemplateThumb template={template} className="h-[68px]" chrome={false} />
                <p className="mt-1.5 truncate px-0.5 pb-0.5 text-[10.5px] font-semibold text-ink">
                  {template.name}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-ink-soft">Message</span>
              <span className="flex items-center gap-1 text-[10.5px] text-muted">
                <Sparkles className="size-3 text-brand" /> Variables disponibles
              </span>
            </div>
            <Textarea
              placeholder="Rédigez votre message…"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-32"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['{{prénom}}', '{{entreprise}}', '{{lien_désabonnement}}'].map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() =>
                    setMessage((current) =>
                      `${current}${current && !current.endsWith(' ') ? ' ' : ''}${variable}`
                    )
                  }
                  className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-brand transition hover:border-brand/40 hover:bg-brand-soft"
                >
                  {variable}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-brand" />
              <p className="text-[12.5px] font-bold text-ink">Choisissez les destinataires</p>
            </div>
            <span className="text-[11px] text-muted">
              {formatNumber(activeContacts.length)} contacts actifs
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                {
                  key: 'all',
                  title: 'Tous les contacts',
                  hint: `${formatNumber(activeContacts.length)} destinataires`,
                },
                {
                  key: 'list',
                  title: 'Une liste',
                  hint: `${lists.length} liste${lists.length > 1 ? 's' : ''}`,
                },
                { key: 'contacts', title: 'Contacts précis', hint: 'Choisir un par un' },
              ] as const
            ).map((option) => {
              const active = form.audienceMode === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => update('audienceMode', option.key)}
                  className={cn(
                    'rounded-xl border p-2.5 text-left transition',
                    active
                      ? 'border-brand bg-brand-soft/40 ring-2 ring-brand/15'
                      : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/60'
                  )}
                >
                  <span className="block text-[11.5px] font-semibold text-ink">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-muted">{option.hint}</span>
                </button>
              )
            })}
          </div>

          {form.audienceMode === 'all' && (
            <div className="mt-3 rounded-xl border border-line bg-surface-2/60 p-3 text-[11px] leading-relaxed text-muted">
              Tous les contacts <span className="font-semibold text-ink">actifs</span> recevront
              cet email. Les contacts désinscrits ou inactifs sont ignorés.
            </div>
          )}

          {form.audienceMode === 'list' && (
            <div className="mt-3 space-y-2">
              {lists.length === 0 && (
                <p className="text-[11.5px] text-muted">
                  Aucune liste pour l’instant — créez-en une depuis la page Contacts.
                </p>
              )}
              {lists.map((list) => {
                const active = form.audienceId === list.id
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => update('audienceId', list.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                      active
                        ? 'border-brand bg-brand-soft/40 ring-2 ring-brand/15'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/60'
                    )}
                  >
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full bg-linear-to-br',
                        list.accent
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-ink">
                        {list.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">
                        {list.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[12px] font-bold text-ink tabular-nums">
                        {formatNumber(list.count)}
                      </span>
                      <span className="block text-[10px] text-muted">contacts</span>
                    </span>
                    <span
                      className={cn(
                        'grid size-4.5 shrink-0 place-items-center rounded-full border transition',
                        active ? 'border-brand bg-brand text-white' : 'border-line-strong'
                      )}
                    >
                      {active && <Check className="size-2.5" />}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {form.audienceMode === 'contacts' && (
            <div className="mt-3">
              <Input
                placeholder="Rechercher un nom ou un email…"
                value={contactQuery}
                onChange={(event) => setContactQuery(event.target.value)}
              />
              <div className="mt-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={toggleAllFiltered}
                  className="text-[11px] font-semibold text-brand hover:underline"
                >
                  {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
                <span className="text-[11px] text-muted">
                  {form.contactIds.length} sélectionné{form.contactIds.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto pr-1">
                {filteredContacts.length === 0 && (
                  <p className="px-1 py-2 text-[11.5px] text-muted">Aucun contact trouvé.</p>
                )}
                {filteredContacts.map((contact) => {
                  const active = form.contactIds.includes(contact.id)
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleContact(contact.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition',
                        active
                          ? 'border-brand bg-brand-soft/40'
                          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/60'
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-4 shrink-0 place-items-center rounded border transition',
                          active ? 'border-brand bg-brand text-white' : 'border-line-strong'
                        )}
                      >
                        {active && <Check className="size-2.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-semibold text-ink">
                          {contact.name || contact.email}
                        </span>
                        <span className="block truncate text-[10.5px] text-muted">
                          {contact.email}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {errors.audience && (
            <p className="mt-2 text-[11.5px] font-medium text-rose-500">{errors.audience}</p>
          )}

          <div className="mt-4 rounded-xl border border-line bg-surface-2/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-ink-soft">Portée estimée</span>
              <span className="text-[15px] font-extrabold text-ink tabular-nums">
                {formatNumber(reach)}{' '}
                <span className="text-[10.5px] font-medium text-muted">destinataires</span>
              </span>
            </div>
            <div className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted">
              <CheckCircle2 className="mt-px size-3 shrink-0 text-emerald-500" />
              {form.audienceMode === 'list'
                ? 'Les désabonnés, les rebonds et les contacts inactifs sont exclus automatiquement (environ 4,5 % de la liste).'
                : form.audienceMode === 'contacts'
                  ? 'Seuls les contacts cochés ci-dessus recevront cet email.'
                  : 'Tous les contacts actifs de votre base recevront cet email.'}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-up space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => update('mode', 'now')}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3.5 text-left transition',
                form.mode === 'now'
                  ? 'border-brand bg-brand-soft/40 ring-2 ring-brand/15'
                  : 'border-line hover:border-line-strong'
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <Send className="size-4" />
              </span>
              <span>
                <span className="block text-[12.5px] font-semibold text-ink">
                  Envoyer maintenant
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">
                  L’envoi démarre immédiatement.
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => update('mode', 'later')}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3.5 text-left transition',
                form.mode === 'later'
                  ? 'border-brand bg-brand-soft/40 ring-2 ring-brand/15'
                  : 'border-line hover:border-line-strong'
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-500">
                <CalendarClock className="size-4" />
              </span>
              <span>
                <span className="block text-[12.5px] font-semibold text-ink">
                  Planifier l’envoi
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">
                  Choisissez la date et l’heure idéales.
                </span>
              </span>
            </button>
          </div>

          {form.mode === 'later' && (
            <Input
              label="Date et heure d’envoi"
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(event) => update('scheduledFor', event.target.value)}
              error={errors.date}
            />
          )}

          <div className="rounded-xl border border-line bg-surface-2/60 p-4">
            <p className="mb-2 text-[10.5px] font-bold tracking-wider text-muted uppercase">
              Récapitulatif
            </p>
            <div className="divide-y divide-line/70">
              {[
                ['Campagne', form.name || '—'],
                ['Objet', form.subject || '—'],
                ['Expéditeur', `${form.senderName} · ${form.senderEmail}`],
                ['Audience', selectedList ? `${selectedList.name} · ${formatNumber(selectedList.count)} contacts` : '—'],
                ['Modèle', selectedTemplate?.name ?? 'Page blanche'],
                [
                  'Envoi',
                  form.mode === 'now'
                    ? 'Immédiat'
                    : form.scheduledFor
                      ? new Date(form.scheduledFor).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—',
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-6 py-1.5">
                  <span className="shrink-0 text-[11.5px] text-muted">{label}</span>
                  <span className="text-right text-[11.5px] font-semibold text-ink">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line p-3.5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
                <FlaskConical className="size-4" />
              </span>
              <Input
                placeholder="vous@exemple.com, autre@exemple.com"
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
                type="text"
                className="h-9"
                wrapperClassName="min-w-0 flex-1"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={sendTest} className="shrink-0">
              Envoyer un test
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
