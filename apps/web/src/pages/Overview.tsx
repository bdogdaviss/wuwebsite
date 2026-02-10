import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { discordColors, Avatar, StatusDot } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'
import { useSocialStore } from '../state/socialStore'
import { useMessageStore } from '../state/messageStore'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, MoreVertical, Search, Clock, UserX, Check, XCircle, UserPlus } from 'lucide-react'
import type { User } from '@wakeup/api-client'

export function Overview() {
  const { friendsTab } = useUIStore()

  if (friendsTab === 'add') {
    return <AddFriendView />
  }

  return <FriendsListView />
}

// ─── Friends List (Online / All / Pending tabs) ─────────────────────

function FriendsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { friendsTab } = useUIStore()
  const { friends, pendingRequests, onlineFriends, removeFriend: removeFriendApi, acceptRequest, rejectRequest } = useSocialStore()
  const { createDM } = useMessageStore()
  const { api, user } = useAuth()

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpenId) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpenId])

  const openDm = async (friendUserId: string) => {
    try {
      const conv = await createDM(api, friendUserId)
      useUIStore.getState().unhideDm(conv.id)
      navigate(`/dm/${conv.id}`)
    } catch {
      // ignore
    }
  }

  const filtered = useMemo(() => {
    if (friendsTab === 'pending') {
      let items = pendingRequests.map((f) => ({
        id: f.id,
        friendshipId: f.id,
        userId: f.requester_id === user?.id ? f.addressee_id : f.requester_id,
        name: f.user?.display_name || 'Unknown',
        avatarUrl: f.user?.avatar_url || undefined,
        status: 'online' as const,
        activity: f.requester_id === user?.id ? 'Outgoing request' : 'Incoming request',
        isIncoming: f.requester_id !== user?.id,
      }))
      if (searchQuery) {
        items = items.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }
      return items
    }

    let items = friends.map((f) => {
      const onlineFriend = onlineFriends.find((o) => o.id === f.user?.id)
      return {
        id: f.id,
        friendshipId: f.id,
        userId: f.requester_id === user?.id ? f.addressee_id : f.requester_id,
        name: f.user?.display_name || 'Unknown',
        avatarUrl: f.user?.avatar_url || undefined,
        status: (onlineFriend?.status || 'offline') as 'online' | 'idle' | 'dnd' | 'offline',
        activity: onlineFriend?.status === 'dnd' ? 'Do Not Disturb' : onlineFriend?.status || 'Offline',
        isIncoming: false,
      }
    })

    if (friendsTab === 'online') {
      items = items.filter((f) => f.status !== 'offline')
    }

    if (searchQuery) {
      items = items.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return items
  }, [friendsTab, searchQuery, friends, pendingRequests, onlineFriends, user?.id])

  const counterLabel =
    friendsTab === 'online'
      ? `Online \u2014 ${filtered.length}`
      : friendsTab === 'all'
        ? `All Friends \u2014 ${filtered.length}`
        : `Pending \u2014 ${filtered.length}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            backgroundColor: discordColors.searchBg,
            borderRadius: 4,
            padding: '0 8px',
          }}
        >
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: discordColors.textNormal,
              fontSize: 14,
            }}
          />
          <Search size={16} color={discordColors.textMuted} />
        </div>
      </div>

      {/* Counter */}
      <div style={{ padding: '12px 20px 4px' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: discordColors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          {counterLabel}
        </span>
      </div>

      {/* Friend list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {filtered.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 16px',
              textAlign: 'center',
            }}
          >
            <Clock size={48} color={discordColors.textMuted} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, color: discordColors.textMuted }}>
              {friendsTab === 'pending' ? 'No pending friend requests' : 'No friends found'}
            </div>
          </div>
        )}
        {filtered.map((item, index) => {
          const isHovered = hoveredId === item.id
          return (
            <div key={item.id}>
              {index > 0 && !isHovered && hoveredId !== filtered[index - 1]?.id && (
                <div
                  style={{
                    height: 1,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    margin: '0 12px',
                  }}
                />
              )}
              <div
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  backgroundColor: isHovered ? discordColors.bgModifierHover : 'transparent',
                  transition: 'background-color 0.1s',
                }}
              >
                <div style={{ position: 'relative', marginRight: 12, flexShrink: 0 }}>
                  <Avatar src={item.avatarUrl} fallback={item.name} size="md" />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      borderRadius: '50%',
                      border: `3px solid ${isHovered ? discordColors.bgModifierHover : discordColors.bgPrimary}`,
                      display: 'flex',
                    }}
                  >
                    <StatusDot status={item.status} size="sm" />
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: discordColors.textNormal,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: discordColors.textMuted,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {item.activity}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: 8, position: 'relative' }}>
                  {friendsTab === 'pending' && item.isIncoming ? (
                    <>
                      <ActionCircle onClick={() => acceptRequest(api, item.friendshipId)}>
                        <Check size={18} color={discordColors.green} />
                      </ActionCircle>
                      <ActionCircle onClick={() => rejectRequest(api, item.friendshipId)}>
                        <XCircle size={18} color={discordColors.red} />
                      </ActionCircle>
                    </>
                  ) : friendsTab !== 'pending' ? (
                    <>
                      <ActionCircle onClick={() => openDm(item.userId)}>
                        <MessageCircle size={18} color={discordColors.interactiveNormal} />
                      </ActionCircle>
                      <ActionCircle onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}>
                        <MoreVertical size={18} color={discordColors.interactiveNormal} />
                      </ActionCircle>
                      {menuOpenId === item.id && (
                        <div
                          ref={menuRef}
                          style={{
                            position: 'absolute',
                            top: 40,
                            right: 0,
                            width: 188,
                            backgroundColor: '#111214',
                            borderRadius: 4,
                            padding: '6px 8px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.24)',
                            zIndex: 100,
                          }}
                        >
                          <ContextMenuItem
                            icon={<MessageCircle size={16} />}
                            label="Message"
                            onClick={() => {
                              setMenuOpenId(null)
                              openDm(item.userId)
                            }}
                          />
                          <ContextMenuItem
                            icon={<UserX size={16} />}
                            label="Remove Friend"
                            danger
                            onClick={() => {
                              setMenuOpenId(null)
                              removeFriendApi(api, item.friendshipId)
                            }}
                          />
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Add Friend View ─────────────────────────────────────────────────

function AddFriendView() {
  const { api } = useAuth()
  const { sendRequest, friends, fetchFriends, fetchPending } = useSocialStore()
  const [searchInput, setSearchInput] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())
  const [errorFor, setErrorFor] = useState<Record<string, string>>({})
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (searchInput.trim().length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await api.searchUsers(searchInput.trim())
        setResults(res.users || [])
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchInput, api])

  const handleSend = async (userId: string) => {
    try {
      await sendRequest(api, userId)
      setSentTo((prev) => new Set(prev).add(userId))
      // Refresh lists so UI updates
      fetchFriends(api)
      fetchPending(api)
    } catch {
      setErrorFor((prev) => ({ ...prev, [userId]: 'Failed to send request' }))
    }
  }

  // IDs of existing friends to hide from results
  const friendUserIds = useMemo(() => {
    const ids = new Set<string>()
    for (const f of friends) {
      if (f.user?.id) ids.add(f.user.id)
    }
    return ids
  }, [friends])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: discordColors.headerPrimary,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Add Friend
        </div>
        <div
          style={{
            fontSize: 14,
            color: discordColors.textMuted,
            lineHeight: '20px',
            marginBottom: 16,
          }}
        >
          Search for friends by their username or email.
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: discordColors.searchBg,
            borderRadius: 8,
            padding: '4px 8px 4px 16px',
          }}
        >
          <Search size={16} color={discordColors.textMuted} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username or email"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: discordColors.textNormal,
              fontSize: 15,
              padding: '8px 0',
            }}
          />
        </div>
      </div>

      {/* Search results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
        {searching && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: discordColors.textMuted, fontSize: 14 }}>
            Searching...
          </div>
        )}
        {!searching && searchInput.trim().length >= 2 && results.length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: discordColors.textMuted, fontSize: 14 }}>
            No users found matching "{searchInput}".
          </div>
        )}
        {results.map((u) => {
          const alreadyFriend = friendUserIds.has(u.id)
          const alreadySent = sentTo.has(u.id)
          const error = errorFor[u.id]
          return (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                gap: 12,
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = discordColors.bgModifierHover }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: discordColors.brandPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 600 }}>
                  {u.display_name?.[0] || '?'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: discordColors.textNormal }}>
                  {u.display_name}
                </div>
                {error && (
                  <div style={{ fontSize: 12, color: discordColors.red }}>{error}</div>
                )}
              </div>
              {alreadyFriend ? (
                <span style={{ fontSize: 12, color: discordColors.textMuted }}>Already friends</span>
              ) : alreadySent ? (
                <span style={{ fontSize: 12, color: discordColors.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={14} /> Sent
                </span>
              ) : (
                <button
                  onClick={() => handleSend(u.id)}
                  style={{
                    background: discordColors.brandPrimary,
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <UserPlus size={14} />
                  Send Request
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Shared Components ──────────────────────────────────────────────

function ActionCircle({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: discordColors.bgSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {children}
    </div>
  )
}

function ContextMenuItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        borderRadius: 2,
        cursor: 'pointer',
        fontSize: 14,
        color: danger ? discordColors.red : discordColors.interactiveNormal,
        transition: 'background-color 0.1s, color 0.1s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger ? discordColors.red : discordColors.brandPrimary
        e.currentTarget.style.color = '#ffffff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = danger ? discordColors.red : discordColors.interactiveNormal
      }}
    >
      {icon}
      {label}
    </div>
  )
}
