import { useRef, useState, useEffect, useCallback } from 'react'
import { Avatar, discordColors } from '@wakeup/ui'
import { useAuth } from '../context/AuthContext'
import { useUIStore } from '../state/uiStore'
import {
  Camera,
  User,
  Monitor,
  Keyboard,
  LogOut,
  X,
} from 'lucide-react'

type SettingsSection = 'my-account' | 'interface' | 'shortcuts'

const settingsNav = [
  { section: 'header' as const, label: 'User Settings' },
  { section: 'my-account' as const, label: 'My Account', icon: User },
  { section: 'divider' as const },
  { section: 'header' as const, label: 'App Settings' },
  { section: 'interface' as const, label: 'Interface', icon: Monitor },
  { section: 'shortcuts' as const, label: 'Keybinds', icon: Keyboard },
]

export function SettingsOverlay() {
  const { user, logout, api, updateUser } = useAuth()
  const { isSettingsOpen, closeSettings } = useUIStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeSection, setActiveSection] = useState<SettingsSection>('my-account')

  // ESC key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings()
    },
    [closeSettings]
  )

  useEffect(() => {
    if (isSettingsOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSettingsOpen, handleKeyDown])

  if (!isSettingsOpen) return null

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setIsUploading(true)
    try {
      const updatedUser = await api.uploadAvatar(file)
      updateUser(updatedUser)
    } catch (err) {
      console.error('Failed to upload avatar:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogout = () => {
    closeSettings()
    logout()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        backgroundColor: discordColors.bgSecondary,
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Left sidebar navigation */}
      <div
        style={{
          width: 218,
          backgroundColor: discordColors.bgSecondary,
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 6px 20px 20px',
          overflowY: 'auto',
          flexShrink: 0,
          alignItems: 'flex-end',
        }}
      >
        <div style={{ width: 192 }}>
          {settingsNav.map((item, i) => {
            if (item.section === 'header') {
              return (
                <div
                  key={`h-${i}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: discordColors.channelDefault,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    padding: '6px 10px',
                    marginTop: i > 0 ? 8 : 0,
                  }}
                >
                  {item.label}
                </div>
              )
            }
            if (item.section === 'divider') {
              return (
                <div
                  key={`d-${i}`}
                  style={{
                    height: 1,
                    backgroundColor: discordColors.border,
                    margin: '8px 10px',
                  }}
                />
              )
            }
            const Icon = item.icon!
            const isActive = activeSection === item.section
            return (
              <div
                key={item.section}
                onClick={() => setActiveSection(item.section as SettingsSection)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  backgroundColor: isActive ? discordColors.bgModifierSelected : 'transparent',
                  color: isActive ? discordColors.interactiveActive : discordColors.interactiveNormal,
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 2,
                  transition: 'background-color 0.1s, color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
                    e.currentTarget.style.color = discordColors.interactiveHover
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = discordColors.interactiveNormal
                  }
                }}
              >
                <Icon size={18} />
                {item.label}
              </div>
            )
          })}

          {/* Divider before logout */}
          <div
            style={{
              height: 1,
              backgroundColor: discordColors.border,
              margin: '8px 10px',
            }}
          />
          <div
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 4,
              cursor: 'pointer',
              color: discordColors.interactiveNormal,
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color 0.1s, color 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
              e.currentTarget.style.color = discordColors.interactiveHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = discordColors.interactiveNormal
            }}
          >
            <LogOut size={18} />
            Log Out
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          backgroundColor: discordColors.bgPrimary,
          overflowY: 'auto',
          padding: '60px 40px 20px',
          maxWidth: 740,
        }}
      >
        {activeSection === 'my-account' && (
          <MyAccountSection
            user={user}
            isUploading={isUploading}
            onAvatarClick={handleAvatarClick}
          />
        )}
        {activeSection === 'interface' && <InterfaceSection />}
        {activeSection === 'shortcuts' && <ShortcutsSection />}
      </div>

      {/* Close button area */}
      <div
        style={{
          width: 60,
          paddingTop: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div
          onClick={closeSettings}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            border: `2px solid ${discordColors.interactiveNormal}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = discordColors.interactiveHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = discordColors.interactiveNormal
          }}
        >
          <X size={18} color={discordColors.interactiveNormal} />
        </div>
        <span
          style={{
            fontSize: 13,
            color: discordColors.interactiveNormal,
            marginTop: 4,
            fontWeight: 600,
          }}
        >
          ESC
        </span>
      </div>
    </div>
  )
}

function MyAccountSection({
  user,
  isUploading,
  onAvatarClick,
}: {
  user: any
  isUploading: boolean
  onAvatarClick: () => void
}) {
  const { api, updateUser } = useAuth()
  const { bannerColor, setBannerColor } = useUIStore()
  const [showBannerPicker, setShowBannerPicker] = useState(false)
  const [editingField, setEditingField] = useState<'display_name' | 'email' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const startEdit = (field: 'display_name' | 'email') => {
    setEditingField(field)
    setEditValue(field === 'display_name' ? (user?.display_name || '') : (user?.email || ''))
    setError('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
    setError('')
  }

  const saveEdit = async () => {
    if (!editValue.trim()) {
      setError('This field cannot be empty')
      return
    }
    if (editingField === 'email' && !editValue.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const updated = await api.updateProfile(
        editingField === 'display_name'
          ? { display_name: editValue.trim() }
          : { email: editValue.trim() }
      )
      updateUser(updated)
      setEditingField(null)
      setEditValue('')
    } catch (err: any) {
      setError(err?.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: discordColors.headerPrimary,
          marginBottom: 20,
        }}
      >
        My Account
      </h2>

      {/* Profile card */}
      <div
        style={{
          backgroundColor: discordColors.bgTertiary,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Banner */}
        <div
          onClick={() => setShowBannerPicker((prev) => !prev)}
          style={{
            height: 100,
            backgroundColor: bannerColor,
            cursor: 'pointer',
            position: 'relative',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            const overlay = e.currentTarget.querySelector('.banner-overlay') as HTMLElement
            if (overlay) overlay.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            const overlay = e.currentTarget.querySelector('.banner-overlay') as HTMLElement
            if (overlay) overlay.style.opacity = '0'
          }}
        >
          <div
            className="banner-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
          >
            <span style={{ fontSize: 12, color: 'white', fontWeight: 600, textTransform: 'uppercase' }}>
              Change Banner Color
            </span>
          </div>
          {showBannerPicker && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: -48,
                left: 16,
                right: 16,
                zIndex: 10,
                backgroundColor: discordColors.bgTertiary,
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: discordColors.textMuted, textTransform: 'uppercase', marginRight: 4 }}>
                Color
              </span>
              {[
                '#5865f2', '#57f287', '#fee75c', '#ed4245', '#eb459e',
                '#9b59b6', '#e67e22', '#1abc9c', '#3498db', '#2c2f33',
                '#e91e63', '#f44336',
              ].map((color) => (
                <div
                  key={color}
                  onClick={() => {
                    setBannerColor(color)
                    setShowBannerPicker(false)
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: bannerColor === color ? '2px solid #fff' : '2px solid transparent',
                    flexShrink: 0,
                    transition: 'border-color 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Avatar + Edit button row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0 16px',
            marginTop: -40,
          }}
        >
          <div
            onClick={onAvatarClick}
            style={{
              position: 'relative',
              borderRadius: 44,
              border: `6px solid ${discordColors.bgTertiary}`,
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <Avatar
              src={user?.avatar_url}
              fallback={user?.display_name || 'U'}
              size="xl"
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 16,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0'
              }}
            >
              {isUploading ? (
                <span style={{ fontSize: 10, color: 'white', fontWeight: 600 }}>
                  Uploading...
                </span>
              ) : (
                <>
                  <Camera size={16} color="white" />
                  <span
                    style={{
                      fontSize: 9,
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginTop: 2,
                    }}
                  >
                    Change Avatar
                  </span>
                </>
              )}
            </div>
          </div>

          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: discordColors.headerPrimary,
              marginBottom: 16,
            }}
          >
            {user?.display_name}
          </span>

          <button
            onClick={onAvatarClick}
            style={{
              background: discordColors.brandPrimary,
              border: 'none',
              borderRadius: 3,
              padding: '4px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: '#ffffff',
              cursor: 'pointer',
              marginBottom: 16,
            }}
          >
            Edit User Profile
          </button>
        </div>

        {/* Profile info */}
        <div
          style={{
            margin: 16,
            marginTop: 12,
            backgroundColor: discordColors.bgPrimary,
            borderRadius: 8,
            padding: 16,
          }}
        >
          {editingField === 'display_name' ? (
            <EditRow
              label="Display Name"
              value={editValue}
              onChange={setEditValue}
              onSave={saveEdit}
              onCancel={cancelEdit}
              isSaving={isSaving}
              error={error}
            />
          ) : (
            <ProfileRow
              label="Display Name"
              value={user?.display_name || '-'}
              onEdit={() => startEdit('display_name')}
            />
          )}
          <Divider />
          {editingField === 'email' ? (
            <EditRow
              label="Email"
              value={editValue}
              onChange={setEditValue}
              onSave={saveEdit}
              onCancel={cancelEdit}
              isSaving={isSaving}
              error={error}
              type="email"
            />
          ) : (
            <ProfileRow
              label="Email"
              value={user?.email || '-'}
              onEdit={() => startEdit('email')}
            />
          )}
          <Divider />
          <ProfileRow
            label="Member Since"
            value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : '-'
            }
            hideEdit
          />
        </div>
      </div>
    </div>
  )
}

function InterfaceSection() {
  const { isInfoPanelOpen, toggleInfoPanel } = useUIStore()

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: discordColors.headerPrimary,
          marginBottom: 20,
        }}
      >
        Interface
      </h2>

      <div
        style={{
          backgroundColor: discordColors.bgSecondary,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: discordColors.textNormal,
              }}
            >
              Info Panel
            </div>
            <div style={{ fontSize: 13, color: discordColors.textMuted }}>
              Show details panel on the right
            </div>
          </div>
          <button
            onClick={toggleInfoPanel}
            style={{
              background: isInfoPanelOpen
                ? discordColors.brandPrimary
                : discordColors.bgModifierActive,
              border: 'none',
              borderRadius: 3,
              padding: '4px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {isInfoPanelOpen ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ShortcutsSection() {
  const shortcuts = [
    { label: 'Command Palette', keys: 'Ctrl/Cmd + K' },
    { label: 'Toggle Info Panel', keys: 'Ctrl/Cmd + I' },
    { label: 'Start/Stop Focus', keys: 'Ctrl/Cmd + Shift + F' },
  ]

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: discordColors.headerPrimary,
          marginBottom: 20,
        }}
      >
        Keybinds
      </h2>

      <div
        style={{
          backgroundColor: discordColors.bgSecondary,
          borderRadius: 8,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {shortcuts.map((s) => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14, color: discordColors.textMuted }}>
              {s.label}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: discordColors.textNormal,
              }}
            >
              {s.keys}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileRow({
  label,
  value,
  hideEdit,
  onEdit,
}: {
  label: string
  value: string
  hideEdit?: boolean
  onEdit?: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: discordColors.textMuted,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 15, color: discordColors.textNormal }}>
          {value}
        </div>
      </div>
      {!hideEdit && (
        <button
          onClick={onEdit}
          style={{
            background: discordColors.bgModifierActive,
            border: 'none',
            borderRadius: 3,
            padding: '4px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      )}
    </div>
  )
}

function EditRow({
  label,
  value,
  onChange,
  onSave,
  onCancel,
  isSaving,
  error,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  error: string
  type?: string
}) {
  return (
    <div style={{ padding: '8px 0' }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: discordColors.textMuted,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave()
          if (e.key === 'Escape') onCancel()
        }}
        type={type}
        autoFocus
        style={{
          width: '100%',
          background: discordColors.searchBg,
          border: `1px solid ${error ? discordColors.red : discordColors.brandPrimary}`,
          borderRadius: 3,
          outline: 'none',
          color: discordColors.textNormal,
          fontSize: 15,
          padding: '8px 10px',
          marginBottom: 4,
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <div style={{ fontSize: 12, color: discordColors.red, marginBottom: 4 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: discordColors.textMuted,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            background: discordColors.brandPrimary,
            border: 'none',
            borderRadius: 3,
            padding: '4px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            cursor: isSaving ? 'default' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: discordColors.border,
        margin: '4px 0',
      }}
    />
  )
}

// Keep the old export name for compatibility
export { SettingsOverlay as Settings }
