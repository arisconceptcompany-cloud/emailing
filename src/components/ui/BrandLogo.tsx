import { cn } from '../../lib/utils'

interface BrandLogoProps {
  /** `mark` : monogramme carré (petits emplacements) ; `full` : logo complet. */
  variant?: 'mark' | 'full'
  className?: string
  alt?: string
}

/** Logo officiel Aris, dérivé de public/logo.png. */
export function BrandLogo({
  variant = 'mark',
  className,
  alt = 'Aris',
}: BrandLogoProps) {
  return (
    <img
      src={variant === 'mark' ? '/logo-mark.png' : '/logo-web.png'}
      alt={alt}
      draggable={false}
      className={cn('select-none object-contain', className)}
    />
  )
}
