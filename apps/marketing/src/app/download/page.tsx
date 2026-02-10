import { Metadata } from 'next'
import { Section } from '@/components/Section'
import { CTAButtons } from '@/components/CTAButtons'
import { createMetadata } from '@/lib/seo'
import { links } from '@/lib/links'

export const metadata: Metadata = createMetadata({
  title: 'Download',
  description: 'Download WakeUp for web, desktop, mobile, and browser extension.',
})

const platforms = [
  {
    name: 'Web App',
    description: 'Access WakeUp from any browser. No installation required.',
    icon: '🌐',
    available: true,
    cta: { label: 'Open Web App', href: links.dashboard },
  },
  {
    name: 'Chrome Extension',
    description: 'Block distractions directly in your browser with our Chrome extension.',
    icon: '🧩',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
  },
  {
    name: 'Desktop App',
    description: 'Native desktop app for Windows and macOS with system-level blocking.',
    icon: '💻',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
  },
  {
    name: 'iOS App',
    description: 'Track focus sessions on the go with our iPhone app.',
    icon: '📱',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
  },
  {
    name: 'Android App',
    description: 'Stay focused on your Android device.',
    icon: '🤖',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
  },
]

const faqs = [
  {
    q: 'Do I need to install anything to use WakeUp?',
    a: 'No! The web app works in any modern browser. Just sign up and start focusing.',
  },
  {
    q: 'When will the Chrome extension be available?',
    a: 'We\'re actively working on it. Join our waitlist to be notified when it launches.',
  },
  {
    q: 'Will WakeUp work on my phone?',
    a: 'The web app is mobile-friendly. Native iOS and Android apps are coming soon.',
  },
]

export default function DownloadPage() {
  return (
    <>
      <Section className="pt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Download WakeUp</h1>
          <p className="text-xl text-gray-600">
            Get WakeUp on your favorite platform. Start with the web app today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`p-6 rounded-2xl border-2 ${
                platform.available
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-4xl mb-4">{platform.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{platform.name}</h3>
              <p className="text-gray-600 mb-4">{platform.description}</p>
              <a
                href={platform.cta.href}
                className={`inline-block px-4 py-2 rounded-lg font-medium transition-colors ${
                  platform.available
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {platform.cta.label}
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Installation FAQs
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section dark>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start with the web app today</h2>
          <p className="text-lg text-gray-300 mb-8">No download required. Works in any browser.</p>
          <CTAButtons size="large" className="justify-center" />
        </div>
      </Section>
    </>
  )
}
