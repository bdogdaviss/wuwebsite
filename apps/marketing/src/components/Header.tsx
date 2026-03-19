'use client'

import Link from 'next/link'
import { useState } from 'react'
import { links } from '@/lib/links'

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/download', label: 'Download' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - smaller on mobile, full size on desktop */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="WakeUp" className="w-10 h-10 md:w-24 md:h-24" />
            <span className="text-xl md:text-2xl font-bold text-white">WakeUp</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={links.signIn}
              className="px-4 py-2 text-gray-300 font-medium hover:text-white transition-colors"
            >
              Sign in
            </a>
            <a
              href={links.createAccount}
              className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button - 44px min touch target for iOS */}
          <button
            className="md:hidden p-3 -mr-2 text-gray-400 active:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav - larger touch targets */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-gray-400 hover:bg-gray-800 active:bg-gray-700 rounded-lg text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-800" />
              <a
                href={links.signIn}
                className="px-4 py-3 text-gray-300 font-medium text-lg"
              >
                Sign in
              </a>
              <a
                href={links.createAccount}
                className="mx-4 py-3 bg-brand-600 text-white font-medium rounded-lg text-center text-lg active:bg-brand-700"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
