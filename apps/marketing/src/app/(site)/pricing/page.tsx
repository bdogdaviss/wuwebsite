'use client'

import { useState } from 'react'
import { Section } from '@/components/Section'
import { FadeIn } from '@/components/FadeIn'
import { ComingSoonModal } from '@/components/ComingSoonModal'
import { ScrollNudge } from '@/components/ScrollNudge'
import { links } from '@/lib/links'
import { Button } from 'antd'

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
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Section variant="fade" className="pt-24">
        <FadeIn direction="none">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-400">
              Start free. Upgrade when you need more power.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <FadeIn key={plan.name} delay={0.15 * idx} scale>
            {plan.comingSoon ? (
              <div className="relative">
                {/* Anchored glow behind Pro card */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                  <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
                </div>
                <div
                  className="p-8 rounded-2xl"
                  style={{
                    background: 'rgba(234, 179, 8, 0.04)',
                    border: '1px solid rgba(234, 179, 8, 0.15)',
                  }}
                >
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                    Coming Soon
                  </span>
                  <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => setModalOpen(true)}
                    style={{
                      fontWeight: 600,
                      borderRadius: 10,
                      height: 48,
                    }}
                  >
                    Get Notified
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="p-8 rounded-2xl"
                style={{
                  background: 'rgba(37, 99, 235, 0.06)',
                  border: '2px solid #2563eb',
                }}
              >
                <span className="inline-block px-3 py-1 text-sm font-medium bg-brand-600 text-white rounded-full mb-4">
                  Current Plan
                </span>
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-300">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  type="primary"
                  size="large"
                  block
                  href={plan.cta.href}
                  style={{
                    fontWeight: 600,
                    borderRadius: 10,
                    height: 48,
                  }}
                >
                  {plan.cta.label}
                </Button>
              </div>
            )}
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {included.map((item) => (
              <span key={item} className="px-3 py-1 text-gray-300 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
        </FadeIn>
      </Section>

      <Section>
        <FadeIn>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Questions about pricing?</h2>
          <p className="text-gray-400 mb-6">
            We&apos;re here to help. Reach out and we&apos;ll get back to you quickly.
          </p>
          <Button type="link" href="/contact" style={{ fontWeight: 600, fontSize: 16 }}>
            Contact us →
          </Button>
        </div>
        </FadeIn>
      </Section>

      <ComingSoonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product="Pro plan"
      />
      <ScrollNudge />
    </>
  )
}
