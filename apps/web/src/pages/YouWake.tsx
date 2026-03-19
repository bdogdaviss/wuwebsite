import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { discordColors, Avatar } from '@wakeup/ui'
import { useAuth } from '../context/AuthContext'
import { useSocialStore } from '../state/socialStore'
import { useUIStore } from '../state/uiStore'
import { useMessageStore } from '../state/messageStore'
import { MessageCircle } from 'lucide-react'

const YOU_WAKE_KEY = 'wakeup-you-wake-done'

/** Returns true if the user has already gone through the YouWake screen this session */
export function hasCompletedYouWake(): boolean {
  return sessionStorage.getItem(YOU_WAKE_KEY) === '1'
}

export function YouWake() {
  const navigate = useNavigate()
  const { api, user } = useAuth()
  const { friends, onlineFriends, fetchFriends, fetchOnlineFriends } = useSocialStore()
  const { createDM } = useMessageStore()
  const { setUserStatus } = useUIStore()
  const [loading, setLoading] = useState(false)

  // Fetch friends on mount
  useEffect(() => {
    fetchFriends(api)
    fetchOnlineFriends(api)
  }, [api, fetchFriends, fetchOnlineFriends])

  // Build the friends list with wake status
  const friendsList = friends.map((f) => {
    const friendUser = f.user
    const onlineFriend = onlineFriends.find((o) => o.id === friendUser?.id)
    const isAwake = onlineFriend != null && onlineFriend.status !== 'offline'
    return {
      id: f.id,
      userId: f.requester_id === user?.id ? f.addressee_id : f.requester_id,
      name: friendUser?.display_name || 'Unknown',
      avatarUrl: friendUser?.avatar_url || undefined,
      isAwake,
    }
  })

  const handleImAwake = async () => {
    setLoading(true)
    try {
      await api.updateStatus('online')
      setUserStatus('online')
    } catch {
      // continue anyway
    }
    sessionStorage.setItem(YOU_WAKE_KEY, '1')
    navigate('/', { replace: true })
  }

  const handleGoBackToSleep = async () => {
    setLoading(true)
    try {
      await api.updateStatus('offline')
      setUserStatus('offline')
    } catch {
      // continue anyway
    }
    sessionStorage.setItem(YOU_WAKE_KEY, '1')
    navigate('/', { replace: true })
  }

  const handleMessageFriend = async (friendUserId: string) => {
    try {
      const conv = await createDM(api, friendUserId)
      useUIStore.getState().unhideDm(conv.id)
      // Set as awake since they're interacting
      await api.updateStatus('online')
      setUserStatus('online')
      sessionStorage.setItem(YOU_WAKE_KEY, '1')
      navigate(`/dm/${conv.id}`, { replace: true })
    } catch {
      // ignore
    }
  }

  const awakeFriends = friendsList.filter((f) => f.isAwake)
  const sleepingFriends = friendsList.filter((f) => !f.isAwake)

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo */}
        <img src="/logo.png" alt="Wakeup" style={styles.logo} />

        {/* Title */}
        <h1 style={styles.title}>You Wake?</h1>
        <p style={styles.subtitle}>See who's up right now</p>

        {/* Friends list */}
        <div style={styles.friendsList}>
          {/* Awake section */}
          {awakeFriends.length > 0 && (
            <>
              <div style={styles.sectionHeader}>
                <span style={styles.dot('#44A25B')} />
                Awake — {awakeFriends.length}
              </div>
              {awakeFriends.map((friend) => (
                <FriendRow
                  key={friend.id}
                  name={friend.name}
                  avatarUrl={friend.avatarUrl}
                  isAwake
                  onMessage={() => handleMessageFriend(friend.userId)}
                />
              ))}
            </>
          )}

          {/* Sleeping section */}
          {sleepingFriends.length > 0 && (
            <>
              <div style={{ ...styles.sectionHeader, marginTop: awakeFriends.length > 0 ? 16 : 0 }}>
                <span style={styles.dot('#f23f43')} />
                Sleeping — {sleepingFriends.length}
              </div>
              {sleepingFriends.map((friend) => (
                <FriendRow
                  key={friend.id}
                  name={friend.name}
                  avatarUrl={friend.avatarUrl}
                  isAwake={false}
                />
              ))}
            </>
          )}

          {friendsList.length === 0 && (
            <div style={styles.emptyState}>
              No friends yet. Add some friends to see who's awake!
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={styles.buttons}>
          <button
            onClick={handleImAwake}
            disabled={loading}
            style={styles.awakeButton}
          >
            I'm Awake
          </button>
          <button
            onClick={handleGoBackToSleep}
            disabled={loading}
            style={styles.sleepButton}
          >
            Going Back to Sleep
          </button>
        </div>
      </div>
    </div>
  )
}

function FriendRow({
  name,
  avatarUrl,
  isAwake,
  onMessage,
}: {
  name: string
  avatarUrl?: string
  isAwake: boolean
  onMessage?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        ...styles.friendRow,
        backgroundColor: hovered ? discordColors.bgModifierHover : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.friendInfo}>
        <div style={styles.avatarContainer}>
          <Avatar src={avatarUrl} fallback={name} size="sm" />
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: isAwake ? '#44A25B' : '#f23f43',
            }}
          />
        </div>
        <span style={styles.friendName}>{name}</span>
      </div>
      <div style={styles.friendActions}>
        <span
          style={{
            ...styles.statusLabel,
            color: isAwake ? '#44A25B' : '#f23f43',
          }}
        >
          {isAwake ? 'Y' : 'N'}
        </span>
        {isAwake && onMessage && (
          <button onClick={onMessage} style={styles.messageButton}>
            <MessageCircle size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: discordColors.bgPrimary,
    padding: 20,
  } as React.CSSProperties,
  content: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as React.CSSProperties,
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    marginBottom: 16,
  } as React.CSSProperties,
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  subtitle: {
    color: discordColors.textMuted,
    fontSize: 15,
    margin: '4px 0 24px',
  } as React.CSSProperties,
  friendsList: {
    width: '100%',
    backgroundColor: discordColors.bgSecondary,
    borderRadius: 12,
    padding: '8px 0',
    maxHeight: '50vh',
    overflowY: 'auto',
  } as React.CSSProperties,
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px 4px',
    fontSize: 12,
    fontWeight: 700,
    color: discordColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  } as React.CSSProperties,
  dot: (color: string) =>
    ({
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
      flexShrink: 0,
    }) as React.CSSProperties,
  friendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: 8,
    margin: '0 4px',
    minHeight: 52,
    transition: 'background-color 0.1s',
  } as React.CSSProperties,
  friendInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  } as React.CSSProperties,
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  } as React.CSSProperties,
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: `2px solid ${discordColors.bgSecondary}`,
  } as React.CSSProperties,
  friendName: {
    color: discordColors.textNormal,
    fontSize: 15,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  friendActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  } as React.CSSProperties,
  statusLabel: {
    fontSize: 14,
    fontWeight: 700,
    width: 20,
    textAlign: 'center',
  } as React.CSSProperties,
  messageButton: {
    background: 'none',
    border: 'none',
    color: discordColors.textMuted,
    cursor: 'pointer',
    padding: 10,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  } as React.CSSProperties,
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center',
    color: discordColors.textMuted,
    fontSize: 14,
  } as React.CSSProperties,
  buttons: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 24,
  } as React.CSSProperties,
  awakeButton: {
    width: '100%',
    padding: '16px 0',
    borderRadius: 12,
    border: 'none',
    backgroundColor: '#44A25B',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    minHeight: 52,
  } as React.CSSProperties,
  sleepButton: {
    width: '100%',
    padding: '16px 0',
    borderRadius: 12,
    border: 'none',
    backgroundColor: '#f23f43',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    minHeight: 52,
  } as React.CSSProperties,
}
