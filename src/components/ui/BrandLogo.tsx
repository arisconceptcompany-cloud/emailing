import { cn } from '../../lib/utils'

interface BrandLogoProps {
  /** `mark` : monogramme carré (petits emplacements) ; `full` : logo complet. */
  variant?: 'mark' | 'full'
  /** `white` : version monochrome pour les fonds sombres ou colorés. */
  tone?: 'color' | 'white'
  className?: string
  alt?: string
}

const sources = {
  'mark-color': '/logo-mark.png',
  'mark-white': '/logo-mark-white.png',
  'full-color': '/logo-web.png',
  'full-white': '/logo-white.png',
}

/** Logo officiel Aris, dérivé de public/logo.png. */
export function BrandLogo({
  variant = 'mark',
  tone = 'color',
  className,
  alt = 'Aris',
}: BrandLogoProps) {
  return (
    <img
      src={sources[`${variant}-${tone}`]}
      alt={alt}
      draggable={false}
      className={cn('select-none object-contain', className)}
    />
  )
}
