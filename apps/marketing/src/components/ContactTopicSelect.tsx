'use client'

import { AutoComplete, Input } from 'antd'
import { MessageOutlined } from '@ant-design/icons'

const topicSuggestions = [
  {
    label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>Account</span>,
    options: [
      { value: 'I need help signing in', label: 'I need help signing in' },
      { value: 'I forgot my password', label: 'I forgot my password' },
      { value: 'I want to delete my account', label: 'I want to delete my account' },
    ],
  },
  {
    label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>Features</span>,
    options: [
      { value: 'How do I set up block rules?', label: 'How do I set up block rules?' },
      { value: 'Focus sessions are not tracking', label: 'Focus sessions are not tracking' },
      { value: 'I have a feature request', label: 'I have a feature request' },
    ],
  },
  {
    label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>Billing & Plans</span>,
    options: [
      { value: 'Question about pricing', label: 'Question about pricing' },
      { value: 'I want to upgrade my plan', label: 'I want to upgrade my plan' },
    ],
  },
  {
    label: <span style={{ fontWeight: 600, color: '#9ca3af' }}>Other</span>,
    options: [
      { value: 'Bug report', label: 'Bug report' },
      { value: 'Partnership inquiry', label: 'Partnership inquiry' },
      { value: 'General feedback', label: 'General feedback' },
    ],
  },
]

interface ContactTopicSelectProps {
  value: string
  onChange: (value: string) => void
}

export function ContactTopicSelect({ value, onChange }: ContactTopicSelectProps) {
  return (
    <AutoComplete
      style={{ width: '100%' }}
      options={topicSuggestions}
      value={value}
      onChange={onChange}
      filterOption={(input, option) =>
        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      popupMatchSelectWidth={false}
    >
      <Input.Search
        size="large"
        placeholder="What can we help you with?"
        prefix={<MessageOutlined style={{ color: '#6b7280' }} />}
        style={{ background: '#111827', borderColor: '#374151' }}
      />
    </AutoComplete>
  )
}
