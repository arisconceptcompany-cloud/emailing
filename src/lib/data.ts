import type {
  Campaign,
  Contact,
  ContactList,
  Template,
  TemplateCategory,
} from './types'

const now = new Date()

function shiftDays(days: number, hour = 10, minute = 0) {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export const lists: ContactList[] = [
  {
    id: 'l1',
    name: 'Newsletter',
    description: 'Abonnés au digest hebdomadaire et aux annonces éditoriales.',
    count: 8420,
    growth: 12.4,
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'l2',
    name: 'Clients',
    description: 'Comptes actifs sur les offres Pro et Scale.',
    count: 4120,
    growth: 6.8,
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'l3',
    name: 'Prospects',
    description: 'Leads entrants qualifiés par l’équipe commerciale.',
    count: 6310,
    growth: 18.2,
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    id: 'l4',
    name: 'Beta testeurs',
    description: 'Utilisateurs avancés qui testent les nouveautés en avant-première.',
    count: 480,
    growth: 3.1,
    accent: 'from-amber-500 to-orange-400',
  },
  {
    id: 'l5',
    name: 'Événements',
    description: 'Participants aux webinars et meetups Aris.',
    count: 2150,
    growth: 9.6,
    accent: 'from-fuchsia-500 to-pink-500',
  },
]

export const campaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Newsletter #42 — Tendances design 2026',
    subject: 'Les 7 tendances design qui vont marquer 2026 ✨',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l1',
    status: 'sending',
    date: shiftDays(0, 9, 12),
    sent: 5210,
    opened: 2480,
    clicked: 694,
    bounced: 48,
    unsubscribed: 11,
    templateId: 't1',
  },
  {
    id: 'c2',
    name: 'Offre Black Friday — -40 % sur l’année',
    subject: 'Black Friday : votre accès annuel à -40 % 🖤',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l2',
    status: 'sent',
    date: shiftDays(-2, 8, 30),
    sent: 4020,
    opened: 2134,
    clicked: 811,
    bounced: 31,
    unsubscribed: 14,
    templateId: 't3',
  },
  {
    id: 'c3',
    name: 'Bienvenue dans la communauté Aris',
    subject: 'Bienvenue {{prénom}}, voici comment démarrer 🚀',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l3',
    status: 'sent',
    date: shiftDays(-4, 11, 5),
    sent: 6110,
    opened: 3480,
    clicked: 1204,
    bounced: 74,
    unsubscribed: 22,
    templateId: 't2',
  },
  {
    id: 'c4',
    name: 'Invitation — Webinar productivité',
    subject: 'Rendez-vous jeudi : 45 min pour reprendre le contrôle de votre inbox',
    sender: 'Marc Lefèvre',
    senderEmail: 'marc@aris.email',
    audienceId: 'l5',
    status: 'scheduled',
    date: shiftDays(2, 14, 0),
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    templateId: 't4',
  },
  {
    id: 'c5',
    name: 'Étude de cas — Comment Nova scale son emailing',
    subject: 'De 0 à 120 000 abonnés en 8 mois : l’étude de cas Nova',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l1',
    status: 'sent',
    date: shiftDays(-7, 9, 45),
    sent: 8210,
    opened: 4012,
    clicked: 1123,
    bounced: 62,
    unsubscribed: 19,
    templateId: 't1',
  },
  {
    id: 'c6',
    name: 'Nouveautés produit — Novembre',
    subject: 'Nouveau : les workflows d’automatisation arrivent 🎉',
    sender: 'Marc Lefèvre',
    senderEmail: 'marc@aris.email',
    audienceId: 'l2',
    status: 'sent',
    date: shiftDays(-11, 10, 15),
    sent: 3980,
    opened: 1823,
    clicked: 684,
    bounced: 21,
    unsubscribed: 8,
    templateId: 't5',
  },
  {
    id: 'c7',
    name: 'Sondage satisfaction Q4',
    subject: '2 minutes pour nous aider à construire la suite',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l2',
    status: 'draft',
    date: shiftDays(-1, 16, 20),
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    templateId: 't8',
  },
  {
    id: 'c8',
    name: 'Relance panier abandonné',
    subject: 'Vous avez oublié quelque chose ? 👀',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l3',
    status: 'paused',
    date: shiftDays(-3, 18, 0),
    sent: 1840,
    opened: 712,
    clicked: 246,
    bounced: 18,
    unsubscribed: 6,
    templateId: 't3',
  },
  {
    id: 'c9',
    name: 'Les 10 modèles les plus utilisés',
    subject: 'Nos 10 templates préférés pour vos campagnes',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l1',
    status: 'sent',
    date: shiftDays(-14, 9, 0),
    sent: 8040,
    opened: 3860,
    clicked: 964,
    bounced: 58,
    unsubscribed: 21,
    templateId: 't7',
  },
  {
    id: 'c10',
    name: 'Vœux 2026 — Toute l’équipe Aris',
    subject: 'Belle année 2026 de la part de toute l’équipe ✨',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l1',
    status: 'scheduled',
    date: shiftDays(18, 9, 0),
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    templateId: 't6',
  },
  {
    id: 'c11',
    name: 'Onboarding J+3 : vos premiers pas',
    subject: '3 astuces pour envoyer votre première campagne',
    sender: 'Marc Lefèvre',
    senderEmail: 'marc@aris.email',
    audienceId: 'l4',
    status: 'sent',
    date: shiftDays(-18, 11, 30),
    sent: 460,
    opened: 312,
    clicked: 148,
    bounced: 4,
    unsubscribed: 2,
    templateId: 't2',
  },
  {
    id: 'c12',
    name: 'Enquête NPS — clients entreprise',
    subject: 'Une question, une seule : nous recommanderiez-vous ?',
    sender: 'Awa Diop',
    senderEmail: 'hello@aris.email',
    audienceId: 'l2',
    status: 'draft',
    date: shiftDays(-6, 15, 0),
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    templateId: 't8',
  },
]

export const contacts: Contact[] = [
  {
    id: 'p1',
    name: 'Thomas Leroy',
    email: 'thomas.leroy@lumina.fr',
    company: 'Lumina',
    tags: ['client', 'newsletter'],
    status: 'active',
    listIds: ['l1', 'l2'],
    opens: 42,
    clicks: 12,
    addedAt: shiftDays(-42),
  },
  {
    id: 'p2',
    name: 'Camille Moreau',
    email: 'camille@atelier-nova.fr',
    company: 'Atelier Nova',
    tags: ['prospect', 'webinar'],
    status: 'active',
    listIds: ['l3', 'l5'],
    opens: 28,
    clicks: 9,
    addedAt: shiftDays(-31),
  },
  {
    id: 'p3',
    name: 'Youssef Benali',
    email: 'y.benali@kite.studio',
    company: 'Kite Studio',
    tags: ['client'],
    status: 'active',
    listIds: ['l2'],
    opens: 61,
    clicks: 24,
    addedAt: shiftDays(-120),
  },
  {
    id: 'p4',
    name: 'Inès Martin',
    email: 'ines.martin@northwind.io',
    company: 'Northwind',
    tags: ['newsletter'],
    status: 'unsubscribed',
    listIds: ['l1'],
    opens: 14,
    clicks: 2,
    addedAt: shiftDays(-210),
  },
  {
    id: 'p5',
    name: 'Lucas Bernard',
    email: 'lucas@pixelandco.fr',
    company: 'Pixel & Co',
    tags: ['prospect', 'beta'],
    status: 'active',
    listIds: ['l3', 'l4'],
    opens: 37,
    clicks: 15,
    addedAt: shiftDays(-18),
  },
  {
    id: 'p6',
    name: 'Fatou Ndiaye',
    email: 'fatou.ndiaye@maisonbrie.com',
    company: 'Maison Brie',
    tags: ['client', 'ambassadeur'],
    status: 'active',
    listIds: ['l2', 'l5'],
    opens: 88,
    clicks: 41,
    addedAt: shiftDays(-340),
  },
  {
    id: 'p7',
    name: 'Emma Petit',
    email: 'emma.petit@vertuo.fr',
    company: 'Vertuo',
    tags: ['newsletter'],
    status: 'bounced',
    listIds: ['l1'],
    opens: 0,
    clicks: 0,
    addedAt: shiftDays(-96),
  },
  {
    id: 'p8',
    name: 'Noah Dubois',
    email: 'noah@superteam.co',
    company: 'Superteam',
    tags: ['prospect'],
    status: 'active',
    listIds: ['l3'],
    opens: 22,
    clicks: 6,
    addedAt: shiftDays(-12),
  },
  {
    id: 'p9',
    name: 'Sarah Cohen',
    email: 'sarah.cohen@craftly.app',
    company: 'Craftly',
    tags: ['client', 'beta'],
    status: 'active',
    listIds: ['l2', 'l4'],
    opens: 54,
    clicks: 19,
    addedAt: shiftDays(-145),
  },
  {
    id: 'p10',
    name: 'Hugo Laurent',
    email: 'hugo.laurent@datawise.fr',
    company: 'Datawise',
    tags: ['newsletter', 'webinar'],
    status: 'active',
    listIds: ['l1', 'l5'],
    opens: 33,
    clicks: 11,
    addedAt: shiftDays(-58),
  },
  {
    id: 'p11',
    name: 'Amina Traoré',
    email: 'amina@studiomira.com',
    company: 'Studio Mira',
    tags: ['prospect'],
    status: 'active',
    listIds: ['l3'],
    opens: 19,
    clicks: 4,
    addedAt: shiftDays(-9),
  },
  {
    id: 'p12',
    name: 'Léa Rousseau',
    email: 'lea.rousseau@aris.email',
    company: 'Aris',
    tags: ['équipe'],
    status: 'active',
    listIds: ['l2'],
    opens: 102,
    clicks: 57,
    addedAt: shiftDays(-400),
  },
  {
    id: 'p13',
    name: 'Gabriel Simon',
    email: 'g.simon@orbitale.fr',
    company: 'Orbitale',
    tags: ['newsletter'],
    status: 'active',
    listIds: ['l1'],
    opens: 26,
    clicks: 8,
    addedAt: shiftDays(-77),
  },
  {
    id: 'p14',
    name: 'Chloé Michel',
    email: 'chloe@heka.studio',
    company: 'Heka Studio',
    tags: ['client', 'webinar'],
    status: 'active',
    listIds: ['l2', 'l5'],
    opens: 47,
    clicks: 20,
    addedAt: shiftDays(-163),
  },
  {
    id: 'p15',
    name: 'Moussa Sow',
    email: 'moussa.sow@teranga.sn',
    company: 'Teranga',
    tags: ['prospect'],
    status: 'unsubscribed',
    listIds: ['l3'],
    opens: 8,
    clicks: 1,
    addedAt: shiftDays(-88),
  },
  {
    id: 'p16',
    name: 'Manon Lefèvre',
    email: 'manon@frichti.fr',
    company: 'Frichti',
    tags: ['newsletter'],
    status: 'active',
    listIds: ['l1'],
    opens: 31,
    clicks: 13,
    addedAt: shiftDays(-52),
  },
  {
    id: 'p17',
    name: 'Adam Fontaine',
    email: 'adam.fontaine@loop.fr',
    company: 'Loop',
    tags: ['client'],
    status: 'active',
    listIds: ['l2'],
    opens: 69,
    clicks: 32,
    addedAt: shiftDays(-231),
  },
  {
    id: 'p18',
    name: 'Jade Garcia',
    email: 'jade.garcia@mello.fr',
    company: 'Mello',
    tags: ['prospect', 'beta'],
    status: 'active',
    listIds: ['l3', 'l4'],
    opens: 24,
    clicks: 7,
    addedAt: shiftDays(-21),
  },
  {
    id: 'p19',
    name: 'Karim Haddad',
    email: 'karim@zenith.io',
    company: 'Zenith',
    tags: ['newsletter', 'webinar'],
    status: 'bounced',
    listIds: ['l1', 'l5'],
    opens: 0,
    clicks: 0,
    addedAt: shiftDays(-134),
  },
  {
    id: 'p20',
    name: 'Alice Robert',
    email: 'alice.robert@botanique.fr',
    company: 'Botanique',
    tags: ['client'],
    status: 'active',
    listIds: ['l2'],
    opens: 58,
    clicks: 27,
    addedAt: shiftDays(-190),
  },
  {
    id: 'p21',
    name: 'Ethan Mercier',
    email: 'ethan@nook.app',
    company: 'Nook',
    tags: ['prospect'],
    status: 'active',
    listIds: ['l3'],
    opens: 12,
    clicks: 3,
    addedAt: shiftDays(-5),
  },
  {
    id: 'p22',
    name: 'Nadia Bakker',
    email: 'nadia@flowr.nl',
    company: 'Flowr',
    tags: ['newsletter'],
    status: 'active',
    listIds: ['l1'],
    opens: 41,
    clicks: 16,
    addedAt: shiftDays(-65),
  },
  {
    id: 'p23',
    name: 'Louis Girard',
    email: 'louis.girard@cap.fr',
    company: 'Cap',
    tags: ['client', 'beta'],
    status: 'active',
    listIds: ['l2', 'l4'],
    opens: 73,
    clicks: 35,
    addedAt: shiftDays(-275),
  },
  {
    id: 'p24',
    name: 'Zoé Lambert',
    email: 'zoe.lambert@vela.fr',
    company: 'Vela',
    tags: ['prospect'],
    status: 'active',
    listIds: ['l3'],
    opens: 17,
    clicks: 5,
    addedAt: shiftDays(-14),
  },
]

export const templates: Template[] = [
  {
    id: 't1',
    name: 'Le Brief',
    category: 'Newsletter',
    updatedAt: shiftDays(-2),
    usage: 48,
    accent: 'from-indigo-500 to-violet-500',
    layout: 'newsletter',
    subject: 'Les 7 tendances design qui vont marquer 2026 ✨',
    preview: 'Le brief de la semaine, à lire en trois minutes.',
    body: 'Bonjour {{prénom}},\n\nCette semaine, l’équipe d’Aris a retenu sept signaux qui changent la façon de concevoir un produit.\n\nBonne lecture,\nL’équipe Aris',
  },
  {
    id: 't2',
    name: 'Bienvenue à bord',
    category: 'Bienvenue',
    updatedAt: shiftDays(-6),
    usage: 32,
    accent: 'from-emerald-500 to-teal-400',
    layout: 'welcome',
    subject: 'Bienvenue chez Aris, {{prénom}}',
    preview: 'Votre espace est prêt. Voici par où commencer.',
    body: 'Bonjour {{prénom}},\n\nRavi de vous compter parmi nous. Votre compte est actif : importez vos contacts, choisissez un modèle et lancez votre première campagne.',
  },
  {
    id: 't3',
    name: 'Offre éclair',
    category: 'Promotion',
    updatedAt: shiftDays(-9),
    usage: 26,
    accent: 'from-rose-500 to-orange-400',
    layout: 'promo',
    subject: '{{prénom}}, -40 % jusqu’à dimanche soir',
    preview: 'L’offre éclair est réservée aux abonnés. Elle se termine dimanche.',
    body: 'Bonjour {{prénom}},\n\nPendant 72 heures, l’abonnement annuel est à -40 %. Le code est déjà appliqué sur votre espace.',
  },
  {
    id: 't4',
    name: 'Invitation événement',
    category: 'Événement',
    updatedAt: shiftDays(-12),
    usage: 17,
    accent: 'from-fuchsia-500 to-purple-500',
    layout: 'event',
    subject: 'Vous êtes invité·e — meetup Aris',
    preview: '45 minutes, des retours concrets, et une place à votre nom.',
    body: 'Bonjour {{prénom}},\n\nMeetup jeudi à 18:30, en ligne. Délivrabilité, objets qui s’ouvrent, et revue de campagnes réelles.',
  },
  {
    id: 't5',
    name: 'Nouveauté produit',
    category: 'Produit',
    updatedAt: shiftDays(-15),
    usage: 21,
    accent: 'from-sky-500 to-cyan-400',
    layout: 'product',
    subject: 'Nouveau : les modèles s’appliquent en un clic',
    preview: 'Choisissez un design, le contenu suit. Vous n’avez plus qu’à relire.',
    body: 'Bonjour {{prénom}},\n\nQuand vous choisissez un modèle, la campagne reprend son objet, son aperçu et son message. Les variables {{prénom}} et {{entreprise}} sont remplacées pour chaque destinataire.',
  },
  {
    id: 't6',
    name: 'Carte blanche',
    category: 'Transactionnel',
    updatedAt: shiftDays(-21),
    usage: 9,
    accent: 'from-slate-600 to-slate-400',
    layout: 'minimal',
    subject: 'Confirmation de votre demande',
    preview: 'Rien d’autre à faire de votre côté.',
    body: 'Bonjour {{prénom}},\n\nNous avons bien reçu votre demande. Aucune action n’est nécessaire.',
  },
  {
    id: 't7',
    name: 'Digest hebdo',
    category: 'Newsletter',
    updatedAt: shiftDays(-25),
    usage: 38,
    accent: 'from-blue-500 to-indigo-500',
    layout: 'newsletter',
    subject: 'Votre digest : ce qui a bougé cette semaine',
    preview: 'Ouvertures, clics, et la campagne qui a le mieux marché.',
    body: 'Bonjour {{prénom}},\n\nVoici le digest de la semaine pour {{entreprise}}. La campagne la plus ouverte reste en tête grâce à un objet court.',
  },
  {
    id: 't8',
    name: 'Sondage express',
    category: 'Transactionnel',
    updatedAt: shiftDays(-30),
    usage: 6,
    accent: 'from-amber-500 to-orange-400',
    layout: 'minimal',
    subject: 'Votre avis compte : 2 questions',
    preview: 'Cela ne prend qu’une minute.',
    body: 'Bonjour {{prénom}},\n\nAuriez-vous une minute pour répondre à 2 questions ? Votre retour nous aide à améliorer Aris.',
  },
]

export const templateCategories: TemplateCategory[] = [
  'Newsletter',
  'Bienvenue',
  'Promotion',
  'Événement',
  'Produit',
  'Transactionnel',
]

/* ------------------------------------------------------------------ */
/*  Charts                                                             */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildSeries(
  count: number,
  seed: number,
  base: number,
  amplitude: number,
  growth: number
) {
  const random = mulberry32(seed)
  return Array.from({ length: count }, (_, index) => {
    const trend = (index / Math.max(1, count - 1)) * growth
    const wave =
      Math.sin(index / 2.15) * amplitude * 0.34 +
      Math.cos(index / 1.35) * amplitude * 0.16
    const noise = (random() - 0.5) * amplitude * 0.65
    return Math.max(0, Math.round(base + trend + wave + noise))
  })
}

export interface SeriesPoint {
  label: string
  sent: number
  opened: number
  clicked: number
}

function buildPerformance(days: number, seed: number, base: number, growth: number) {
  const sent = buildSeries(days, seed, base, 850, growth)
  return sent.map((value, index) => {
    const openRate = 0.4 + Math.sin(index / 3.1) * 0.055 + (index % 6) * 0.006
    const clicked = Math.round(value * openRate * (0.19 + Math.cos(index / 2.4) * 0.025))
    return {
      label: formatDayLabel(days, index),
      sent: value,
      opened: Math.round(value * openRate),
      clicked,
    }
  })
}

function formatDayLabel(total: number, index: number) {
  const date = new Date(now)
  date.setDate(date.getDate() - (total - 1 - index))
  return `${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}`
}

export const performanceSeries: Record<'30j' | '90j' | '12m', SeriesPoint[]> = {
  '30j': buildPerformance(30, 42, 3100, 1400),
  '90j': Array.from({ length: 13 }, (_, index) => {
    const point = buildPerformance(13, 19, 19800, 5200)[index]
    const date = new Date(now)
    date.setDate(date.getDate() - (12 - index) * 7)
    return {
      ...point,
      label: `${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}`,
    }
  }),
  '12m': Array.from({ length: 12 }, (_, index) => {
    const point = buildPerformance(12, 8, 96000, 44000)[index]
    const date = new Date(now)
    date.setMonth(date.getMonth() - (11 - index))
    return {
      ...point,
      label: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
    }
  }),
}

export const kpiSparklines = {
  sent: [42, 48, 45, 54, 58, 52, 62, 68, 64, 72, 78, 84],
  open: [38, 41, 39, 44, 47, 45, 49, 52, 50, 55, 57, 59],
  click: [12, 14, 13, 15, 17, 16, 18, 19, 18, 21, 22, 24],
  unsub: [18, 17, 19, 16, 15, 16, 14, 13, 14, 12, 11, 10],
}

export interface WeeklyPoint {
  label: string
  sent: number
  openRate: number
  clickRate: number
}

export const weeklySeries: WeeklyPoint[] = Array.from({ length: 12 }, (_, index) => {
  const date = new Date(now)
  date.setDate(date.getDate() - (11 - index) * 7)
  const random = mulberry32(70 + index)
  return {
    label: `${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}`,
    sent: Math.round(24000 + index * 1150 + (random() - 0.5) * 5200),
    openRate: Number((43 + Math.sin(index / 1.9) * 4.2 + index * 0.35).toFixed(1)),
    clickRate: Number((8.6 + Math.cos(index / 2.4) * 1.6 + index * 0.15).toFixed(1)),
  }
})

export const funnelData = [
  { label: 'Emails envoyés', value: 128940, color: 'from-indigo-500 to-violet-500' },
  { label: 'Délivrés', value: 124310, color: 'from-violet-500 to-purple-500' },
  { label: 'Ouverts', value: 61820, color: 'from-sky-500 to-cyan-400' },
  { label: 'Conversions', value: 3860, color: 'from-amber-500 to-orange-400' },
]

export const deviceData = [
  { name: 'Mobile', value: 54, color: '#6d5dfc' },
  { name: 'Ordinateur', value: 33, color: '#22d3ee' },
  { name: 'Tablette', value: 13, color: '#f59e0b' },
]

export const topLinks = [
  { label: 'aris.email/nouveautes', clicks: 4820 },
  { label: 'aris.email/tarifs', clicks: 3610 },
  { label: 'aris.email/blog/tendances-2026', clicks: 2980 },
  { label: 'aris.email/webinar', clicks: 2140 },
  { label: 'aris.email/etude-de-cas-nova', clicks: 1520 },
]

export const hourlyData = [
  8, 6, 4, 3, 3, 5, 12, 28, 54, 78, 92, 74, 61, 58, 83, 90, 76, 52, 34, 22, 17, 13,
  10, 9,
].map((value, hour) => ({ hour: `${String(hour).padStart(2, '0')}h`, value }))

export const recentActivity = [
  {
    id: 'a1',
    type: 'send' as const,
    title: 'Newsletter #42 est en cours d’envoi',
    meta: '5 210 / 8 420 emails délivrés',
    time: shiftDays(0, 9, 12),
  },
  {
    id: 'a2',
    type: 'contact' as const,
    title: '148 nouveaux contacts importés',
    meta: 'Liste « Prospects » · fichier leads-novembre.csv',
    time: shiftDays(0, 8, 40),
  },
  {
    id: 'a3',
    type: 'template' as const,
    title: 'Marc a mis à jour le modèle « Le Brief »',
    meta: 'Modifié pour la campagne de vendredi',
    time: shiftDays(0, 7, 25),
  },
  {
    id: 'a4',
    type: 'alert' as const,
    title: 'Taux de rebond élevé détecté',
    meta: 'Campagne « Relance panier » · 4,2 % de rebonds',
    time: shiftDays(-1, 17, 10),
  },
  {
    id: 'a5',
    type: 'send' as const,
    title: 'Campagne Black Friday envoyée',
    meta: '4 020 destinataires · 53,1 % d’ouverture',
    time: shiftDays(-2, 8, 31),
  },
]

export const monthlyGoal = {
  current: 128940,
  target: 150000,
}
