import { avatarGradient, cn, initials } from '../../lib/utils'

const sizeMap = {
  xs: 'size-7 text-[10px]',
  sm: 'size-8.5 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-16 text-lg',
}

interface AvatarProps {
  name: string
  size?: keyof typeof sizeMap
  className?: string
  ring?: boolean
}

export function Avatar({ name, size = 'md', className, ring }: AvatarProps) {
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-linear-to-br font-bold text-white select-none',
        avatarGradient(name),
        sizeMap[size],
        ring && 'ring-2 ring-surface',
        className
      )}
      title={name}
    >
      {initials(name)}
    </div>
  )
}
