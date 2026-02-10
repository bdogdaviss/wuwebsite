import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { discordColors, Avatar } from '@wakeup/ui'
import { useMessageStore } from '../state/messageStore'
import { useAuth } from '../context/AuthContext'
import { Plus, SmilePlus, Gift, ImagePlus, Sticker } from 'lucide-react'

export function DirectMessage() {
  const { id } = useParams<{ id: string }>()
  const { conversations, messages, fetchMessages, sendMessage } = useMessageStore()
  const { api, user } = useAuth()

  const conv = conversations.find((c) => c.id === id)
  const convMessages = messages[id || ''] || []

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Fetch messages when conversation changes
  useEffect(() => {
    if (id) {
      fetchMessages(api, id)
    }
    setInput('')
  }, [id, api, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convMessages.length])

  if (!conv) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: discordColors.textMuted,
          fontSize: 16,
        }}
      >
        Conversation not found
      </div>
    )
  }

  const otherMembers = conv.members?.filter((m) => m.id !== user?.id) || []
  const dmName = conv.type === 'group'
    ? (conv.name || otherMembers.map((m) => m.display_name).join(', ') || 'Group')
    : (otherMembers[0]?.display_name || 'Unknown')

  const handleSend = async () => {
    if (!input.trim() || !id) return
    try {
      await sendMessage(api, id, input.trim())
      setInput('')
    } catch {
      // ignore
    }
  }

  // Color for sender name
  const getSenderColor = (senderId: string): string => {
    const colors = ['#5865f2', '#57f287', '#ed4245', '#fee75c', '#eb459e', '#f0b232']
    let hash = 0
    for (let i = 0; i < senderId.length; i++) hash = senderId.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const getSenderName = (senderId: string): string => {
    if (senderId === user?.id) return 'You'
    const member = conv.members?.find((m) => m.id === senderId)
    return member?.display_name || 'Unknown'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
        {/* DM intro header */}
        <div style={{ padding: '16px 0 24px' }}>
          <div style={{ marginBottom: 12 }}>
            <Avatar src={otherMembers[0]?.avatar_url} fallback={dmName} size="xl" />
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: discordColors.headerPrimary,
              marginBottom: 4,
            }}
          >
            {dmName}
          </div>

          <div
            style={{
              fontSize: 14,
              color: discordColors.textMuted,
              marginBottom: 16,
            }}
          >
            This is the beginning of your direct message history with{' '}
            <span style={{ fontWeight: 600, color: discordColors.textNormal }}>{dmName}</span>.
          </div>
        </div>

        {/* Date separator */}
        {convMessages.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '8px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: discordColors.textMuted,
                padding: '0 8px',
              }}
            >
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </div>
        )}

        {/* Messages */}
        {convMessages.map((msg, i) => {
          const showHeader = i === 0 || convMessages[i - 1].sender_id !== msg.sender_id
          const isMe = msg.sender_id === user?.id
          const senderName = getSenderName(msg.sender_id)
          const senderColor = isMe ? discordColors.headerPrimary : getSenderColor(msg.sender_id)
          const timestamp = new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                padding: showHeader ? '4px 16px 0' : '0 16px 0 72px',
                marginTop: showHeader ? 16 : 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {showHeader && (
                <div style={{ width: 40, marginRight: 16, flexShrink: 0, paddingTop: 2 }}>
                  <Avatar
                    src={isMe ? user?.avatar_url : msg.sender?.avatar_url}
                    fallback={senderName}
                    size="md"
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {showHeader && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: senderColor,
                        cursor: 'pointer',
                      }}
                    >
                      {senderName}
                    </span>
                    <span style={{ fontSize: 12, color: discordColors.textMuted }}>
                      {timestamp}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    fontSize: 15,
                    color: discordColors.textNormal,
                    lineHeight: '22px',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} style={{ height: 24 }} />
      </div>

      {/* Message input */}
      <div style={{ padding: '0 16px 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: discordColors.searchBg,
            borderRadius: 8,
            padding: '0 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '10px 0',
              marginRight: 4,
            }}
          >
            <Plus size={20} color={discordColors.interactiveNormal} />
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            placeholder={`Message @${dmName}`}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: discordColors.textNormal,
              fontSize: 15,
              padding: '11px 8px',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Gift size={20} color={discordColors.interactiveNormal} style={{ cursor: 'pointer' }} />
            <ImagePlus size={20} color={discordColors.interactiveNormal} style={{ cursor: 'pointer' }} />
            <Sticker size={20} color={discordColors.interactiveNormal} style={{ cursor: 'pointer' }} />
            <SmilePlus size={20} color={discordColors.interactiveNormal} style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
