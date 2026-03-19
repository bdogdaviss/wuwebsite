'use client'

import { useState } from 'react'
import { AutoComplete, Input } from 'antd'
import {
  LoginOutlined,
  UserAddOutlined,
  QuestionCircleOutlined,
  MailOutlined,
  CrownOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { links } from '@/lib/links'

const options = [
  {
    label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>Account</span>,
    options: [
      {
        value: 'sign-in',
        url: links.signIn,
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LoginOutlined /> Sign In
          </span>
        ),
      },
      {
        value: 'create-account',
        url: links.createAccount,
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined /> Create Account
          </span>
        ),
      },
    ],
  },
  {
    label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>Pages</span>,
    options: [
      {
        value: 'features',
        url: '/features',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppstoreOutlined /> Features
          </span>
        ),
      },
      {
        value: 'pricing',
        url: '/pricing',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CrownOutlined /> Pricing
          </span>
        ),
      },
      {
        value: 'download',
        url: '/download',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DownloadOutlined /> Download
          </span>
        ),
      },
    ],
  },
  {
    label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>Support</span>,
    options: [
      {
        value: 'faq',
        url: '/faq',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QuestionCircleOutlined /> FAQ
          </span>
        ),
      },
      {
        value: 'contact',
        url: '/contact',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MailOutlined /> Contact Us
          </span>
        ),
      },
    ],
  },
]

export function QuickSearch() {
  const router = useRouter()

  const handleSelect = (value: string) => {
    for (const group of options) {
      const item = group.options.find((o) => o.value === value)
      if (item) {
        if (item.url.startsWith('http')) {
          window.location.href = item.url
        } else {
          router.push(item.url)
        }
        break
      }
    }
  }

  const [filteredOptions, setFilteredOptions] = useState(options)

  const handleSearch = (text: string) => {
    if (!text) {
      setFilteredOptions(options)
      return
    }
    const lower = text.toLowerCase()
    setFilteredOptions(
      options
        .map((group) => ({
          ...group,
          options: group.options.filter((o) => o.value.toLowerCase().includes(lower)),
        }))
        .filter((group) => group.options.length > 0)
    )
  }

  return (
    <AutoComplete
      style={{ width: 180 }}
      options={filteredOptions}
      onSelect={handleSelect}
      onSearch={handleSearch}
      popupMatchSelectWidth={280}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#6b7280', fontSize: 14 }} />}
        placeholder="Search..."
        suppressHydrationWarning
        style={{
          background: 'rgba(255,255,255,0.06)',
          borderColor: 'transparent',
          borderRadius: 20,
          height: 34,
          color: '#d1d5db',
        }}
      />
    </AutoComplete>
  )
}
