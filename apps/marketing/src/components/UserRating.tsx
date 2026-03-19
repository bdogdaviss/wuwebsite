'use client'

import { Rate } from 'antd'

export function UserRating() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Rate disabled defaultValue={4.5} allowHalf style={{ fontSize: 24 }} />
      <span style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600 }}>4.5 / 5</span>
      <span style={{ color: '#9ca3af', fontSize: 14 }}>from early users</span>
    </div>
  )
}
