'use client'

import { ConfigProvider, theme } from 'antd'
import { AntdRegistry } from '@ant-design/nextjs-registry'

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#2563eb',
            colorBgContainer: '#0f0f17',
            colorBgElevated: '#1a1a2e',
            colorBgLayout: '#070B14',
            colorText: '#e5e7eb',
            colorTextSecondary: '#9ca3af',
            borderRadius: 8,
            fontFamily: 'inherit',
          },
          components: {
            Layout: {
              headerBg: 'rgba(10, 10, 15, 0.8)',
              bodyBg: '#070B14',
              footerBg: '#111827',
              headerHeight: 64,
              headerPadding: '0 24px',
              footerPadding: '48px 24px',
            },
            Menu: {
              darkItemBg: 'transparent',
              darkItemColor: '#9ca3af',
              darkItemHoverColor: '#ffffff',
              darkItemSelectedColor: '#ffffff',
              darkItemSelectedBg: 'transparent',
              horizontalItemSelectedColor: '#ffffff',
              horizontalItemHoverColor: '#ffffff',
            },
            Breadcrumb: {
              itemColor: '#9ca3af',
              lastItemColor: '#e5e7eb',
              linkColor: '#9ca3af',
              linkHoverColor: '#ffffff',
              separatorColor: '#4b5563',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  )
}
