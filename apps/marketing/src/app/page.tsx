import { Section } from '@/components/Section'
import { CTAButtons } from '@/components/CTAButtons'
import { FeatureCard } from '@/components/FeatureCard'

const features = [
  {
    icon: '🎯',
    title: 'Focus Sessions',
    description: 'Track your productive time with one-click focus sessions. See your progress and build momentum.',
  },
  {
    icon: '🛡️',
    title: 'Block Distractions',
    description: 'Create custom rules to block distracting websites and apps during focus time.',
  },
  {
    icon: '🔄',
    title: 'Smart Routines',
    description: 'Set up automated schedules to start focus sessions at the right times.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'View detailed analytics about your focus habits and see trends over time.',
  },
  {
    icon: '☁️',
    title: 'Sync Everywhere',
    description: 'Your data syncs across all devices. Start on desktop, continue on mobile.',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your data is encrypted and never sold. We respect your privacy.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Create an account',
    description: 'Sign up for free in seconds. No credit card required.',
  },
  {
    number: '2',
    title: 'Set up block rules',
    description: 'Choose which sites to block during focus sessions.',
  },
  {
    number: '3',
    title: 'Start focusing',
    description: 'Hit start and watch your productivity soar.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Section className="pt-24 md:pt-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Focus better.
            <br />
            <span className="text-brand-600">Build better habits.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            WakeUp helps you block distractions, track focus time, and build productive habits
            that stick. Start your journey to better focus today.
          </p>
          <CTAButtons size="large" className="justify-center" />
        </div>
      </Section>

      {/* How it works */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to focus
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features to help you stay on track
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </Section>

      {/* Testimonials placeholder */}
      <Section className="bg-gray-50">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Loved by productive people
          </h2>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <p className="text-xl text-gray-600 italic mb-4">
              &ldquo;WakeUp helped me reclaim 2+ hours of productive time every day.
              The block rules feature is a game changer.&rdquo;
            </p>
            <p className="font-semibold text-gray-900">— Early Beta User</p>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section dark>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to take control of your focus?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are building better focus habits with WakeUp.
            Start free today.
          </p>
          <CTAButtons size="large" className="justify-center" />
        </div>
      </Section>
    </>
  )
}
