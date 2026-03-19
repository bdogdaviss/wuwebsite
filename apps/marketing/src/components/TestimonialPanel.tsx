'use client'

import { useRef } from 'react'
import { Panel } from 'primereact/panel'
import { Avatar } from 'primereact/avatar'
import { Menu } from 'primereact/menu'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/lara-dark-blue/theme.css'
import 'primeicons/primeicons.css'

const testimonials = [
  {
    name: 'Amy E.',
    avatar: 'A',
    role: 'Software Engineer',
    text: 'WakeUp helped me reclaim 2+ hours of productive time every day. The block rules feature is a game changer.',
    updated: 'Joined 2 weeks ago',
  },
  {
    name: 'Marcus T.',
    avatar: 'M',
    role: 'Freelance Designer',
    text: "I used to waste half my morning on social media. Now I start every day with a focus session and actually ship work before lunch.",
    updated: 'Joined 1 month ago',
  },
  {
    name: 'Priya K.',
    avatar: 'P',
    role: 'Student',
    text: "Being connected with others who are awake and focused at the same time keeps me accountable. It's like a study group that's always on.",
    updated: 'Joined 3 weeks ago',
  },
]

export function TestimonialPanel() {
  const menuRefs = useRef<(Menu | null)[]>([])

  const menuItems = [
    { label: 'View Profile', icon: 'pi pi-user' },
    { label: 'Share', icon: 'pi pi-share-alt' },
    { separator: true },
    { label: 'Report', icon: 'pi pi-flag' },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {testimonials.map((t, i) => (
        <Panel
          key={t.name}
          toggleable
          headerTemplate={(options) => (
            <div
              className={options.className}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#1a1a2e',
                borderBottom: '1px solid #2d2d44',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar
                  label={t.avatar}
                  size="large"
                  shape="circle"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
                <div>
                  <span style={{ fontWeight: 700, color: '#e5e7eb', display: 'block' }}>
                    {t.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{t.role}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Menu
                  model={menuItems}
                  popup
                  ref={(el) => { menuRefs.current[i] = el }}
                  id={`menu_${i}`}
                />
                <button
                  className="p-panel-header-icon p-link"
                  onClick={(e) => menuRefs.current[i]?.toggle(e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 8,
                    marginRight: 4,
                  }}
                >
                  <span className="pi pi-ellipsis-v" />
                </button>
                {options.togglerElement}
              </div>
            </div>
          )}
          footerTemplate={(options) => (
            <div
              className={options.className}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 16px',
                background: '#1a1a2e',
                borderTop: '1px solid #2d2d44',
              }}
            >
              <div style={{ display: 'flex', gap: 4 }}>
                <Button
                  icon="pi pi-heart"
                  rounded
                  text
                  severity="danger"
                  style={{ color: '#9ca3af' }}
                />
                <Button
                  icon="pi pi-bookmark"
                  rounded
                  text
                  severity="secondary"
                  style={{ color: '#9ca3af' }}
                />
              </div>
              <span style={{ color: '#6b7280', fontSize: 13 }}>{t.updated}</span>
            </div>
          )}
          style={{
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: 12,
            overflow: 'hidden',
          }}
          pt={{
            content: { style: { background: '#111827', padding: '16px 20px' } },
          }}
        >
          <p style={{ margin: 0, color: '#d1d5db', lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;{t.text}&rdquo;
          </p>
        </Panel>
      ))}
    </div>
  )
}
