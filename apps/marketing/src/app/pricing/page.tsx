import { Metadata } from 'next'
import { Section } from '@/components/Section'
import { CTAButtons } from '@/components/CTAButtons'
import { createMetadata } from '@/lib/seo'
import { links } from '@/lib/links'

export const metadata: Metadata = createMetadata({
  title: 'Pricing',
  description: 'Simple, transparent pricing. Start free, upgrade when you need more.',
})

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to get started with focus tracking.',
    features: [
      'Unlimited focus sessions',
      'Up to 10 block rules',
      'Session history (30 days)',
      'Basic analytics',
      'Web app access',
    ],
    cta: { label: 'Get Started Free', href: links.createAccount },
    featured: true,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'Advanced features for serious productivity.',
    features: [
      'Everything in Free',
      'Unlimited block rules',
      'Full session history',
      'Advanced analytics',
      'Routines & scheduling',
      'Priority support',
      'Browser extension',
      'Mobile apps',
    ],
    cta: { label: 'Coming Soon', href: '#' },
    featured: false,
    comingSoon: true,
  },
]

const included = [
  'No credit card required for free tier',
  'Cancel anytime',
  'Data export',
  'Privacy-first approach',
]

export default function PricingPage() {
  return (
    <>
      <Section className="pt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl ${
                plan.featured
                  ? 'border-2 border-brand-600 bg-white shadow-lg'
                  : 'border border-gray-200 bg-gray-50'
              }`}
            >
              {plan.featured && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-brand-600 text-white rounded-full mb-4">
                  Current Plan
                </span>
              )}
              {plan.comingSoon && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full mb-4">
                  Coming Soon
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.cta.href}
                className={`block w-full py-3 text-center rounded-lg font-semibold transition-colors ${
                  plan.featured
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {plan.cta.label}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {included.map((item) => (
              <span key={item} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions about pricing?</h2>
          <p className="text-gray-600 mb-6">
            We&apos;re here to help. Reach out and we&apos;ll get back to you quickly.
          </p>
          <a href="/contact" className="text-brand-600 font-medium hover:underline">
            Contact us →
          </a>
        </div>
      </Section>
    </>
  )
}
