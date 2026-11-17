import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Copy,
  Eye,
  LayoutTemplate,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../store/store-context'
import { templateCategories } from '../lib/data'
import { api } from '../lib/api'
import type { Template, TemplateCategory, TemplatePreview } from '../lib/types'
import { cn, formatNumber, relativeTime } from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { TemplateThumb } from '../components/TemplateThumb'

const categoryTone: Record<TemplateCategory, string> = {
  Newsletter: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
  Bienvenue: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  Promotion: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
  Événement: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300',
  Produit: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  Transactionnel: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
}

export function Templates() {
  const { templates, addTemplate, openComposer, toast } = useStore()
  const navigate = useNavigate()
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<Template | null>(null)
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState<{
    name: string
    category: TemplateCategory
  }>({ name: '', category: 'Newsletter' })
  const [createError, setCreateError] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return templates.filter((template) => {
      const matchesCategory = category === 'all' || template.category === category
      const matchesQuery = !term || template.name.toLowerCase().includes(term)
      return matchesCategory && matchesQuery
    })
  }, [templates, category, query])

  useEffect(() => {
    if (!preview) {
      setPreviewData(null)
      return
    }
    let cancelled = false
    setPreviewLoading(true)
    setPreviewError(false)
    setPreviewData(null)
    api.templates
      .preview(preview.id)
      .then((data) => {
        if (!cancelled) setPreviewData(data)
      })
      .catch(() => {
        if (!cancelled) setPreviewError(true)
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [preview])

  const applyTemplate = (template: Template) => {
    setPreview(null)
    openComposer(template.id)
    navigate('/campagnes')
    toast('Modèle sélectionné', {
      description: `« ${template.name} » est prêt à être utilisé dans votre campagne.`,
      variant: 'info',
    })
  }

  const duplicate = async (template: Template) => {
    const ok = await addTemplate(`${template.name} (copie)`, template.category)
    if (!ok) return
    toast('Modèle dupliqué', {
      description: `Une copie de « ${template.name} » a été créée.`,
    })
    setPreview(null)
  }

  const createTemplate = async () => {
    if (!newTemplate.name.trim()) {
      setCreateError('Donnez un nom à votre modèle.')
      return
    }
    const ok = await addTemplate(newTemplate.name.trim(), newTemplate.category)
    if (!ok) return
    toast('Modèle créé', {
      description: `« ${newTemplate.name} » est disponible dans votre bibliothèque.`,
    })
    setNewTemplate({ name: '', category: 'Newsletter' })
    setCreateError('')
    setCreateOpen(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Modèles"
        subtitle="Une bibliothèque de designs prêts à l’emploi pour envoyer de beaux emails, plus vite."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>
            Nouveau modèle
          </Button>
        }
      />

      <Card className="card-sheen relative overflow-hidden p-4 sm:p-5">
        <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand to-violet-500 text-white shadow-lg shadow-brand/25">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-[13px] font-bold tracking-tight text-ink">
                Des emails cohérents avec votre marque
              </p>
              <p className="mt-0.5 max-w-xl text-[11.5px] leading-relaxed text-muted">
                Tous les modèles respectent les bonnes pratiques de délivrabilité et s’adaptent
                automatiquement aux mobiles. Personnalisez-les en un clic.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-line bg-surface px-2.5 py-1 text-[10.5px] font-semibold text-muted">
            <LayoutTemplate className="size-3" />
            {templates.length} modèles disponibles
          </span>
        </div>
      </Card>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto [contain:paint]">
          <button
            onClick={() => setCategory('all')}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition',
              category === 'all'
                ? 'bg-brand text-white shadow-sm shadow-brand/25'
                : 'bg-surface text-muted ring-1 ring-line hover:text-ink'
            )}
          >
            Tous
          </button>
          {templateCategories.map((item) => {
            const count = templates.filter((template) => template.category === item).length
            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition',
                  category === item
                    ? 'bg-brand text-white shadow-sm shadow-brand/25'
                    : 'bg-surface text-muted ring-1 ring-line hover:text-ink'
                )}
              >
                {item}
                <span
                  className={cn(
                    'rounded text-[9px] font-bold tabular-nums',
                    category === item ? 'text-white/70' : 'text-muted/70'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative min-w-0 sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un modèle…"
            className="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-[12.5px] transition outline-none placeholder:text-muted/70 hover:border-line-strong focus:border-brand/60 focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <span className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-muted">
            <LayoutTemplate className="size-5" />
          </span>
          <p className="text-[13px] font-semibold text-ink">Aucun modèle trouvé</p>
          <p className="max-w-xs text-[11.5px] leading-relaxed text-muted">
            Essayez une autre catégorie ou créez un nouveau modèle vierge.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-1"
            icon={<Plus className="size-3.5" />}
            onClick={() => setCreateOpen(true)}
          >
            Créer un modèle
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((template, index) => (
            <Card
              key={template.id}
              className="group animate-fade-up overflow-hidden p-2.5 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
              style={{ animationDelay: `${Math.min(index * 45, 260)}ms` }}
            >
              <div className="relative">
                <TemplateThumb template={template} className="h-40" chrome={false} />
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-slate-950/40 opacity-0 backdrop-blur-[1px] transition group-hover:opacity-100">
                  <button
                    onClick={() => setPreview(template)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 shadow-sm transition hover:bg-white"
                  >
                    <Eye className="size-3.5" /> Aperçu
                  </button>
                  <button
                    onClick={() => applyTemplate(template)}
                    className="flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    <ArrowRight className="size-3.5" /> Utiliser
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2 px-1 pt-3 pb-1">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-bold text-ink">{template.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    Modifié {relativeTime(template.updatedAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold',
                    categoryTone[template.category]
                  )}
                >
                  {template.category}
                </span>
              </div>

              <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
                <span className="text-[10px] text-muted">
                  {formatNumber(template.usage)} utilisation
                  {template.usage > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setPreview(template)}
                    aria-label={`Aperçu de ${template.name}`}
                    className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <button
                    onClick={() => duplicate(template)}
                    aria-label={`Dupliquer ${template.name}`}
                    className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        size="lg"
        title={preview?.name}
        description={
          preview
            ? `${preview.category} · mis à jour ${relativeTime(preview.updatedAt)}`
            : undefined
        }
        footer={
          <>
            {preview && (
              <Button
                variant="secondary"
                icon={<Copy className="size-4" />}
                onClick={() => duplicate(preview)}
                className="sm:mr-auto"
              >
                Dupliquer
              </Button>
            )}
            <Button variant="secondary" onClick={() => setPreview(null)}>
              Fermer
            </Button>
            {preview && (
              <Button
                icon={<ArrowRight className="size-4" />}
                onClick={() => applyTemplate(preview)}
              >
                Utiliser ce modèle
              </Button>
            )}
          </>
        }
      >
        {preview && (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface-2/40 p-3">
              <p className="text-[9.5px] font-semibold tracking-wide text-muted uppercase">
                Objet de l’email
              </p>
              <p className="mt-1 text-[13px] font-semibold text-ink">
                {previewData?.subject || preview.subject}
              </p>
              {(previewData?.preview || preview.preview) && (
                <p className="mt-1 text-[11px] text-muted">
                  {previewData?.preview || preview.preview}
                </p>
              )}
            </div>
            <div className="bg-dots rounded-2xl border border-line bg-surface-2/60 p-4 sm:p-6">
              <div className="mx-auto max-w-[600px] overflow-hidden rounded-xl bg-white shadow-lift">
                {previewLoading ? (
                  <div className="grid h-[420px] place-items-center">
                    <span className="size-6 animate-spin rounded-full border-2 border-line border-t-brand" />
                  </div>
                ) : previewData ? (
                  <iframe
                    title={`Aperçu de ${preview.name}`}
                    srcDoc={previewData.html}
                    sandbox=""
                    className="h-[420px] w-full sm:h-[480px]"
                  />
                ) : (
                  <div className="grid h-[420px] place-items-center px-6 text-center">
                    <p className="text-[11.5px] text-muted">
                      {previewError
                        ? 'Aperçu indisponible pour le moment.'
                        : 'Chargement de l’aperçu…'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Catégorie', value: preview.category },
                { label: 'Utilisations', value: formatNumber(preview.usage) },
                { label: 'Dernière édition', value: relativeTime(preview.updatedAt) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-line bg-surface-2/40 p-2.5"
                >
                  <p className="text-[9.5px] font-semibold tracking-wide text-muted uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11.5px] font-semibold text-ink">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-2/40 p-3 text-[10.5px] leading-relaxed text-muted">
              <Sparkles className="mt-px size-3.5 shrink-0 text-brand" />
              Ce modèle est optimisé pour les clients mail du marché : largeur 600 px, contrastes
              accessibles et version texte automatique. Vous pourrez le personnaliser après
              l’avoir sélectionné.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau modèle"
        description="Créez un modèle vierge et personnalisez-le à votre image."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createTemplate} icon={<Plus className="size-4" />}>
              Créer le modèle
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Input
            label="Nom du modèle"
            placeholder="Ex. Lancement produit"
            value={newTemplate.name}
            onChange={(event) => {
              setNewTemplate((current) => ({ ...current, name: event.target.value }))
              setCreateError('')
            }}
            error={createError}
          />
          <Select
            label="Catégorie"
            value={newTemplate.category}
            onChange={(event) =>
              setNewTemplate((current) => ({
                ...current,
                category: event.target.value as TemplateCategory,
              }))
            }
          >
            {templateCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <div className="flex items-start gap-2 rounded-xl border border-line bg-surface-2/50 p-3 text-[10.5px] leading-relaxed text-muted">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand" />
            Vous pourrez personnaliser les couleurs, les polices et chaque bloc de contenu depuis
            l’éditeur de campagne.
          </div>
        </div>
      </Modal>
    </div>
  )
}
