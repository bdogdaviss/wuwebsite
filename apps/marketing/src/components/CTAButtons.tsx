import { links } from '@/lib/links'

interface CTAButtonsProps {
  size?: 'default' | 'large'
  className?: string
}

export function CTAButtons({ size = 'default', className = '' }: CTAButtonsProps) {
  const padding = size === 'large' ? 'px-8 py-4 text-lg' : 'px-6 py-3'

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <a
        href={links.createAccount}
        className={`${padding} bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors text-center`}
      >
        Get Started Free
      </a>
      <a
        href={links.signIn}
        className={`${padding} bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center`}
      >
        Sign In
      </a>
    </div>
  )
}
