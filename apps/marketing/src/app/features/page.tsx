import { Metadata } from 'next'
import { Section } from '@/components/Section'
import { CTAButtons } from '@/components/CTAButtons'
import { createMetadata } from '@/lib/seo'

export const metadata: Metadata = createMetadata({
  title: 'Features',
  description: 'Discover all the powerful features WakeUp offers to help you focus better.',
})

const features = [
  {
    title: 'Focus Sessions',
    description: 'Start a focus session with one click and track your productive time. WakeUp automatically tracks how long you stay focused and gives you insights into your habits.',
    details: ['One-click start/stop', 'Live timer display', 'Session history', 'Daily/weekly stats'],
    icon: '🎯',
  },
  {
    title: 'Block Rules',
    description: 'Create custom rules to block distracting websites during focus sessions. You define what counts as a distraction.',
    details: ['Pattern-based blocking', 'Per-rule enable/disable', 'Works during sessions', 'Unlimited rules'],
    icon: '🛡️',
  },
  {
    title: 'Routines',
    description: 'Set up automated schedules to start focus sessions at optimal times. Build consistency without thinking.',
    details: ['Scheduled sessions', 'Recurring patterns', 'Smart reminders', 'Flexible timing'],
    icon: '🔄',
    comingSoon: true,
  },
  {
    title: 'Cross-Device Sync',
    description: 'Your data syncs seamlessly across all your devices. Start a session on your laptop, see it on your phone.',
    details: ['Real-time sync', 'Web + mobile + extension', 'Offline support', 'Secure encryption'],
    icon: '☁️',
    comingSoon: true,
  },
  {
    title: 'Browser Extension',
    description: 'Block distractions right in your browser. The WakeUp extension integrates with your focus sessions.',
    details: ['Chrome support', 'Auto-blocking', 'Quick session start', 'Sync with web app'],
    icon: '🌐',
    comingSoon: true,
  },
  {
    title: 'iOS & Android Apps',
    description: 'Take WakeUp with you. Native mobile apps let you track focus on the go.',
    details: ['Native performance', 'Push notifications', 'Widget support', 'Offline mode'],
    icon: '📱',
    comingSoon: true,
  },
]

export default function FeaturesPage() {
  return (
    <>
      <Section className="pt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Features</h1>
          <p className="text-xl text-gray-600">
            Everything you need to build better focus habits and block distractions.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{feature.title}</h2>
                  {feature.comingSoon && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl">{feature.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section dark>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start using these features today</h2>
          <p className="text-lg text-gray-300 mb-8">Create your free account and start focusing better.</p>
          <CTAButtons size="large" className="justify-center" />
        </div>
      </Section>
    </>
  )
}
