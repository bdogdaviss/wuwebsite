'use client'

import { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Tabs,
  Checkbox,
  Divider,
  Space,
  theme,
  message,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  TwitterOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { links, API_URL, APP_URL } from '@/lib/links'

type RegisterType = 'email' | 'username'

export default function RegisterPage() {
  const [registerType, setRegisterType] = useState<RegisterType>('email')
  const { token } = theme.useToken()
  const [loading, setLoading] = useState(false)

  const iconStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    border: `1px solid ${token.colorPrimaryBorder}`,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  const handleSubmit = async (values: Record<string, string>) => {
    setLoading(true)
    try {
      // Map form fields based on which tab is active
      const email = registerType === 'email' ? values.email : values.email2
      const password = registerType === 'email' ? values.password : values.password2
      const display_name = registerType === 'email' ? values.displayName : values.username

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          message.error('An account with that email already exists.')
        } else if (data?.error) {
          message.error(data.error)
        } else {
          message.error('Registration failed. Please try again.')
        }
        return
      }

      // Store tokens so the web app recognizes the session
      localStorage.setItem('wakeup_access_token', data.access_token)
      localStorage.setItem('wakeup_refresh_token', data.refresh_token)

      message.success('Account created! Redirecting...')
      setTimeout(() => {
        window.location.href = APP_URL
      }, 1000)
    } catch {
      message.error('Could not connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#070B14',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left side - branding/promo */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          position: 'relative',
          background: 'linear-gradient(135deg, #070B14 0%, #111827 50%, #1e1b4b 100%)',
        }}
        className="hidden-mobile"
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <img src="/logo.png" alt="WakeUp" style={{ width: 56, height: 56 }} />
            <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>WakeUp</span>
          </div>

          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Connect with people
            <br />
            <span style={{ color: '#2563eb' }}>who are awake right now</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.6, maxWidth: 480 }}>
            Join thousands building better focus habits. Block distractions,
            track your progress, and stay connected with your community.
          </p>

          <div
            style={{
              marginTop: 48,
              padding: 24,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              maxWidth: 400,
            }}
          >
            <p style={{ color: '#e5e7eb', fontSize: 16, fontStyle: 'italic', margin: 0 }}>
              &ldquo;WakeUp helped me reclaim 2+ hours of productive time every day.&rdquo;
            </p>
            <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8, marginBottom: 0 }}>
              &mdash; Early Beta User
            </p>
          </div>
        </div>

        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '-20%',
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Right side - register form */}
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 48px',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Mobile logo */}
        <div
          className="visible-mobile-only"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
        >
          <img src="/logo.png" alt="WakeUp" style={{ width: 40, height: 40 }} />
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>WakeUp</span>
        </div>

        <h2 style={{ color: '#ffffff', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          Create your account
        </h2>
        <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 32 }}>
          Get started free — no credit card required
        </p>

        <Tabs
          centered
          activeKey={registerType}
          onChange={(key) => setRegisterType(key as RegisterType)}
          items={[
            { key: 'email', label: 'Email' },
            { key: 'username', label: 'Username' },
          ]}
          style={{ marginBottom: 8 }}
        />

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          requiredMark={false}
        >
          {registerType === 'email' && (
            <>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Email address"
                />
              </Form.Item>
              <Form.Item
                name="displayName"
                rules={[{ required: true, message: 'Please enter a display name' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Display name"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter a password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Password (8+ characters)"
                />
              </Form.Item>
            </>
          )}

          {registerType === 'username' && (
            <>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Please choose a username' },
                  { min: 3, message: 'Username must be at least 3 characters' },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: 'Letters, numbers, and underscores only',
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="email2"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Email address"
                />
              </Form.Item>
              <Form.Item
                name="password2"
                rules={[
                  { required: true, message: 'Please enter a password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Password (8+ characters)"
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Checkbox style={{ color: '#9ca3af' }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#2563eb' }}>
                  Terms
                </Link>{' '}
                &{' '}
                <Link href="/privacy" style={{ color: '#2563eb' }}>
                  Privacy Policy
                </Link>
              </Checkbox>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                background: '#2563eb',
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <span style={{ color: '#6b7280', fontSize: 13 }}>Or sign up with</span>
        </Divider>

        <Space
          size={16}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
        >
          <div style={iconStyle}>
            <GoogleOutlined style={{ fontSize: 18, color: '#4285f4' }} />
          </div>
          <div style={iconStyle}>
            <GithubOutlined style={{ fontSize: 18, color: '#e5e7eb' }} />
          </div>
          <div style={iconStyle}>
            <TwitterOutlined style={{ fontSize: 18, color: '#1da1f2' }} />
          </div>
        </Space>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          Already have an account?{' '}
          <a href={links.signIn} style={{ color: '#2563eb', fontWeight: 500 }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
