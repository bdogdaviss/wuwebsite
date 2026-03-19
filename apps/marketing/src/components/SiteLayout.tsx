'use client'

import { Layout } from 'antd'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { CookieBanner } from '@/components/CookieBanner'

const { Content } = Layout

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh', background: '#070B14' }}>
      <AnnouncementBanner />
      <SiteHeader />
      <Content style={{ position: 'relative', zIndex: 2, paddingTop: 'var(--banner-h, 0px)' }}>{children}</Content>
      <SiteFooter />
      <CookieBanner />
    </Layout>
  )
}
