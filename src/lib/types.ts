export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'

export type ContactStatus = 'active' | 'unsubscribed' | 'bounced'

export interface Campaign {
  id: string
  name: string
  subject: string
  sender: string
  senderEmail: string
  audienceId: string
  status: CampaignStatus
  date: string
  sent: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  templateId?: string
  preview?: string
  body?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  company: string
  tags: string[]
  status: ContactStatus
  listIds: string[]
  opens: number
  clicks: number
  addedAt: string
}

export interface ContactList {
  id: string
  name: string
  description: string
  count: number
  growth: number
  accent: string
}

export type TemplateCategory =
  | 'Newsletter'
  | 'Bienvenue'
  | 'Promotion'
  | 'Événement'
  | 'Produit'
  | 'Transactionnel'

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  updatedAt: string
  usage: number
  accent: string
  layout: 'newsletter' | 'product' | 'welcome' | 'event' | 'minimal' | 'promo'
  subject: string
  preview: string
  body: string
}

export interface TemplatePreview {
  subject: string
  preview: string
  html: string
  text: string
}

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}

export interface AppSettings {
  firstName: string
  lastName: string
  email: string
  company: string
  role: string
  senderName: string
  senderEmail: string
  replyTo: string
  notifWeekly: boolean
  notifCampaign: boolean
  notifContacts: boolean
  notifTips: boolean
}
