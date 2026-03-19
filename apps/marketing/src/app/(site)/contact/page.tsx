'use client'

import { useState } from 'react'
import { Section } from '@/components/Section'
import { ContactTopicSelect } from '@/components/ContactTopicSelect'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to an API
    console.log('Contact form submitted:', form)
    setSubmitted(true)
  }

  return (
    <>
      <Section className="pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
            <p className="text-xl text-gray-400">
              Have a question or feedback? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Soft glow behind form area */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/3 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/8 blur-3xl" />
            </div>
          </div>

          {submitted ? (
            <div className="bg-green-900/30 border border-green-700 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Thanks for reaching out!</h2>
              <p className="text-green-300">
                We&apos;ve received your message and will get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-shadow"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-shadow"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topic
                </label>
                <ContactTopicSelect
                  value={form.topic}
                  onChange={(value) => setForm({ ...form, topic: value })}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-shadow resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg transition-colors"
                style={{ background: '#7c3aed' }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#6d28d9')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#7c3aed')}
              >
                Send Message
              </button>
            </form>
          )}

          <div className="mt-16 pt-16 border-t border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Other ways to reach us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.12)' }}>
                <h3 className="font-semibold text-white mb-1">Email</h3>
                <a href="mailto:support@wakeup.app" className="text-violet-400 hover:underline">
                  support@wakeup.app
                </a>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.12)' }}>
                <h3 className="font-semibold text-white mb-1">Twitter</h3>
                <a href="https://twitter.com/wakeupapp" className="text-violet-400 hover:underline">
                  @wakeupapp
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
