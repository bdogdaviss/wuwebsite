import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { discordColors, Avatar } from '@wakeup/ui'
import { useNestStore } from '../state/nestStore'
import { useMessageStore } from '../state/messageStore'
import { useUIStore } from '../state/uiStore'
import { useAuth } from '../context/AuthContext'
import { Plus, SmilePlus, Gift, ImagePlus, Sticker, Hash } from 'lucide-react'

export function NestChannelView() {
  const { nestId, channelId } = useParams<{ nestId: string; channelId: string }>()
  const { setActiveChannel } = useUIStore()
  const { nestDetails } = useNestStore()
  const { channelMessages, fetchChannelMessages, sendChannelMessage } = useMessageStore()
  const { api, user } = useAuth()

  const nest = nestDetails[nestId || '']
  const channel = nest?.channels.find((c) => c.id === channelId)

  useEffect(() => {
    if (channelId) {
      setActiveChannel(channelId)
      fetchChannelMessages(api, channelId)
    }
  }, [channelId, setActiveChannel, api, fetchChannelMessages])

  const allMessages = channelMessages[channelId || ''] || []

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInput('')
  }, [channelId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  if (!nest || !channel) {
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
        Channel not found
      </div>
    )
  }

  const getSenderColor = (senderId: string): string => {
    const colors = ['#5865f2', '#57f287', '#ed4245', '#fee75c', '#eb459e', '#f0b232']
    let hash = 0
    for (let i = 0; i < senderId.length; i++) hash = senderId.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const getSenderName = (senderId: string): string => {
    if (senderId === user?.id) return 'You'
    const member = nest.members?.find((m) => m.user_id === senderId)
    return member?.user?.display_name || 'Unknown'
  }

  const handleSend = async () => {
    if (!input.trim() || !channelId) return
    try {
      await sendChannelMessage(api, channelId, input.trim())
      setInput('')
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
        {/* Channel welcome */}
        <div style={{ padding: '16px 0 24px' }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: discordColors.bgModifierActive,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Hash size={36} color={discordColors.headerPrimary} />
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: discordColors.headerPrimary,
              marginBottom: 8,
            }}
          >
            Welcome to #{channel.name}!
          </div>
          <div
            style={{
              fontSize: 14,
              color: discordColors.textMuted,
            }}
          >
            This is the start of the #{channel.name} channel in {nest.name}.
          </div>
        </div>

        {/* Date separator */}
        {allMessages.length > 0 && (
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
        {allMessages.map((msg, i) => {
          const showHeader = i === 0 || allMessages[i - 1].sender_id !== msg.sender_id
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
            placeholder={`Message #${channel.name}`}
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
