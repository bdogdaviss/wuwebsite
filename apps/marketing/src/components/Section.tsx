interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  variant?: 'base' | 'fade' | 'glow'
  glow?: React.ReactNode
}

export function Section({ children, className = '', id, variant = 'base', glow }: SectionProps) {
  const isGlow = variant === 'glow'
  const isFade = variant === 'fade'

  return (
    <section
      id={id}
      className={`py-20 md:py-32 text-white ${isGlow ? 'relative overflow-hidden' : ''} ${isFade ? 'bg-gradient-to-b from-[#070B14] via-[#0B1220] to-[#070B14]' : ''} ${className}`}
      style={!isFade ? { background: '#070B14' } : undefined}
    >
      {isGlow && glow && (
        <div className="pointer-events-none absolute inset-0">
          {glow}
        </div>
      )}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isGlow ? 'relative' : ''}`}>
        {children}
      </div>
    </section>
  )
}
