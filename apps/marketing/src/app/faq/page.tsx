import { Metadata } from 'next'
import { Section } from '@/components/Section'
import { CTAButtons } from '@/components/CTAButtons'
import { createMetadata } from '@/lib/seo'

export const metadata: Metadata = createMetadata({
  title: 'FAQ',
  description: 'Frequently asked questions about WakeUp - focus tracking and distraction blocking.',
})

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is WakeUp?',
        a: 'WakeUp is a productivity app that helps you track focus sessions and block distracting websites. It helps you build better habits and stay focused on what matters.',
      },
      {
        q: 'Is WakeUp free to use?',
        a: 'Yes! WakeUp has a generous free tier that includes unlimited focus sessions, up to 10 block rules, and 30 days of session history. Pro features are coming soon.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'Yes, an account is required to sync your data across devices and access your session history. We only ask for an email and password.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is my data safe?',
        a: 'Absolutely. We use industry-standard encryption for all data in transit and at rest. Your data is never sold to third parties.',
      },
      {
        q: 'What data does WakeUp collect?',
        a: 'We collect your email, focus session data (start/end times), and block rules. We do not track which websites you visit or collect browsing history.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes, you can export all your data at any time from the settings page.',
      },
    ],
  },
  {
    category: 'Features',
    questions: [
      {
        q: 'How do block rules work?',
        a: 'Block rules use pattern matching to block websites during focus sessions. For example, adding "twitter.com" will block Twitter when you\'re focusing.',
      },
      {
        q: 'Can I customize which sites to block?',
        a: 'Yes! You can create unlimited block rules (up to 10 on free tier) and enable/disable them individually.',
      },
      {
        q: 'How do I cancel a focus session?',
        a: 'Click the "Stop" button in the app at any time. Your partial session will still be recorded in your history.',
      },
      {
        q: 'What are routines?',
        a: 'Routines (coming soon) let you schedule focus sessions automatically. Set times when you want to focus, and WakeUp will remind you or start sessions automatically.',
      },
    ],
  },
  {
    category: 'Technical',
    questions: [
      {
        q: 'Does WakeUp work on mobile?',
        a: 'The web app is mobile-friendly and works in any browser. Native iOS and Android apps are coming soon.',
      },
      {
        q: 'Is there a browser extension?',
        a: 'A Chrome extension is in development and will be available soon. It will enable system-level blocking during focus sessions.',
      },
      {
        q: 'What browsers are supported?',
        a: 'WakeUp works in all modern browsers including Chrome, Firefox, Safari, and Edge.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <>
      <Section className="pt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about WakeUp.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq) => (
                  <details
                    key={faq.q}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
                      {faq.q}
                      <svg
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-gray-600">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Reach out to our team.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </Section>

      <Section dark>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-300 mb-8">Join WakeUp today and start building better focus habits.</p>
          <CTAButtons size="large" className="justify-center" />
        </div>
      </Section>
    </>
  )
}
