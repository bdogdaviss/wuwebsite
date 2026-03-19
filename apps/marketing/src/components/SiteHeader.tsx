'use client'

import { useState } from 'react'
import { Layout, Menu, Button, Drawer } from 'antd'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { links } from '@/lib/links'
import { QuickSearch } from '@/components/QuickSearch'

const { Header } = Layout

const navItems = [
  { key: '/features', label: 'Features' },
  { key: '/download', label: 'Download' },
  { key: '/pricing', label: 'Pricing' },
  { key: '/faq', label: 'FAQ' },
  { key: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const menuItems = navItems.map((item) => ({
    key: item.key,
    label: <Link href={item.key}>{item.label}</Link>,
  }))

  const selectedKeys = navItems
    .filter((item) => pathname === item.key)
    .map((item) => item.key)

  return (
    <Header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1f2937',
        padding: '0 24px',
        background: 'rgba(10, 10, 15, 0.8)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginRight: 24,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <Image
          src="/logo.png"
          alt="WakeUp"
          width={80}
          height={80}
          priority
          style={{ objectFit: 'contain' }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#ffffff',
            whiteSpace: 'nowrap',
          }}
        >
          WakeUp
        </span>
        <sup style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginLeft: -4, marginTop: -8 }}>TM</sup>
      </Link>

      {/* Desktop Nav */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys}
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          borderBottom: 'none',
          lineHeight: '62px',
        }}
        className="hidden-mobile"
      />

      {/* Desktop CTA */}
      <div
        className="hidden-mobile"
        style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 8, lineHeight: 'normal' }}
      >
        <QuickSearch />
        <a
          href={links.signIn}
          style={{
            color: '#d1d5db',
            fontWeight: 500,
            textDecoration: 'none',
            padding: '6px 12px',
            fontSize: 14,
            whiteSpace: 'nowrap',
          }}
        >
          Sign in
        </a>
        <a
          href={links.createAccount}
          style={{
            padding: '5px 14px',
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 500,
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 14,
            whiteSpace: 'nowrap',
            lineHeight: '22px',
          }}
        >
          Get Started
        </a>
      </div>

      {/* Mobile Menu Button */}
      <Button
        type="text"
        icon={<MenuOutlined style={{ fontSize: 20, color: '#9ca3af' }} />}
        onClick={() => setDrawerOpen(true)}
        className="visible-mobile-only"
        style={{
          marginLeft: 'auto',
          width: 44,
          height: 44,
        }}
      />

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image src="/logo.png" alt="WakeUp" width={32} height={32} />
            <span style={{ fontWeight: 700, color: '#ffffff' }}>WakeUp</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closeIcon={<CloseOutlined style={{ color: '#9ca3af' }} />}
        styles={{
          header: { background: '#111827', borderBottom: '1px solid #1f2937' },
          body: { background: '#111827', padding: 0 },
        }}
        size={280}
      >
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={selectedKeys}
          items={[
            ...menuItems,
            { type: 'divider' as const },
            {
              key: 'signin',
              label: (
                <a href={links.signIn} style={{ color: '#d1d5db', fontWeight: 500 }}>
                  Sign in
                </a>
              ),
            },
            {
              key: 'getstarted',
              label: (
                <a
                  href={links.createAccount}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 500,
                    borderRadius: 8,
                  }}
                >
                  Get Started
                </a>
              ),
            },
          ]}
          onClick={() => setDrawerOpen(false)}
          style={{ background: 'transparent', borderRight: 'none' }}
        />
      </Drawer>
    </Header>
  )
}
