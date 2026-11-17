import { useMemo, useRef, useState } from 'react'
import {
  Building2,
  Check,
  Download,
  FileText,
  ListFilter,
  MailOpen,
  MousePointerClick,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UploadCloud,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react'
import { useStore } from '../store/store-context'
import type { Contact, ContactStatus } from '../lib/types'
import {
  cn,
  formatDate,
  formatNumber,
  formatShortDate,
  percent,
} from '../lib/utils'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { ContactStatusBadge, Tag } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Progress } from '../components/ui/Progress'

interface ImportRow {
  name: string
  email: string
  company: string
}

function prettify(value: string) {
  return value
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function parseCsv(text: string): ImportRow[] {
  const rows: ImportRow[] = []
  const seen = new Set<string>()

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim()
    if (!line) return
    const cells = line
      .split(/[,;\t]/)
      .map((cell) => cell.trim().replace(/^["']|["']$/g, ''))

    if (
      index === 0 &&
      cells.some((cell) => /^(email|e-mail|mail|adresse e-mail)$/i.test(cell))
    ) {
      return
    }

    const emailIndex = cells.findIndex((cell) => /^\S+@\S+\.\S+$/.test(cell))
    if (emailIndex === -1) return

    const email = cells[emailIndex].toLowerCase()
    if (seen.has(email)) return
    seen.add(email)

    const rest = cells.filter((_, cellIndex) => cellIndex !== emailIndex)
    const rawName = rest[0] && !rest[0].includes('@') ? rest[0] : email.split('@')[0]
    rows.push({
      name: prettify(rawName) || email.split('@')[0],
      email,
      company: rest[1] ?? '',
    })
  })

  return rows
}

function MiniStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof Users
  tone: string
}) {
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', tone)}>
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[10.5px] font-semibold text-muted">{label}</p>
        <p className="text-[17px] leading-tight font-extrabold tracking-tight text-ink tabular-nums">
          {formatNumber(value)}
        </p>
      </div>
    </Card>
  )
}

export function Contacts() {
  const {
    contacts,
    lists,
    addContacts,
    updateContact,
    removeContacts,
    setContactsStatus,
    addList,
    toast,
  } = useStore()

  const [tab, setTab] = useState<'contacts' | 'lists'>('contacts')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContactStatus>('all')
  const [listFilter, setListFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [importOpen, setImportOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)

  const [fileName, setFileName] = useState('')
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [importError, setImportError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [importList, setImportList] = useState(lists[0]?.id ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    company: '',
    tags: '',
    listId: lists[0]?.id ?? '',
  })
  const [contactErrors, setContactErrors] = useState<{ name?: string; email?: string }>({})

  const [editing, setEditing] = useState<Contact | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    company: '',
    tags: '',
    listId: '',
  })
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string }>({})

  const [newList, setNewList] = useState({ name: '', description: '' })
  const [listError, setListError] = useState('')

  const counts = useMemo(
    () => ({
      total: contacts.length,
      active: contacts.filter((contact) => contact.status === 'active').length,
      unsubscribed: contacts.filter((contact) => contact.status === 'unsubscribed').length,
      bounced: contacts.filter((contact) => contact.status === 'bounced').length,
    }),
    [contacts]
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return contacts.filter((contact) => {
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
      const matchesList = listFilter === 'all' || contact.listIds.includes(listFilter)
      const matchesQuery =
        !term ||
        `${contact.name} ${contact.email} ${contact.company}`.toLowerCase().includes(term)
      return matchesStatus && matchesList && matchesQuery
    })
  }, [contacts, query, statusFilter, listFilter])

  const allSelected = filtered.length > 0 && filtered.every((contact) => selected.has(contact.id))

  const toggleOne = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((current) => {
      if (allSelected) {
        const next = new Set(current)
        filtered.forEach((contact) => next.delete(contact.id))
        return next
      }
      const next = new Set(current)
      filtered.forEach((contact) => next.add(contact.id))
      return next
    })
  }

  const bulkStatus = async (status: ContactStatus) => {
    const ids = Array.from(selected)
    const ok = await setContactsStatus(ids, status)
    if (!ok) return
    setSelected(new Set())
    toast(status === 'unsubscribed' ? 'Contacts désabonnés' : 'Contacts réactivés', {
      description: `${ids.length} contact${ids.length > 1 ? 's' : ''} mis à jour.`,
      variant: 'info',
    })
  }

  const bulkRemove = async () => {
    const ids = Array.from(selected)
    const ok = await removeContacts(ids)
    if (!ok) return
    setSelected(new Set())
    toast('Contacts supprimés', {
      description: `${ids.length} contact${ids.length > 1 ? 's' : ''} retiré${ids.length > 1 ? 's' : ''} de votre base.`,
      variant: 'info',
    })
  }

  const openImport = () => {
    setFileName('')
    setImportRows([])
    setImportError('')
    setImportList(lists[0]?.id ?? '')
    setImportOpen(true)
  }

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setImportError('')
    try {
      const text = await file.text()
      const parsed = parseCsv(text)
      setImportRows(parsed)
      if (!parsed.length) {
        setImportError('Aucun email valide n’a été trouvé dans ce fichier.')
      }
    } catch {
      setImportError('Impossible de lire ce fichier. Vérifiez qu’il s’agit bien d’un CSV.')
    }
  }

  const confirmImport = async () => {
    const count = await addContacts(
      importRows.map((row) => ({
        name: row.name,
        email: row.email,
        company: row.company,
        tags: ['import'],
        listIds: importList ? [importList] : [],
      }))
    )
    if (count === null) return
    const targetList = lists.find((list) => list.id === importList)
    toast('Import terminé', {
      description: `${count} contacts ajoutés${targetList ? ` à la liste « ${targetList.name} »` : ''}.`,
    })
    setImportOpen(false)
  }

  const downloadTemplate = () => {
    const csv =
      'email,nom,entreprise\nawa.diop@exemple.com,Awa Diop,Aris\nthomas.leroy@lumina.fr,Thomas Leroy,Lumina\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modele-contacts.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const submitContact = async () => {
    const errors: typeof contactErrors = {}
    if (!newContact.name.trim()) errors.name = 'Le nom est requis.'
    if (!/^\S+@\S+\.\S+$/.test(newContact.email)) errors.email = 'Email invalide.'
    setContactErrors(errors)
    if (Object.keys(errors).length) return

    const count = await addContacts([
      {
        name: newContact.name.trim(),
        email: newContact.email.trim().toLowerCase(),
        company: newContact.company.trim(),
        tags: newContact.tags
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        listIds: newContact.listId ? [newContact.listId] : [],
      },
    ])
    if (count === null) return
    toast('Contact ajouté', { description: `${newContact.name} fait désormais partie de vos contacts.` })
    setNewContact({
      name: '',
      email: '',
      company: '',
      tags: '',
      listId: lists[0]?.id ?? '',
    })
    setAddOpen(false)
  }

  const openEdit = (contact: Contact) => {
    setEditing(contact)
    setEditForm({
      name: contact.name,
      email: contact.email,
      company: contact.company,
      tags: contact.tags.join(', '),
      listId: contact.listIds[0] ?? '',
    })
    setEditErrors({})
  }

  const submitEdit = async () => {
    if (!editing) return
    const errors: typeof editErrors = {}
    if (!editForm.name.trim()) errors.name = 'Le nom est requis.'
    if (!/^\S+@\S+\.\S+$/.test(editForm.email)) errors.email = 'Email invalide.'
    setEditErrors(errors)
    if (Object.keys(errors).length) return

    const ok = await updateContact(editing.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
      company: editForm.company.trim(),
      tags: editForm.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      listIds: editForm.listId ? [editForm.listId] : [],
    })
    if (!ok) return
    toast('Contact modifié', {
      description: `${editForm.name.trim()} a été mis à jour.`,
    })
    setEditing(null)
  }

  const submitList = async () => {
    if (!newList.name.trim()) {
      setListError('Le nom de la liste est requis.')
      return
    }
    const ok = await addList(newList.name.trim(), newList.description.trim())
    if (!ok) return
    toast('Liste créée', { description: `« ${newList.name} » est prête à recevoir des contacts.` })
    setNewList({ name: '', description: '' })
    setListError('')
    setListOpen(false)
  }

  const showContactsOfList = (listId: string) => {
    setListFilter(listId)
    setStatusFilter('all')
    setQuery('')
    setTab('contacts')
  }

  const maxListCount = Math.max(1, ...lists.map((list) => list.count))

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contacts"
        subtitle="Centralisez vos audiences, segmentez vos contacts et gardez une base saine."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Upload className="size-4" />}
              onClick={openImport}
            >
              Importer un CSV
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)}>
              Ajouter un contact
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <MiniStat
          label="Contacts au total"
          value={counts.total}
          icon={Users}
          tone="bg-brand-soft text-brand-strong"
        />
        <MiniStat
          label="Actifs"
          value={counts.active}
          icon={UserCheck}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <MiniStat
          label="Rebonds"
          value={counts.bounced}
          icon={X}
          tone="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
      </div>

      <div className="flex w-fit items-center gap-1 rounded-xl border border-line bg-surface p-1">
        {(
          [
            { id: 'contacts', label: 'Contacts', count: contacts.length },
            { id: 'lists', label: 'Listes', count: lists.length },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition',
              tab === item.id
                ? 'bg-brand text-white shadow-sm shadow-brand/25'
                : 'text-muted hover:bg-surface-2 hover:text-ink'
            )}
          >
            {item.label}
            <span
              className={cn(
                'rounded-md px-1 py-px text-[9.5px] font-bold tabular-nums',
                tab === item.id ? 'bg-white/20' : 'bg-surface-2 text-muted'
              )}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'contacts' ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-line p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-64">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nom, email ou entreprise…"
                  className="h-9.5 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-[12.5px] transition outline-none placeholder:text-muted/70 hover:border-line-strong focus:border-brand/60 focus:ring-4 focus:ring-brand/10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as typeof statusFilter)
                }
                wrapperClassName="sm:w-36"
                className="h-9.5"
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="unsubscribed">Désabonnés</option>
                <option value="bounced">Rebonds</option>
              </Select>
              <Select
                value={listFilter}
                onChange={(event) => setListFilter(event.target.value)}
                wrapperClassName="sm:w-40"
                className="h-9.5"
                aria-label="Filtrer par liste"
              >
                <option value="all">Toutes les listes</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </Select>
            </div>
            <p className="flex items-center gap-1 text-[10.5px] text-muted">
              <ListFilter className="size-3" />
              {filtered.length} contact{filtered.length > 1 ? 's' : ''} affiché
              {filtered.length > 1 ? 's' : ''}
            </p>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-col gap-2 border-b border-brand/20 bg-brand-soft/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-strong">
                <Check className="size-3.5" />
                {selected.size} contact{selected.size > 1 ? 's' : ''} sélectionné
                {selected.size > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<UserMinus className="size-3.5" />}
                  onClick={() => bulkStatus('unsubscribed')}
                >
                  Désabonner
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<UserCheck className="size-3.5" />}
                  onClick={() => bulkStatus('active')}
                >
                  Réactiver
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                  icon={<Trash2 className="size-3.5" />}
                  onClick={bulkRemove}
                >
                  Supprimer
                </Button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="grid size-7 place-items-center rounded-lg text-brand-strong transition hover:bg-white/40"
                  aria-label="Annuler la sélection"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto [contain:paint]">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-[10px] font-bold tracking-wider text-muted uppercase">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Tout sélectionner"
                      className="size-3.5 cursor-pointer rounded border-line accent-brand"
                    />
                  </th>
                  <th className="px-3 py-2.5 font-bold">Contact</th>
                  <th className="px-3 py-2.5 font-bold">Entreprise</th>
                  <th className="px-3 py-2.5 font-bold">Tags</th>
                  <th className="px-3 py-2.5 font-bold">Statut</th>
                  <th className="px-3 py-2.5 font-bold">Engagement</th>
                  <th className="px-3 py-2.5 font-bold">Ajouté le</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact: Contact) => (
                  <tr
                    key={contact.id}
                    className={cn(
                      'group border-b border-line/60 transition last:border-0 hover:bg-surface-2/50',
                      selected.has(contact.id) && 'bg-brand-soft/30'
                    )}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(contact.id)}
                        onChange={() => toggleOne(contact.id)}
                        aria-label={`Sélectionner ${contact.name}`}
                        className="size-3.5 cursor-pointer rounded border-line accent-brand"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={contact.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold text-ink">
                            {contact.name}
                          </p>
                          <p className="truncate text-[10.5px] text-muted">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-[11.5px] text-ink-soft">
                        <Building2 className="size-3 text-muted/70" />
                        {contact.company}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex max-w-[160px] flex-wrap gap-1">
                        {contact.tags.slice(0, 2).map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                        {contact.tags.length > 2 && (
                          <Tag>+{contact.tags.length - 2}</Tag>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ContactStatusBadge status={contact.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3 text-[10.5px] text-muted">
                        <span className="flex items-center gap-1" title="Ouvertures">
                          <MailOpen className="size-3" /> {contact.opens}
                        </span>
                        <span className="flex items-center gap-1" title="Clics">
                          <MousePointerClick className="size-3" /> {contact.clicks}
                        </span>
                      </div>
                      <div className="mt-1 flex w-24 gap-0.5">
                        <span className="h-1 flex-1 rounded-full bg-surface-3">
                          <span
                            className="block h-full rounded-full bg-brand"
                            style={{ width: `${Math.min(100, percent(contact.opens, 120))}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[11px] text-muted">{formatShortDate(contact.addedAt)}</p>
                      <p className="text-[9.5px] text-muted/70">{formatDate(contact.addedAt)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                        <button
                          onClick={() => openEdit(contact)}
                          aria-label="Modifier le contact"
                          className="grid size-7.5 place-items-center rounded-lg text-muted transition hover:bg-surface-3 hover:text-ink"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setContactsStatus(
                              [contact.id],
                              contact.status === 'unsubscribed' ? 'active' : 'unsubscribed'
                            )
                            toast(
                              contact.status === 'unsubscribed'
                                ? 'Contact réactivé'
                                : 'Contact désabonné',
                              { description: contact.email, variant: 'info' }
                            )
                          }}
                          aria-label={
                            contact.status === 'unsubscribed'
                              ? 'Réactiver le contact'
                              : 'Désabonner le contact'
                          }
                          className="grid size-7.5 place-items-center rounded-lg text-muted transition hover:bg-surface-3 hover:text-ink"
                        >
                          {contact.status === 'unsubscribed' ? (
                            <UserCheck className="size-3.5" />
                          ) : (
                            <UserMinus className="size-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            removeContacts([contact.id])
                            toast('Contact supprimé', {
                              description: contact.email,
                              variant: 'info',
                            })
                          }}
                          aria-label="Supprimer le contact"
                          className="grid size-7.5 place-items-center rounded-lg text-muted transition hover:bg-rose-500/10 hover:text-rose-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                <span className="grid size-10 place-items-center rounded-2xl bg-surface-2 text-muted">
                  <Users className="size-4.5" />
                </span>
                <p className="text-[13px] font-semibold text-ink">Aucun contact trouvé</p>
                <p className="text-[11.5px] text-muted">
                  Ajustez vos filtres ou importez de nouveaux contacts.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-1"
                  icon={<Upload className="size-3.5" />}
                  onClick={openImport}
                >
                  Importer un CSV
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lists.map((list) => (
            <Card key={list.id} className="relative overflow-hidden p-4">
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-linear-to-r', list.accent)} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-xl bg-linear-to-br text-white shadow-sm',
                      list.accent
                    )}
                  >
                    <Users className="size-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold tracking-tight text-ink">{list.name}</p>
                    <p className="text-[10px] text-muted">Liste de contacts</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                  +{list.growth.toFixed(1).replace('.', ',')} %
                </span>
              </div>
              <p className="mt-2.5 line-clamp-2 h-8 text-[11px] leading-relaxed text-muted">
                {list.description}
              </p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-[20px] leading-none font-extrabold tracking-tight text-ink tabular-nums">
                    {formatNumber(list.count)}
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-muted">contacts</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => showContactsOfList(list.id)}
                >
                  Voir les contacts
                </Button>
              </div>
              <Progress value={(list.count / maxListCount) * 100} className="mt-3" />
            </Card>
          ))}

          <button
            onClick={() => setListOpen(true)}
            className="flex min-h-[196px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface/50 p-4 text-muted transition hover:border-brand/40 hover:bg-brand-soft/20 hover:text-brand-strong"
          >
            <span className="grid size-10 place-items-center rounded-xl border border-line bg-surface">
              <Plus className="size-4.5" />
            </span>
            <span className="text-[12px] font-semibold">Créer une liste</span>
            <span className="max-w-[180px] text-center text-[10.5px] leading-relaxed text-muted">
              Regroupez vos contacts par segment, offre ou événement.
            </span>
          </button>
        </div>
      )}

      {/* Import CSV */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importer des contacts"
        description="Ajoutez vos contacts depuis un fichier CSV (email, nom, entreprise)."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={downloadTemplate} icon={<Download className="size-4" />}>
              Modèle CSV
            </Button>
            <Button variant="secondary" onClick={() => setImportOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmImport} disabled={!importRows.length}>
              Importer {importRows.length ? formatNumber(importRows.length) : ''} contact
              {importRows.length > 1 ? 's' : ''}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              const file = event.dataTransfer.files?.[0]
              if (file) void handleFile(file)
            }}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition',
              dragging
                ? 'border-brand bg-brand-soft/50'
                : 'border-line bg-surface-2/40 hover:border-line-strong'
            )}
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-surface text-brand shadow-sm">
              <UploadCloud className="size-5" />
            </span>
            <p className="mt-2.5 text-[12.5px] font-semibold text-ink">
              {fileName || 'Glissez votre fichier CSV ici'}
            </p>
            <p className="mt-0.5 text-[10.5px] text-muted">
              ou sélectionnez un fichier depuis votre ordinateur
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFile(file)
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => fileInputRef.current?.click()}
            >
              Parcourir les fichiers
            </Button>
          </div>

          {importError && (
            <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-[11.5px] font-medium text-rose-600 dark:text-rose-400">
              {importError}
            </p>
          )}

          {importRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <FileText className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-[11.5px] font-medium text-ink">
                  <span className="font-bold">{importRows.length}</span> contacts valides détectés
                  dans <span className="font-semibold">{fileName}</span>
                </p>
              </div>

              <Select
                label="Ajouter à la liste"
                value={importList}
                onChange={(event) => setImportList(event.target.value)}
              >
                <option value="">Sans liste</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} · {formatNumber(list.count)} contacts
                  </option>
                ))}
              </Select>

              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-surface-2/60 text-[9.5px] font-bold tracking-wider text-muted uppercase">
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Entreprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.slice(0, 4).map((row) => (
                      <tr key={row.email} className="border-b border-line/60 last:border-0">
                        <td className="px-3 py-2 text-[11.5px] font-medium text-ink">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted">{row.email}</td>
                        <td className="px-3 py-2 text-[11px] text-muted">
                          {row.company || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importRows.length > 4 && (
                  <p className="border-t border-line bg-surface-2/40 px-3 py-1.5 text-[10px] text-muted">
                    + {importRows.length - 4} autres contacts
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Ajouter un contact */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter un contact"
        description="Renseignez les informations de votre nouveau contact."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitContact} icon={<Plus className="size-4" />}>
              Ajouter le contact
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom complet"
              placeholder="Ex. Awa Diop"
              value={newContact.name}
              onChange={(event) =>
                setNewContact((current) => ({ ...current, name: event.target.value }))
              }
              error={contactErrors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="awa@exemple.com"
              value={newContact.email}
              onChange={(event) =>
                setNewContact((current) => ({ ...current, email: event.target.value }))
              }
              error={contactErrors.email}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Entreprise"
              placeholder="Ex. Aris"
              value={newContact.company}
              onChange={(event) =>
                setNewContact((current) => ({ ...current, company: event.target.value }))
              }
            />
            <Select
              label="Liste"
              value={newContact.listId}
              onChange={(event) =>
                setNewContact((current) => ({ ...current, listId: event.target.value }))
              }
            >
              <option value="">Sans liste</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Tags"
            placeholder="client, newsletter, vip"
            value={newContact.tags}
            onChange={(event) =>
              setNewContact((current) => ({ ...current, tags: event.target.value }))
            }
            hint="Séparez plusieurs tags par des virgules."
          />
        </div>
      </Modal>

      {/* Modifier un contact */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Modifier le contact"
        description="Mettez à jour les informations de ce contact."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button onClick={submitEdit} icon={<Check className="size-4" />}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom complet"
              placeholder="Ex. Awa Diop"
              value={editForm.name}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, name: event.target.value }))
              }
              error={editErrors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="awa@exemple.com"
              value={editForm.email}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, email: event.target.value }))
              }
              error={editErrors.email}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Entreprise"
              placeholder="Ex. Aris"
              value={editForm.company}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, company: event.target.value }))
              }
            />
            <Select
              label="Liste"
              value={editForm.listId}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, listId: event.target.value }))
              }
            >
              <option value="">Sans liste</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Tags"
            placeholder="client, newsletter, vip"
            value={editForm.tags}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, tags: event.target.value }))
            }
            hint="Séparez plusieurs tags par des virgules."
          />
        </div>
      </Modal>

      {/* Créer une liste */}
      <Modal
        open={listOpen}
        onClose={() => setListOpen(false)}
        title="Créer une liste"
        description="Une liste vous permet de cibler un segment précis de contacts."
        footer={
          <>
            <Button variant="secondary" onClick={() => setListOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitList} icon={<Plus className="size-4" />}>
              Créer la liste
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Input
            label="Nom de la liste"
            placeholder="Ex. Clients entreprise"
            value={newList.name}
            onChange={(event) => {
              setNewList((current) => ({ ...current, name: event.target.value }))
              setListError('')
            }}
            error={listError}
          />
          <Input
            label="Description"
            placeholder="À quoi sert cette liste ?"
            value={newList.description}
            onChange={(event) =>
              setNewList((current) => ({ ...current, description: event.target.value }))
            }
          />
          <div className="flex items-start gap-2 rounded-xl border border-line bg-surface-2/50 p-3 text-[10.5px] leading-relaxed text-muted">
            <Users className="mt-px size-3.5 shrink-0 text-brand" />
            Vous pourrez ajouter des contacts à cette liste lors de l’import ou depuis la fiche
            de chaque contact.
          </div>
        </div>
      </Modal>
    </div>
  )
}
