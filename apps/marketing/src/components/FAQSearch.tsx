'use client'

import { useState } from 'react'
import { AutoComplete, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const allFaqs = [
  { q: 'What is WakeUp?', category: 'General' },
  { q: 'Is WakeUp free to use?', category: 'General' },
  { q: 'Do I need to create an account?', category: 'General' },
  { q: 'Is my data safe?', category: 'Privacy & Security' },
  { q: 'What data does WakeUp collect?', category: 'Privacy & Security' },
  { q: 'Can I export my data?', category: 'Privacy & Security' },
  { q: 'How do block rules work?', category: 'Features' },
  { q: 'Can I customize which sites to block?', category: 'Features' },
  { q: 'How do I cancel a focus session?', category: 'Features' },
  { q: 'What are routines?', category: 'Features' },
  { q: 'Does WakeUp work on mobile?', category: 'Technical' },
  { q: 'Is there a browser extension?', category: 'Technical' },
  { q: 'What browsers are supported?', category: 'Technical' },
]

export function FAQSearch({ onSelect }: { onSelect?: (question: string) => void }) {
  const [options, setOptions] = useState<{ label: React.ReactNode; options: { value: string; label: React.ReactNode }[] }[]>([])

  const handleSearch = (text: string) => {
    if (!text) {
      setOptions([])
      return
    }

    const lower = text.toLowerCase()
    const matched = allFaqs.filter((f) => f.q.toLowerCase().includes(lower))

    const grouped = matched.reduce<Record<string, typeof allFaqs>>((acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = []
      acc[faq.category].push(faq)
      return acc
    }, {})

    setOptions(
      Object.entries(grouped).map(([category, faqs]) => ({
        label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>{category}</span>,
        options: faqs.map((f) => ({
          value: f.q,
          label: <span style={{ color: '#e5e7eb' }}>{f.q}</span>,
        })),
      }))
    )
  }

  const handleSelect = (value: string) => {
    if (onSelect) {
      onSelect(value)
      return
    }
    const el = document.querySelector(`summary`)
    const summaries = document.querySelectorAll('summary')
    for (const s of summaries) {
      if (s.textContent?.includes(value)) {
        const details = s.parentElement as HTMLDetailsElement
        details.open = true
        details.scrollIntoView({ behavior: 'smooth', block: 'center' })
        break
      }
    }
  }

  return (
    <AutoComplete
      style={{ width: '100%', maxWidth: 500 }}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      popupMatchSelectWidth={false}
    >
      <Input.Search
        size="large"
        placeholder="Search FAQs..."
        prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
        style={{ background: '#111827', borderColor: '#374151' }}
      />
    </AutoComplete>
  )
}
