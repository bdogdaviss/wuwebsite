import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { discordColors } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'
import { useSocialStore } from '../state/socialStore'
import { useMessageStore } from '../state/messageStore'
import { useAuth } from '../context/AuthContext'
import { X, Search, Check, Users } from 'lucide-react'

export function CreateGroupDm() {
  const { isCreateGroupOpen, closeCreateGroup } = useUIStore()
  const { friends } = useSocialStore()
  const { createDM, createGroup } = useMessageStore()
  const { api } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [groupName, setGroupName] = useState('')

  // Map friends to selectable items
  const friendItems = useMemo(() => {
    return friends.map((f) => ({
      id: f.user?.id || f.id,
      name: f.user?.display_name || 'Unknown',
      avatarUrl: f.user?.avatar_url || undefined,
    }))
  }, [friends])

  const filtered = useMemo(() => {
    if (!search) return friendItems
    return friendItems.filter(
      (f) => f.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, friendItems])

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleCreate = async () => {
    if (selected.length === 0) return

    try {
      if (selected.length === 1) {
        const conv = await createDM(api, selected[0])
        useUIStore.getState().unhideDm(conv.id)
        closeCreateGroup()
        setSelected([])
        setSearch('')
        setGroupName('')
        navigate(`/dm/${conv.id}`)
      } else {
        const name = groupName.trim() || friendItems.filter((f) => selected.includes(f.id)).map((f) => f.name).join(', ')
        const conv = await createGroup(api, name, selected)
        closeCreateGroup()
        setSelected([])
        setSearch('')
        setGroupName('')
        navigate(`/dm/${conv.id}`)
      }
    } catch {
      // ignore
    }
  }

  if (!isCreateGroupOpen) return null

  const selectedFriends = friendItems.filter((f) => selected.includes(f.id))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 200,
      }}
      onClick={closeCreateGroup}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          maxHeight: '80vh',
          backgroundColor: discordColors.bgPrimary,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: discordColors.headerPrimary }}>
              Select Friends
            </span>
            <div
              onClick={closeCreateGroup}
              style={{ cursor: 'pointer', display: 'flex', padding: 4 }}
            >
              <X size={20} color={discordColors.interactiveNormal} />
            </div>
          </div>
          <span style={{ fontSize: 12, color: discordColors.textMuted, marginBottom: 12 }}>
            {selected.length === 0
              ? 'Pick friends to start a conversation.'
              : `You can add ${9 - selected.length} more friend${9 - selected.length !== 1 ? 's' : ''}.`}
          </span>

          {/* Selected pills */}
          {selectedFriends.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {selectedFriends.map((f) => (
                <span
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: '#ffffff',
                    backgroundColor: discordColors.brandPrimary,
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {f.name}
                  <X size={10} />
                </span>
              ))}
            </div>
          )}

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 32,
              backgroundColor: discordColors.searchBg,
              borderRadius: 4,
              padding: '0 8px',
              marginBottom: 4,
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: discordColors.textNormal,
                fontSize: 13,
              }}
            />
            <Search size={14} color={discordColors.textMuted} />
          </div>
        </div>

        {/* Friends list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: discordColors.textMuted, fontSize: 14 }}>
              {friends.length === 0 ? 'No friends yet. Add some friends first!' : 'No friends match your search.'}
            </div>
          )}
          {filtered.map((f) => {
            const isSelected = selected.includes(f.id)
            return (
              <div
                key={f.id}
                onClick={() => toggle(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  gap: 10,
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: discordColors.brandPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>
                    {f.name[0]}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: discordColors.textNormal }}>
                    {f.name}
                  </div>
                </div>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: `2px solid ${isSelected ? discordColors.brandPrimary : discordColors.interactiveNormal}`,
                    backgroundColor: isSelected ? discordColors.brandPrimary : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  {isSelected && <Check size={14} color="#ffffff" />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${discordColors.border}` }}>
          {selected.length > 1 && (
            <div style={{ marginBottom: 8 }}>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name (optional)"
                style={{
                  width: '100%',
                  background: discordColors.searchBg,
                  border: 'none',
                  borderRadius: 4,
                  outline: 'none',
                  color: discordColors.textNormal,
                  fontSize: 13,
                  padding: '8px 10px',
                }}
              />
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={selected.length === 0}
            style={{
              width: '100%',
              background: selected.length > 0 ? discordColors.brandPrimary : discordColors.bgModifierActive,
              border: 'none',
              borderRadius: 4,
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 600,
              color: selected.length > 0 ? '#ffffff' : discordColors.textMuted,
              cursor: selected.length > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => {
              if (selected.length > 0) e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <Users size={16} />
            {selected.length <= 1 ? 'Create DM' : 'Create Group DM'}
          </button>
        </div>
      </div>
    </div>
  )
}
