import { createContext, useContext } from 'react'
import type { NewCampaignInput, NewContactInput } from '../lib/api'
import type {
  Campaign,
  Contact,
  ContactList,
  ContactStatus,
  AppSettings,
  Template,
  TemplateCategory,
  Toast,
} from '../lib/types'

export type Theme = 'light' | 'dark'

export interface ComposerState {
  open: boolean
  templateId?: string
}

export interface StoreValue {
  campaigns: Campaign[]
  contacts: Contact[]
  lists: ContactList[]
  templates: Template[]
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  composer: ComposerState
  openComposer: (templateId?: string) => void
  closeComposer: () => void
  addCampaign: (input: NewCampaignInput) => Promise<Campaign | null>
  duplicateCampaign: (id: string) => Promise<boolean>
  removeCampaign: (id: string) => Promise<boolean>
  toggleCampaignPause: (id: string) => Promise<boolean>
  sendCampaign: (id: string) => Promise<boolean>
  sendTestEmail: (id: string, email: string) => Promise<boolean>
  refreshCampaign: (id: string) => Promise<Campaign | null>
  addContacts: (inputs: NewContactInput[]) => Promise<number | null>
  updateContact: (id: string, input: NewContactInput) => Promise<boolean>
  removeContacts: (ids: string[]) => Promise<boolean>
  setContactsStatus: (ids: string[], status: ContactStatus) => Promise<boolean>
  addList: (name: string, description: string) => Promise<boolean>
  addTemplate: (name: string, category: TemplateCategory) => Promise<boolean>
  settings: AppSettings | null
  updateSettings: (input: Partial<AppSettings>) => Promise<boolean>
  toasts: Toast[]
  toast: (
    title: string,
    options?: { description?: string; variant?: Toast['variant'] }
  ) => void
  dismissToast: (id: string) => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore doit être utilisé dans un StoreProvider')
  }
  return context
}
