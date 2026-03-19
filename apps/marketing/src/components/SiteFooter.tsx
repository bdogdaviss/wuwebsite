'use client'

import { Layout, Typography, Space } from 'antd'
import Link from 'next/link'

const { Footer } = Layout
const { Text, Title } = Typography

const footerLinks = {
  product: [
    { href: '/features', label: 'Features' },
    { href: '/download', label: 'Download' },
    { href: '/pricing', label: 'Pricing' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
}

const linkStyle = {
  color: '#9ca3af',
  textDecoration: 'none',
  fontSize: 14,
  display: 'block',
  padding: '4px 0',
}

export function SiteFooter() {
  return (
    <Footer
      style={{
        background: '#070B14',
        borderTop: '1px solid #1f2937',
        padding: '48px 24px 24px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
          }}
        >
          {/* Brand */}
          <div>
            <Title level={4} style={{ color: '#2563eb', margin: 0, fontSize: 20 }}>
              WakeUp
            </Title>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 8, display: 'block' }}>
              Focus better. Block distractions. Build better habits.
            </Text>
          </div>

          {/* Product */}
          <div>
            <Text strong style={{ color: '#ffffff', display: 'block', marginBottom: 12 }}>
              Product
            </Text>
            <Space orientation="vertical" size={4}>
              {footerLinks.product.map((link) => (
                <Link key={link.href} href={link.href} style={linkStyle}>
                  {link.label}
                </Link>
              ))}
            </Space>
          </div>

          {/* Support */}
          <div>
            <Text strong style={{ color: '#ffffff', display: 'block', marginBottom: 12 }}>
              Support
            </Text>
            <Space orientation="vertical" size={4}>
              {footerLinks.support.map((link) => (
                <Link key={link.href} href={link.href} style={linkStyle}>
                  {link.label}
                </Link>
              ))}
            </Space>
          </div>

          {/* Legal */}
          <div>
            <Text strong style={{ color: '#ffffff', display: 'block', marginBottom: 12 }}>
              Legal
            </Text>
            <Space orientation="vertical" size={4}>
              {footerLinks.legal.map((link) => (
                <Link key={link.href} href={link.href} style={linkStyle}>
                  {link.label}
                </Link>
              ))}
            </Space>
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 32,
            borderTop: '1px solid #1f2937',
            textAlign: 'center',
          }}
        >
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            &copy; {new Date().getFullYear()} WakeUp. All rights reserved.
          </Text>
        </div>
      </div>
    </Footer>
  )
}
