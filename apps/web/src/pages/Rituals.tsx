import { useState, useEffect, useRef, useCallback } from 'react'
import { discordColors, Avatar, StatusDot } from '@wakeup/ui'
// Inline mock owl data for rituals UI (rituals don't have backend yet)
const nightOwls = [
  { id: 'f1', name: 'Kai', status: 'online' as const, activity: 'Building a game engine' },
  { id: 'f2', name: 'Luna', status: 'online' as const, activity: 'In voice' },
  { id: 'f3', name: 'Atlas', status: 'online' as const, activity: 'Debugging' },
  { id: 'f4', name: 'Nyx', status: 'online' as const, activity: 'Writing docs' },
  { id: 'f5', name: 'Raven', status: 'dnd' as const, activity: 'Deep work' },
  { id: 'f6', name: 'Sol', status: 'idle' as const, activity: 'Away' },
  { id: 'f7', name: 'Ember', status: 'idle' as const, activity: 'Streaming' },
  { id: 'f8', name: 'Sage', status: 'online' as const, activity: 'Reviewing PRs' },
  { id: 'f9', name: 'Phoenix', status: 'online' as const, activity: 'Designing' },
  { id: 'f10', name: 'Orion', status: 'dnd' as const, activity: 'Recording' },
  { id: 'f11', name: 'Nova', status: 'online' as const, activity: 'Pair programming' },
  { id: 'f12', name: 'Echo', status: 'offline' as const, activity: 'Last seen 2h ago' },
  { id: 'f13', name: 'Zen', status: 'offline' as const, activity: 'Last seen 5h ago' },
  { id: 'f14', name: 'Drift', status: 'online' as const, activity: 'Fixing prod bugs' },
  { id: 'f15', name: 'Cosmo', status: 'idle' as const, activity: 'Hydration break' },
]
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Activity,
  Moon,
  Sun,
  Coffee,
  Flame,
  Users,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Zap,
} from 'lucide-react'

// ─── Mock Data ──────────────────────────────────────────────────────

const FOCUS_PRESETS = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
]

const friendsInFocus = [
  { owl: nightOwls[0], timeLeft: '18:42', session: '25 min' },
  { owl: nightOwls[1], timeLeft: '32:11', session: '45 min' },
  { owl: nightOwls[7], timeLeft: '54:03', session: '60 min' },
]

interface Ritual {
  id: string
  name: string
  icon: 'droplets' | 'stretch' | 'coffee' | 'moon' | 'sun' | 'flame'
  frequency: string
  streak: number
  completedToday: boolean
  participants: string[] // owl names
  nextReminder?: string
}

const mockRituals: Ritual[] = [
  { id: 'r1', name: 'Hydrate', icon: 'droplets', frequency: 'Every hour', streak: 12, completedToday: false, participants: ['Kai', 'Luna', 'Atlas'], nextReminder: '2:00 AM' },
  { id: 'r2', name: 'Stretch Break', icon: 'stretch', frequency: 'Every 2 hours', streak: 5, completedToday: false, participants: ['Luna', 'Phoenix'], nextReminder: '2:30 AM' },
  { id: 'r3', name: 'Coffee Refill', icon: 'coffee', frequency: 'Every 3 hours', streak: 8, completedToday: true, participants: ['Kai', 'Raven', 'Drift'], nextReminder: '4:00 AM' },
  { id: 'r4', name: 'Wind Down', icon: 'moon', frequency: 'Daily at 5am', streak: 3, completedToday: false, participants: ['Nyx', 'Sol'], nextReminder: '5:00 AM' },
  { id: 'r5', name: 'Sunrise Check', icon: 'sun', frequency: 'Daily at 6am', streak: 1, completedToday: false, participants: ['Echo'], nextReminder: '6:00 AM' },
  { id: 'r6', name: 'Deep Work Warmup', icon: 'flame', frequency: 'Daily at 12am', streak: 15, completedToday: true, participants: ['Kai', 'Atlas', 'Raven', 'Drift', 'Nova'], nextReminder: 'Tomorrow 12:00 AM' },
]

interface CheckIn {
  id: string
  name: string
  time: string
  participants: typeof nightOwls
  responses: { owlId: string; mood: string; note: string }[]
  isActive: boolean
}

const mockCheckIns: CheckIn[] = [
  {
    id: 'c1',
    name: '3AM Vibe Check',
    time: '3:00 AM',
    participants: [nightOwls[0], nightOwls[1], nightOwls[2], nightOwls[7]],
    responses: [
      { owlId: 'f1', mood: 'locked-in', note: 'Physics engine is working perfectly' },
      { owlId: 'f2', mood: 'vibing', note: 'This playlist hits different at 3am' },
    ],
    isActive: true,
  },
  {
    id: 'c2',
    name: 'Sunrise Wind-down',
    time: '5:30 AM',
    participants: [nightOwls[3], nightOwls[4], nightOwls[11]],
    responses: [],
    isActive: false,
  },
  {
    id: 'c3',
    name: 'Midnight Standup',
    time: '12:00 AM',
    participants: [nightOwls[0], nightOwls[2], nightOwls[4], nightOwls[13]],
    responses: [
      { owlId: 'f1', mood: 'productive', note: 'Shipped 3 features today' },
      { owlId: 'f3', mood: 'debugging', note: 'Still fighting that race condition' },
      { owlId: 'f5', mood: 'focused', note: 'Deep in the code' },
      { owlId: 'f14', mood: 'tired', note: 'On-call but nothing happening' },
    ],
    isActive: false,
  },
]

const moodLabels = ['locked-in', 'vibing', 'productive', 'debugging', 'focused', 'tired', 'chill']

const ritualIcons: Record<string, React.ReactNode> = {
  droplets: <Droplets size={18} />,
  stretch: <Activity size={18} />,
  coffee: <Coffee size={18} />,
  moon: <Moon size={18} />,
  sun: <Sun size={18} />,
  flame: <Flame size={18} />,
}

// ─── Main Component ─────────────────────────────────────────────────

export function Rituals() {
  const [expandedSection, setExpandedSection] = useState<'focus' | 'rituals' | 'checkins' | null>(null)

  const toggleSection = (section: 'focus' | 'rituals' | 'checkins') => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: discordColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 16 }}>
          Ritual Sync
        </div>
      </div>

      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Focus Timer Section */}
        <SectionCard
          title="Focus Timer"
          subtitle={`${friendsInFocus.length} friends focusing now`}
          icon={<Zap size={18} color={discordColors.yellow} />}
          isExpanded={expandedSection === 'focus'}
          onToggle={() => toggleSection('focus')}
          accentColor={discordColors.yellow}
        >
          <FocusTimerSection />
        </SectionCard>

        {/* Shared Rituals Section */}
        <SectionCard
          title="Shared Rituals"
          subtitle={`${mockRituals.filter((r) => !r.completedToday).length} remaining today`}
          icon={<Flame size={18} color={discordColors.green} />}
          isExpanded={expandedSection === 'rituals'}
          onToggle={() => toggleSection('rituals')}
          accentColor={discordColors.green}
        >
          <SharedRitualsSection />
        </SectionCard>

        {/* Check-ins Section */}
        <SectionCard
          title="Check-ins"
          subtitle={mockCheckIns.find((c) => c.isActive) ? '1 active now' : 'Next at ' + mockCheckIns.find((c) => !c.isActive)?.time}
          icon={<MessageCircle size={18} color={discordColors.brandPrimary} />}
          isExpanded={expandedSection === 'checkins'}
          onToggle={() => toggleSection('checkins')}
          accentColor={discordColors.brandPrimary}
        >
          <CheckInsSection />
        </SectionCard>
      </div>
    </div>
  )
}

// ─── Section Card Wrapper ───────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  icon,
  isExpanded,
  onToggle,
  accentColor,
  children,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        backgroundColor: discordColors.bgSecondary,
        borderRadius: 8,
        overflow: 'hidden',
        borderLeft: `3px solid ${isExpanded ? accentColor : 'transparent'}`,
        transition: 'border-color 0.2s',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          cursor: 'pointer',
          gap: 12,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {icon}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: discordColors.headerPrimary }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: discordColors.textMuted }}>
            {subtitle}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} color={discordColors.interactiveNormal} />
        ) : (
          <ChevronDown size={18} color={discordColors.interactiveNormal} />
        )}
      </div>
      {isExpanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Focus Timer ────────────────────────────────────────────────────

function FocusTimerSection() {
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [timeLeft, setTimeLeft] = useState(FOCUS_PRESETS[0].seconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(FOCUS_PRESETS[selectedPreset].seconds)
  }, [selectedPreset])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = 1 - timeLeft / FOCUS_PRESETS[selectedPreset].seconds

  return (
    <div>
      {/* Timer display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '16px 0' }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          {/* Progress ring */}
          <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={60} cy={60} r={52} fill="none" stroke={discordColors.bgModifierActive} strokeWidth={6} />
            <circle
              cx={60} cy={60} r={52}
              fill="none"
              stroke={isRunning ? discordColors.yellow : discordColors.textMuted}
              strokeWidth={6}
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Time text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: discordColors.headerPrimary, fontVariantNumeric: 'tabular-nums' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            {isRunning && (
              <span style={{ fontSize: 10, color: discordColors.yellow, fontWeight: 600, textTransform: 'uppercase' }}>
                Focusing
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Preset buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FOCUS_PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                onClick={() => {
                  setSelectedPreset(i)
                  setTimeLeft(preset.seconds)
                  setIsRunning(false)
                }}
                style={{
                  background: selectedPreset === i ? discordColors.yellow : discordColors.bgModifierActive,
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: selectedPreset === i ? '#000' : discordColors.textMuted,
                  cursor: 'pointer',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            {!isRunning ? (
              <button
                onClick={startTimer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: discordColors.green,
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <Play size={14} /> {timeLeft < FOCUS_PRESETS[selectedPreset].seconds ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: discordColors.yellow,
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#000',
                  cursor: 'pointer',
                }}
              >
                <Pause size={14} /> Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: discordColors.bgModifierActive,
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: discordColors.textMuted,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Friends focusing now */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: discordColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 8 }}>
          Friends Focusing Now
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {friendsInFocus.map((f) => (
            <div
              key={f.owl.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 8px',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = discordColors.bgModifierHover }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar fallback={f.owl.name} size="sm" />
                <div style={{ position: 'absolute', bottom: -1, right: -1, borderRadius: '50%', border: `2px solid ${discordColors.bgSecondary}`, display: 'flex' }}>
                  <StatusDot status={f.owl.status} size="sm" />
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: discordColors.textNormal, flex: 1 }}>
                {f.owl.name}
              </span>
              <span style={{ fontSize: 12, color: discordColors.yellow, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {f.timeLeft}
              </span>
              <span style={{ fontSize: 11, color: discordColors.textMuted }}>
                {f.session}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Shared Rituals ─────────────────────────────────────────────────

function SharedRitualsSection() {
  const [rituals, setRituals] = useState(mockRituals)

  const toggleComplete = (id: string) => {
    setRituals((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, completedToday: !r.completedToday, streak: r.completedToday ? r.streak - 1 : r.streak + 1 }
          : r
      )
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {rituals.map((ritual) => (
        <div
          key={ritual.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 8px',
            borderRadius: 6,
            opacity: ritual.completedToday ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = discordColors.bgModifierHover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {/* Checkbox */}
          <div
            onClick={() => toggleComplete(ritual.id)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: `2px solid ${ritual.completedToday ? discordColors.green : discordColors.interactiveNormal}`,
              backgroundColor: ritual.completedToday ? discordColors.green : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {ritual.completedToday && <Check size={14} color="#fff" />}
          </div>

          {/* Icon */}
          <div style={{ color: ritual.completedToday ? discordColors.green : discordColors.textMuted, display: 'flex', flexShrink: 0 }}>
            {ritualIcons[ritual.icon]}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: ritual.completedToday ? discordColors.textMuted : discordColors.textNormal,
                textDecoration: ritual.completedToday ? 'line-through' : 'none',
              }}>
                {ritual.name}
              </span>
              {ritual.streak > 0 && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: ritual.streak >= 10 ? discordColors.yellow : discordColors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <Flame size={11} /> {ritual.streak}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: discordColors.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{ritual.frequency}</span>
              {ritual.nextReminder && !ritual.completedToday && (
                <>
                  <span style={{ opacity: 0.4 }}>&bull;</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {ritual.nextReminder}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Participant avatars */}
          <div style={{ display: 'flex', flexShrink: 0 }}>
            {ritual.participants.slice(0, 3).map((name, i) => (
              <div
                key={name}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: discordColors.brandPrimary,
                  border: `2px solid ${discordColors.bgSecondary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: i > 0 ? -6 : 0,
                  zIndex: 3 - i,
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 600, color: '#fff' }}>{name[0]}</span>
              </div>
            ))}
            {ritual.participants.length > 3 && (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: discordColors.bgModifierActive,
                  border: `2px solid ${discordColors.bgSecondary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: -6,
                  fontSize: 9,
                  fontWeight: 600,
                  color: discordColors.textMuted,
                }}
              >
                +{ritual.participants.length - 3}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Check-ins ──────────────────────────────────────────────────────

function CheckInsSection() {
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')

  const moods = moodLabels

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {mockCheckIns.map((checkin) => (
        <div
          key={checkin.id}
          style={{
            backgroundColor: discordColors.bgPrimary,
            borderRadius: 8,
            padding: 12,
            border: checkin.isActive ? `1px solid ${discordColors.brandPrimary}` : `1px solid transparent`,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {checkin.isActive && (
              <div style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: discordColors.green,
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: discordColors.headerPrimary }}>
              {checkin.name}
            </span>
            <span style={{ fontSize: 12, color: discordColors.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {checkin.time}
            </span>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} color={discordColors.textMuted} />
              <span style={{ fontSize: 12, color: discordColors.textMuted }}>{checkin.participants.length}</span>
            </div>
          </div>

          {/* Responses */}
          {checkin.responses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              {checkin.responses.map((response) => {
                const owl = nightOwls.find((o) => o.id === response.owlId)
                if (!owl) return null
                return (
                  <div key={response.owlId} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0' }}>
                    <Avatar fallback={owl.name} size="sm" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: discordColors.textNormal }}>{owl.name}</span>
                        <span style={{ fontSize: 12, color: discordColors.textMuted }}>{response.mood}</span>
                      </div>
                      <div style={{ fontSize: 13, color: discordColors.textMuted }}>{response.note}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Respond button / form */}
          {checkin.isActive && (
            respondingTo === checkin.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Mood selector */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {moods.map((key) => (
                    <button
                      key={key}
                      onClick={() => setMood(key)}
                      style={{
                        background: mood === key ? discordColors.brandPrimary : discordColors.bgModifierActive,
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 12,
                        color: mood === key ? '#fff' : discordColors.textMuted,
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
                {/* Note input */}
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What are you working on?"
                  style={{
                    background: discordColors.searchBg,
                    border: 'none',
                    borderRadius: 4,
                    outline: 'none',
                    color: discordColors.textNormal,
                    fontSize: 13,
                    padding: '8px 10px',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setRespondingTo(null); setMood(''); setNote('') }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: 13,
                      color: discordColors.textMuted,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setRespondingTo(null); setMood(''); setNote('') }}
                    disabled={!mood}
                    style={{
                      background: mood ? discordColors.brandPrimary : discordColors.bgModifierActive,
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: mood ? '#fff' : discordColors.textMuted,
                      cursor: mood ? 'pointer' : 'default',
                    }}
                  >
                    Check In
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setRespondingTo(checkin.id)}
                style={{
                  background: discordColors.brandPrimary,
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <MessageCircle size={14} /> Check In Now
              </button>
            )
          )}

          {/* Upcoming indicator */}
          {!checkin.isActive && checkin.responses.length === 0 && (
            <div style={{ fontSize: 12, color: discordColors.textMuted, fontStyle: 'italic' }}>
              Upcoming &mdash; starts at {checkin.time}
            </div>
          )}
          {!checkin.isActive && checkin.responses.length > 0 && (
            <div style={{ fontSize: 12, color: discordColors.textMuted }}>
              Completed &mdash; {checkin.responses.length} response{checkin.responses.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
