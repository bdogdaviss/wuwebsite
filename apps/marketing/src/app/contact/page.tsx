'use client'

import { useState } from 'react'
import { Section } from '@/components/Section'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
            <p className="text-xl text-gray-600">
              Have a question or feedback? We&apos;d love to hear from you.
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Thanks for reaching out!</h2>
              <p className="text-green-700">
                We&apos;ve received your message and will get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-shadow"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-shadow"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-shadow resize-none"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}

          <div className="mt-12 pt-12 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Other ways to reach us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="text-2xl mb-2">📧</div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <a href="mailto:support@wakeup.app" className="text-brand-600 hover:underline">
                  support@wakeup.app
                </a>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="text-2xl mb-2">🐦</div>
                <h3 className="font-semibold text-gray-900 mb-1">Twitter</h3>
                <a href="https://twitter.com/wakeupapp" className="text-brand-600 hover:underline">
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
