import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ApiError,
  UNAUTHORIZED_EVENT,
  api,
  getToken,
  setToken,
  type AuthUser,
  type LoginInput,
  type NewCampaignInput,
  type NewContactInput,
  type RegisterInput,
} from '../lib/api'
import type {
  AppSettings,
  Campaign,
  Contact,
  ContactList,
  ContactStatus,
  Template,
  TemplateCategory,
  Toast,
} from '../lib/types'
import { uid } from '../lib/utils'
import { StoreContext, type ComposerState, type StoreValue, type Theme } from './store-context'

type LoadStatus = 'loading' | 'ready' | 'error'

const THEME_KEY = 'aris.theme'

function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function LoadingScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
        <p className="text-[12px] font-medium text-muted">Chargement de votre espace…</p>
      </div>
    </div>
  )
}

function ErrorScreen({ onRetry, onLogout }: { onRetry: () => void; onLogout: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="text-[17px] font-extrabold tracking-tight text-ink">
          Connexion à l’API impossible
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          Vérifiez que le backend FastAPI est démarré (par défaut{' '}
          <code className="rounded bg-surface-2 px-1 py-0.5">http://localhost:8000</code>), puis
          réessayez.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-brand px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-brand-strong"
          >
            Réessayer
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:bg-surface-2"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [lists, setLists] = useState<ContactList[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [theme, setThemeState] = useState<Theme>(readTheme)
  const [composer, setComposer] = useState<ComposerState>({ open: false })
  const [toasts, setToasts] = useState<Toast[]>([])
  const [status, setStatus] = useState<LoadStatus>(() => (getToken() ? 'loading' : 'ready'))
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (title: string, options?: { description?: string; variant?: Toast['variant'] }) => {
      const id = uid('toast')
      setToasts((current) => [
        ...current,
        {
          id,
          title,
          description: options?.description,
          variant: options?.variant ?? 'success',
        },
      ])
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id))
      }, 4500)
    },
    []
  )

  const reportError = useCallback(
    (error: unknown, fallback: string) => {
      const description =
        error instanceof ApiError
          ? error.message
          : 'Une erreur inattendue est survenue. Réessayez.'
      toast(fallback, { description, variant: 'error' })
    },
    [toast]
  )

  const load = useCallback(async () => {
    if (!getToken()) {
      setStatus('ready')
      return
    }
    setStatus('loading')
    try {
      const [campaignsData, contactsData, listsData, templatesData, settingsData] =
        await Promise.all([
          api.campaigns.list(),
          api.contacts.list(),
          api.lists.list(),
          api.templates.list(),
          api.settings.get(),
        ])
      setCampaigns(campaignsData)
      setContacts(contactsData)
      setLists(listsData)
      setTemplates(templatesData)
      setSettings(settingsData)
      setStatus('ready')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setToken(null)
        setUser(null)
        setStatus('ready')
        return
      }
      setStatus('error')
    }
  }, [])

  // Au démarrage : on vérifie d'abord la session, puis on charge les données.
  // Sans token, on affiche directement la page de connexion (pas d'écran de chargement).
  useEffect(() => {
    let active = true
    const init = async () => {
      if (!getToken()) {
        setUser(null)
        setStatus('ready')
        return
      }
      try {
        const me = await api.auth.me()
        if (!active) return
        setUser(me)
        await load()
      } catch (error) {
        if (!active) return
        if (error instanceof ApiError && error.status === 401) {
          setToken(null)
          setUser(null)
          setStatus('ready')
        } else {
          setStatus('error')
        }
      }
    }
    void init()
    return () => {
      active = false
    }
  }, [load])

  // Une requête qui reçoit un 401 (token expiré, session révoquée) déconnecte
  // l'utilisateur, même si elle vient d'un composant isolé.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      setStatus('ready')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    setCampaigns([])
    setContacts([])
    setLists([])
    setTemplates([])
    setSettings(null)
    setComposer({ open: false })
    setStatus('ready')
  }, [])

  const signIn = useCallback(
    async (input: LoginInput) => {
      const result = await api.auth.login(input)
      setToken(result.token)
      setUser(result.user)
      await load()
    },
    [load]
  )

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const result = await api.auth.register(input)
      setToken(result.token)
      setUser(result.user)
      await load()
    },
    [load]
  )

  const logout = useCallback(() => {
    if (getToken()) void api.auth.logout().catch(() => undefined)
    clearSession()
  }, [clearSession])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])
  const toggleTheme = useCallback(
    () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    []
  )

  const openComposer = useCallback((templateId?: string) => {
    setComposer({ open: true, templateId })
  }, [])

  const closeComposer = useCallback(() => {
    setComposer((current) => ({ ...current, open: false }))
  }, [])

  const addCampaign = useCallback(
    async (input: NewCampaignInput) => {
      try {
        const campaign = await api.campaigns.create(input)
        setCampaigns((current) => [campaign, ...current])
        return campaign
      } catch (error) {
        reportError(error, 'Création de la campagne impossible')
        return null
      }
    },
    [reportError]
  )

  const duplicateCampaign = useCallback(
    async (id: string) => {
      try {
        const copy = await api.campaigns.duplicate(id)
        setCampaigns((current) => [copy, ...current])
        return true
      } catch (error) {
        reportError(error, 'Duplication de la campagne impossible')
        return false
      }
    },
    [reportError]
  )

  const removeCampaign = useCallback(
    async (id: string) => {
      try {
        await api.campaigns.remove(id)
        setCampaigns((current) => current.filter((campaign) => campaign.id !== id))
        return true
      } catch (error) {
        reportError(error, 'Suppression de la campagne impossible')
        return false
      }
    },
    [reportError]
  )

  const toggleCampaignPause = useCallback(
    async (id: string) => {
      try {
        const updated = await api.campaigns.togglePause(id)
        setCampaigns((current) =>
          current.map((campaign) => (campaign.id === id ? updated : campaign))
        )
        return true
      } catch (error) {
        reportError(error, 'Mise à jour de la campagne impossible')
        return false
      }
    },
    [reportError]
  )

  const sendCampaign = useCallback(
    async (id: string) => {
      try {
        const updated = await api.campaigns.send(id)
        setCampaigns((current) =>
          current.map((campaign) => (campaign.id === id ? updated : campaign))
        )
        return true
      } catch (error) {
        reportError(error, "Lancement de l'envoi impossible")
        return false
      }
    },
    [reportError]
  )

  const sendTestEmail = useCallback(
    async (id: string, email: string) => {
      try {
        await api.campaigns.test(id, email)
        return true
      } catch (error) {
        reportError(error, "Envoi de l'email de test impossible")
        return false
      }
    },
    [reportError]
  )

  const refreshCampaign = useCallback(async (id: string) => {
    try {
      const campaign = await api.campaigns.get(id)
      setCampaigns((current) =>
        current.map((item) => (item.id === id ? campaign : item))
      )
      return campaign
    } catch {
      return null
    }
  }, [])

  const addContacts = useCallback(
    async (inputs: NewContactInput[]) => {
      try {
        const { count } = await api.contacts.create(inputs)
        const [contactsData, listsData] = await Promise.all([
          api.contacts.list(),
          api.lists.list(),
        ])
        setContacts(contactsData)
        setLists(listsData)
        return count
      } catch (error) {
        reportError(error, 'Import des contacts impossible')
        return null
      }
    },
    [reportError]
  )

  const updateContact = useCallback(
    async (id: string, input: NewContactInput) => {
      try {
        const updated = await api.contacts.update(id, input)
        setContacts((current) =>
          current.map((contact) => (contact.id === id ? updated : contact))
        )
        setLists(await api.lists.list())
        return true
      } catch (error) {
        reportError(error, 'Modification du contact impossible')
        return false
      }
    },
    [reportError]
  )

  const removeContacts = useCallback(
    async (ids: string[]) => {
      try {
        await api.contacts.remove(ids)
        const idSet = new Set(ids)
        setContacts((current) => current.filter((contact) => !idSet.has(contact.id)))
        setLists(await api.lists.list())
        return true
      } catch (error) {
        reportError(error, 'Suppression des contacts impossible')
        return false
      }
    },
    [reportError]
  )

  const setContactsStatus = useCallback(
    async (ids: string[], nextStatus: ContactStatus) => {
      try {
        await api.contacts.setStatus(ids, nextStatus)
        const idSet = new Set(ids)
        setContacts((current) =>
          current.map((contact) =>
            idSet.has(contact.id) ? { ...contact, status: nextStatus } : contact
          )
        )
        return true
      } catch (error) {
        reportError(error, 'Mise à jour des contacts impossible')
        return false
      }
    },
    [reportError]
  )

  const addList = useCallback(
    async (name: string, description: string) => {
      try {
        const list = await api.lists.create({ name, description })
        setLists((current) => [...current, list])
        return true
      } catch (error) {
        reportError(error, 'Création de la liste impossible')
        return false
      }
    },
    [reportError]
  )

  const addTemplate = useCallback(
    async (name: string, category: TemplateCategory) => {
      try {
        const template = await api.templates.create({ name, category })
        setTemplates((current) => [template, ...current])
        return true
      } catch (error) {
        reportError(error, 'Création du modèle impossible')
        return false
      }
    },
    [reportError]
  )

  const updateSettings = useCallback(
    async (input: Partial<AppSettings>) => {
      try {
        const updated = await api.settings.update(input)
        setSettings(updated)
        return true
      } catch (error) {
        reportError(error, 'Enregistrement des paramètres impossible')
        return false
      }
    },
    [reportError]
  )

  const value = useMemo<StoreValue>(
    () => ({
      user,
      signIn,
      signUp,
      logout,
      campaigns,
      contacts,
      lists,
      templates,
      theme,
      toggleTheme,
      setTheme,
      composer,
      openComposer,
      closeComposer,
      addCampaign,
      duplicateCampaign,
      removeCampaign,
      toggleCampaignPause,
      sendCampaign,
      sendTestEmail,
      refreshCampaign,
      addContacts,
      updateContact,
      removeContacts,
      setContactsStatus,
      addList,
      addTemplate,
      settings,
      updateSettings,
      toasts,
      toast,
      dismissToast,
    }),
    [
      user,
      signIn,
      signUp,
      logout,
      campaigns,
      contacts,
      lists,
      templates,
      theme,
      toggleTheme,
      setTheme,
      composer,
      openComposer,
      closeComposer,
      addCampaign,
      duplicateCampaign,
      removeCampaign,
      toggleCampaignPause,
      sendCampaign,
      sendTestEmail,
      refreshCampaign,
      addContacts,
      updateContact,
      removeContacts,
      setContactsStatus,
      addList,
      addTemplate,
      settings,
      updateSettings,
      toasts,
      toast,
      dismissToast,
    ]
  )

  if (status === 'loading') return <LoadingScreen />
  if (status === 'error') {
    return <ErrorScreen onRetry={() => void load()} onLogout={logout} />
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
