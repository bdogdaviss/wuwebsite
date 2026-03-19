'use client'

import { useState } from 'react'
import { Section } from '@/components/Section'
import { CTAButtons } from '@/components/CTAButtons'
import { FadeIn } from '@/components/FadeIn'
import { ComingSoonModal } from '@/components/ComingSoonModal'
import { links } from '@/lib/links'
import { Button, Rate } from 'antd'
import { StarFilled } from '@ant-design/icons'

const platforms = [
  {
    name: 'Web App',
    description: 'Access WakeUp from any browser. No installation required.',
    available: true,
    cta: { label: 'Open Web App', href: links.dashboard },
    tint: { bg: 'rgba(37, 99, 235, 0.08)', border: '#2563eb' },
  },
  {
    name: 'Chrome Extension',
    description: 'Block distractions directly in your browser with our Chrome extension.',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
    tint: { bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.12)' },
  },
  {
    name: 'Desktop App',
    description: 'Native desktop app for Windows and macOS with system-level blocking.',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
    tint: { bg: 'rgba(156, 163, 175, 0.04)', border: 'rgba(255, 255, 255, 0.06)' },
  },
  {
    name: 'iOS App',
    description: 'Track focus sessions on the go with our iPhone app.',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
    tint: { bg: 'rgba(34, 197, 94, 0.04)', border: 'rgba(34, 197, 94, 0.1)' },
  },
  {
    name: 'Android App',
    description: 'Stay focused on your Android device.',
    available: false,
    cta: { label: 'Coming Soon', href: '#' },
    tint: { bg: 'rgba(34, 197, 94, 0.04)', border: 'rgba(34, 197, 94, 0.1)' },
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
  const [modal, setModal] = useState<{ open: boolean; product: string }>({ open: false, product: '' })

  return (
    <>
      <Section className="pt-24">
        <FadeIn direction="none">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Download WakeUp</h1>
            <p className="text-xl text-gray-400">
              Get WakeUp on your favorite platform. Start with the web app today.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {platforms.map((platform, idx) => (
            <FadeIn key={platform.name} delay={0.1 * idx} scale>
              {platform.available ? (
                <div className="relative">
                  {/* Small glow behind recommended card */}
                  <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/12 blur-3xl" />
                  </div>
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      background: platform.tint.bg,
                      border: `2px solid ${platform.tint.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <h3 className="text-xl font-semibold text-white" style={{ margin: 0 }}>{platform.name}</h3>
                      <Rate disabled defaultValue={1} count={1} character={<StarFilled />} style={{ fontSize: 16 }} />
                    </div>
                    <p className="text-gray-400 mb-4">{platform.description}</p>
                    <Button
                      type="primary"
                      size="middle"
                      href={platform.cta.href}
                      style={{
                        fontWeight: 600,
                        borderRadius: 10,
                      }}
                    >
                      {platform.cta.label}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: platform.tint.bg,
                    border: `1px solid ${platform.tint.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 className="text-xl font-semibold text-white" style={{ margin: 0 }}>{platform.name}</h3>
                  </div>
                  <p className="text-gray-400 mb-4">{platform.description}</p>
                  <Button
                    type="default"
                    size="middle"
                    onClick={() => setModal({ open: true, product: platform.name })}
                    style={{
                      fontWeight: 600,
                      borderRadius: 10,
                    }}
                  >
                    Get Notified
                  </Button>
                </div>
              )}
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section>
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Installation FAQs
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <FadeIn key={faq.q} delay={0.1 * idx}>
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </Section>

      <Section>
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start with the web app today</h2>
            <p className="text-lg text-gray-300 mb-10">No download required. Works in any browser.</p>
            <CTAButtons size="large" className="justify-center" />
          </div>
        </FadeIn>
      </Section>

      <ComingSoonModal
        open={modal.open}
        onClose={() => setModal({ open: false, product: '' })}
        product={modal.product}
      />
    </>
  )
}
