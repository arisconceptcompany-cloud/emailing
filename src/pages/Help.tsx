import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  ExternalLink,
  LifeBuoy,
  Mail,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../store/store-context'
import { cn } from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const faqs = [
  {
    question: 'Comment améliorer la délivrabilité de mes emails ?',
    answer:
      'Configurez SPF, DKIM et DMARC sur votre domaine d’envoi, nettoyez régulièrement votre liste des contacts inactifs et évitez les pièces jointes volumineuses. Aris vérifie automatiquement ces bonnes pratiques avant chaque envoi.',
  },
  {
    question: 'Comment importer mes contacts existants ?',
    answer:
      'Rendez-vous dans Contacts puis cliquez sur « Importer un CSV ». Votre fichier doit contenir au minimum une colonne email, et idéalement les colonnes nom et entreprise. Les doublons sont détectés automatiquement.',
  },
  {
    question: 'Puis-je annuler un envoi en cours ?',
    answer:
      'Oui. Ouvrez la campagne concernée depuis la page Campagnes et cliquez sur « Mettre en pause ». Les emails déjà partis ne peuvent pas être rappelés, mais l’envoi des suivants sera suspendu immédiatement.',
  },
  {
    question: 'Comment configurer mon propre domaine d’envoi ?',
    answer:
      'Depuis Paramètres > Domaine d’envoi, ajoutez votre domaine puis créez les trois enregistrements DNS indiqués. La vérification prend généralement quelques minutes après la propagation DNS.',
  },
]

const resources = [
  {
    title: 'Guide de démarrage',
    description: 'De votre premier contact à votre première campagne.',
    icon: BookOpen,
  },
  {
    title: 'Documentation API',
    description: 'Automatisez vos envois avec notre API REST.',
    icon: Code2,
  },
  {
    title: 'Centre de ressources',
    description: 'Modèles, checklists et bonnes pratiques emailing.',
    icon: Sparkles,
  },
]

export function Help() {
  const { toast } = useStore()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Aide & support"
        subtitle="Trouvez rapidement des réponses ou contactez l’équipe Aris — nous répondons en moins de 2 heures."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <LifeBuoy className="size-4 text-brand" />
            <p className="text-[13.5px] font-bold tracking-tight text-ink">Questions fréquentes</p>
          </div>
          <div className="divide-y divide-line/70">
            {faqs.map((faq, index) => {
              const open = openIndex === index
              return (
                <div key={faq.question}>
                  <button
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
                  >
                    <span className="text-[12.5px] font-semibold text-ink">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-muted transition-transform',
                        open && 'rotate-180 text-brand'
                      )}
                    />
                  </button>
                  {open && (
                    <p className="animate-fade-in pb-3.5 text-[11.5px] leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="relative overflow-hidden border-brand/20 p-5">
            <div className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-brand/15 blur-2xl" />
            <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-brand to-violet-500 text-white shadow-lg shadow-brand/25">
              <MessageCircle className="size-5" />
            </span>
            <p className="mt-3 text-[14px] font-bold tracking-tight text-ink">
              Besoin d’un coup de main ?
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              Notre équipe d’experts emailing vous accompagne du lundi au vendredi, de 9 h à 18 h.
            </p>
            <Button
              className="mt-3 w-full"
              icon={<Mail className="size-4" />}
              onClick={() =>
                toast('Message envoyé', {
                  description: 'Un membre de l’équipe vous répondra sous 2 heures ouvrées.',
                })
              }
            >
              Écrire à l’équipe
            </Button>
            <p className="mt-2 text-center text-[9.5px] text-muted">
              support@aris.email · réponse moyenne : 47 min
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-[13px] font-bold tracking-tight text-ink">Ressources</p>
            <div className="mt-2 space-y-1">
              {resources.map((resource) => {
                const Icon = resource.icon
                return (
                  <button
                    key={resource.title}
                    onClick={() =>
                      toast('Ressource bientôt disponible', {
                        description: `« ${resource.title} » sera accessible très prochainement.`,
                        variant: 'info',
                      })
                    }
                    className="group flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition hover:bg-surface-2"
                  >
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted group-hover:text-brand">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11.5px] font-semibold text-ink">
                        {resource.title}
                      </span>
                      <span className="block text-[10px] leading-relaxed text-muted">
                        {resource.description}
                      </span>
                    </span>
                    <ArrowRight className="mt-1.5 size-3 shrink-0 text-muted opacity-0 transition group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
            <button
              onClick={() =>
                toast('Statut des services', {
                  description: 'Tous les services sont opérationnels.',
                  variant: 'info',
                })
              }
              className="mt-2 flex w-full items-center gap-1.5 border-t border-line pt-3 text-[10.5px] font-semibold text-brand"
            >
              <ExternalLink className="size-3" /> Voir la page de statut
            </button>
          </Card>

          <Card className="p-4">
            <p className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">
              État des services
            </p>
            <div className="space-y-2">
              {['Envoi d’emails', 'API & webhooks', 'Tableau de bord'].map((service) => (
                <div key={service} className="flex items-center justify-between text-[10.5px]">
                  <span className="text-muted">{service}</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" /> Opérationnel
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
