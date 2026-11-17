import type { ReactNode } from 'react'
import type { CampaignStatus, ContactStatus } from '../../lib/types'
import { campaignStatusMeta, cn, contactStatusMeta } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  className?: string
  dot?: string
}

export function Badge({ children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        className
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dot)} />}
      {children}
    </span>
  )
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const meta = campaignStatusMeta[status]
  return (
    <Badge className={meta.badge} dot={meta.dot}>
      {meta.label}
    </Badge>
  )
}

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const meta = contactStatusMeta[status]
  return (
    <Badge className={meta.badge} dot={meta.dot}>
      {meta.label}
    </Badge>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-muted ring-1 ring-inset ring-line">
      {children}
    </span>
  )
}
