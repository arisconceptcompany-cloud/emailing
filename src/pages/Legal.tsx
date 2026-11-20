import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'
import { Card } from '../components/ui/Card'

interface LegalProps {
  kind: 'terms' | 'privacy'
}

const content = {
  terms: {
    icon: FileText,
    eyebrow: 'Informations légales',
    title: 'Conditions d’utilisation',
    intro:
      'Ces conditions encadrent l’utilisation de la plateforme Aris emailing. En créant un compte, vous acceptez les points ci-dessous.',
    sections: [
      {
        title: '1. Compte utilisateur',
        body: 'Chaque utilisateur dispose d’un compte personnel identifié par une adresse email et protégé par un mot de passe haché. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités réalisées depuis votre session.',
      },
      {
        title: '2. Utilisation du service',
        body: 'La plateforme permet de gérer des contacts, des modèles et des campagnes d’emailing. Vous vous engagez à ne pas l’utiliser pour envoyer des messages non sollicités, trompeurs ou contraires à la législation en vigueur.',
      },
      {
        title: '3. Configuration d’envoi',
        body: 'Les paramètres SMTP (serveur, identifiant, mot de passe d’application, adresse d’expédition) sont enregistrés dans votre espace. Le mot de passe est chiffré et n’est jamais réaffiché par l’interface. Il vous appartient d’utiliser un compte d’envoi dont vous êtes autorisé à disposer.',
      },
      {
        title: '4. Disponibilité',
        body: 'Le service est fourni « en l’état ». Des interruptions peuvent survenir lors de la maintenance ou en cas de problème technique. Les volumes d’envoi dépendent des limites imposées par votre fournisseur SMTP.',
      },
    ],
  },
  privacy: {
    icon: ShieldCheck,
    eyebrow: 'Protection des données',
    title: 'Politique de confidentialité',
    intro:
      'Cette page explique quelles informations sont traitées par Aris emailing et comment elles sont conservées.',
    sections: [
      {
        title: '1. Données de compte',
        body: 'Nous conservons votre nom, votre adresse email et un mot de passe sous forme hachée (jamais en clair). Les dates d’acceptation des présentes conditions et de la politique de confidentialité sont également enregistrées.'
      ,
      },
      {
        title: '2. Données d’emailing',
        body: 'Les contacts, listes, campagnes, modèles et statistiques d’ouverture que vous saisissez sont stockés dans la base de données de la plateforme et ne sont pas revendus.',
      },
      {
        title: '3. Sessions',
        body: 'Un token de session est créé lors de votre connexion. Seule son empreinte est conservée côté serveur ; la déconnexion la révoque immédiatement. Les sessions expirent automatiquement après 30 jours.',
      },
      {
        title: '4. Vos droits',
        body: 'Vous pouvez demander la modification ou la suppression des données associées à votre compte en contactant l’administrateur de la plateforme.',
      },
    ],
  },
}

export function Legal({ kind }: LegalProps) {
  const page = content[kind]
  const Icon = page.icon

  return (
    <div className="min-h-dvh bg-canvas px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Retour à la connexion
        </Link>

        <Card className="mt-5 p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">
                {page.eyebrow}
              </p>
              <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
                {page.title}
              </h1>
            </div>
          </div>

          <p className="text-[13px] leading-relaxed text-ink-soft">{page.intro}</p>

          <div className="mt-6 space-y-5">
            {page.sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-[13px] font-bold text-ink">{section.title}</h2>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{section.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
            Document indicatif — à faire valider et adapter avant une mise en production ouverte
            au public.
          </p>
        </Card>
      </div>
    </div>
  )
}
