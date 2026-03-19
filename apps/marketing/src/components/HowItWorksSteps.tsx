'use client'

import { useState, useRef } from 'react'
import { Steps } from 'primereact/steps'
import { Toast } from 'primereact/toast'
import 'primereact/resources/themes/lara-dark-blue/theme.css'
import 'primeicons/primeicons.css'

const stepDetails = [
  {
    label: 'Create Account',
    title: 'Sign up in seconds',
    description: 'Create your free account with just an email and password. No credit card required.',
    icon: 'pi pi-user-plus',
  },
  {
    label: 'Set Up Rules',
    title: 'Configure your focus',
    description: 'Choose which sites to block during focus sessions and set your preferred schedule.',
    icon: 'pi pi-sliders-h',
  },
  {
    label: 'Start Focusing',
    title: 'Hit start and go',
    description: 'Begin a focus session and watch your productivity soar. Track your progress over time.',
    icon: 'pi pi-bolt',
  },
  {
    label: 'Stay Connected',
    title: 'Join the community',
    description: 'Connect with others who are awake and focused right now. Stay accountable together.',
    icon: 'pi pi-users',
  },
]

export function HowItWorksSteps() {
  const [activeIndex, setActiveIndex] = useState(0)
  const toast = useRef<Toast>(null)

  const items = stepDetails.map((step) => ({
    label: step.label,
    command: () => {
      toast.current?.show({
        severity: 'info',
        summary: step.title,
        detail: step.description,
        life: 4000,
      })
    },
  }))

  const active = stepDetails[activeIndex]

  return (
    <div>
      <Toast ref={toast} />

      <div style={{ maxWidth: 700, margin: '0 auto 40px' }}>
        <Steps
          model={items}
          activeIndex={activeIndex}
          onSelect={(e) => setActiveIndex(e.index)}
          readOnly={false}
        />
      </div>

      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          textAlign: 'center',
          padding: '32px 24px',
          background: '#111827',
          border: '1px solid #1f2937',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <i className={active.icon} style={{ fontSize: 24, color: '#fff' }} />
        </div>
        <h3 style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {active.title}
        </h3>
        <p style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          {active.description}
        </p>
      </div>
    </div>
  )
}
