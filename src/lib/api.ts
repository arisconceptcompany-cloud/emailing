import type {
  AppSettings,
  Campaign,
  Contact,
  ContactList,
  ContactStatus,
  Template,
  TemplateCategory,
  TemplatePreview,
} from './types'

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

// En local, l'API est servie en même origine via le proxy Nginx/Vite (/api).
// En production (frontend sur cPanel, API ailleurs), définir VITE_API_URL,
// par exemple : VITE_API_URL=https://api.aris-cc.com
const BASE = `${API_ORIGIN}/api`

export interface NewCampaignInput {
  name: string
  subject: string
  sender: string
  senderEmail: string
  /** Liste ciblée ; null = pas de liste (tous les contacts ou sélection précise). */
  audienceId: string | null
  /** Contacts choisis un par un (prioritaire sur audienceId). */
  contactIds?: string[]
  templateId?: string
  scheduledFor?: string
  preview?: string
  body?: string
}

export interface NewContactInput {
  name: string
  email: string
  company: string
  tags?: string[]
  listIds?: string[]
}

export interface OverviewStats {
  campaigns: {
    total: number
    byStatus: Record<string, number>
    sent: number
    opened: number
    clicked: number
    openRate: number
    clickRate: number
  }
  contacts: {
    total: number
    active: number
    unsubscribed: number
    bounced: number
  }
  lists: number
  templates: number
}

export interface EmailMessage {
  id: string
  campaignId: string
  contactId: string | null
  recipient: string
  recipientName: string
  status: 'queued' | 'sent' | 'failed'
  messageId: string | null
  error: string | null
  createdAt: string
  sentAt: string | null
}

export interface MailStatus {
  connected: boolean
  detail: string
  smtpHost: string
  smtpPort: number
  mailFrom: string
  maxRecipients: number
}

export interface SmtpConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  /** Le mot de passe n'est jamais renvoyé par l'API. */
  smtpPasswordSet: boolean
  smtpStarttls: boolean
  smtpSsl: boolean
  mailFrom: string
  mailFromName: string
  source: 'env' | 'application'
  activeHost: string
  activePort: number
  activeUser: string
  activeMailFrom: string
  activeMailFromName: string
  activeStarttls: boolean
  activeSsl: boolean
}

export interface SmtpConfigUpdate {
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  /** Vide ou absent = conserver le mot de passe déjà enregistré. */
  smtpPassword?: string
  smtpStarttls?: boolean
  smtpSsl?: boolean
  mailFrom?: string
  mailFromName?: string
  clearSmtp?: boolean
}

export interface DnsCheck {
  name: string
  status: 'ok' | 'managed' | 'missing'
  value: string
  detail: string
}

export interface MailDomainStatus {
  domain: string
  mailFrom: string
  provider: string
  status: 'healthy' | 'partial' | 'unconfigured'
  checks: DnsCheck[]
}

export interface TestSendResult {
  status: string
  sent: number
  recipients: string[]
  messageIds: string[]
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new ApiError(0, 'API injoignable. Le backend est-il démarré ?')
  }

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    try {
      const body = (await response.json()) as { detail?: unknown }
      if (typeof body?.detail === 'string') message = body.detail
    } catch {
      /* réponse non JSON */
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  campaigns: {
    list: () => request<Campaign[]>('/campaigns'),
    get: (id: string) => request<Campaign>(`/campaigns/${id}`),
    create: (input: NewCampaignInput) =>
      request<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(input) }),
    duplicate: (id: string) =>
      request<Campaign>(`/campaigns/${id}/duplicate`, { method: 'POST' }),
    togglePause: (id: string) =>
      request<Campaign>(`/campaigns/${id}/toggle-pause`, { method: 'POST' }),
    send: (id: string) => request<Campaign>(`/campaigns/${id}/send`, { method: 'POST' }),
    test: (id: string, email: string) =>
      request<TestSendResult>(`/campaigns/${id}/test`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    messages: (id: string) => request<EmailMessage[]>(`/campaigns/${id}/messages`),
    remove: (id: string) => request<void>(`/campaigns/${id}`, { method: 'DELETE' }),
  },

  contacts: {
    list: () => request<Contact[]>('/contacts'),
    create: (inputs: NewContactInput[]) =>
      request<{ count: number }>('/contacts', { method: 'POST', body: JSON.stringify(inputs) }),
    update: (id: string, input: NewContactInput) =>
      request<Contact>(`/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    remove: (ids: string[]) =>
      request<{ deleted: number }>('/contacts/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    setStatus: (ids: string[], status: ContactStatus) =>
      request<{ updated: number }>('/contacts/bulk-status', {
        method: 'POST',
        body: JSON.stringify({ ids, status }),
      }),
  },

  lists: {
    list: () => request<ContactList[]>('/lists'),
    create: (input: { name: string; description: string }) =>
      request<ContactList>('/lists', { method: 'POST', body: JSON.stringify(input) }),
  },

  templates: {
    list: () => request<Template[]>('/templates'),
    create: (input: { name: string; category: TemplateCategory }) =>
      request<Template>('/templates', { method: 'POST', body: JSON.stringify(input) }),
    preview: (id: string) => request<TemplatePreview>(`/templates/${id}/preview`),
  },

  stats: {
    overview: () => request<OverviewStats>('/stats/overview'),
  },

  mail: {
    status: () => request<MailStatus>('/mail/status'),
    domain: () => request<MailDomainStatus>('/mail/domain'),
    testSmtp: (input: {
      email: string
      smtpHost?: string
      smtpPort?: number
      smtpUser?: string
      smtpPassword?: string
      smtpStarttls?: boolean
      smtpSsl?: boolean
      mailFrom?: string
      mailFromName?: string
    }) =>
      request<TestSendResult>('/mail/test-smtp', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    test: (input: {
      email: string
      subject?: string
      sender?: string
      preview?: string
      body?: string
      templateId?: string
    }) =>
      request<TestSendResult>('/mail/test', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  },

  settings: {
    get: () => request<AppSettings>('/settings'),
    update: (input: Partial<AppSettings>) =>
      request<AppSettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    getSmtp: () => request<SmtpConfig>('/settings/smtp'),
    updateSmtp: (input: SmtpConfigUpdate) =>
      request<SmtpConfig>('/settings/smtp', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
  },
}
