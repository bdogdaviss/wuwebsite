import { SiteLayout } from '@/components/SiteLayout'

export default function SiteGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SiteLayout>{children}</SiteLayout>
}
