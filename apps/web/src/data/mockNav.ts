import type { Nest, NavItem, DmConversation, NightOwl, MockMessage, InboxNotification } from '../models/nav'

export const nests: Nest[] = [
  {
    id: 'nightowls',
    name: 'Night Owls HQ',
    icon: 'N',
    notifications: 5,
    channels: [
      { id: 'no-general', name: 'general', type: 'text', category: 'Text Channels' },
      { id: 'no-introductions', name: 'introductions', type: 'text', category: 'Text Channels' },
      { id: 'no-late-night-chat', name: 'late-night-chat', type: 'text', category: 'Text Channels' },
      { id: 'no-coding', name: 'coding', type: 'text', category: 'Dev' },
      { id: 'no-show-and-tell', name: 'show-and-tell', type: 'text', category: 'Dev' },
      { id: 'no-debugging', name: 'debugging', type: 'text', category: 'Dev' },
      { id: 'no-lounge', name: 'lounge', type: 'voice', category: 'Voice' },
      { id: 'no-pair-programming', name: 'pair-programming', type: 'voice', category: 'Voice' },
    ],
  },
  {
    id: 'builders',
    name: 'Builders Club',
    icon: 'B',
    notifications: 2,
    channels: [
      { id: 'bc-general', name: 'general', type: 'text', category: 'Text Channels' },
      { id: 'bc-projects', name: 'projects', type: 'text', category: 'Text Channels' },
      { id: 'bc-feedback', name: 'feedback', type: 'text', category: 'Text Channels' },
      { id: 'bc-resources', name: 'resources', type: 'text', category: 'Sharing' },
      { id: 'bc-inspiration', name: 'inspiration', type: 'text', category: 'Sharing' },
      { id: 'bc-build-room', name: 'build-room', type: 'voice', category: 'Voice' },
    ],
  },
  {
    id: 'insomnia',
    name: 'Insomnia Crew',
    icon: 'I',
    notifications: 0,
    channels: [
      { id: 'ic-general', name: 'general', type: 'text', category: 'Text Channels' },
      { id: 'ic-cant-sleep', name: 'cant-sleep', type: 'text', category: 'Text Channels' },
      { id: 'ic-music', name: 'music', type: 'text', category: 'Vibes' },
      { id: 'ic-memes', name: 'memes', type: 'text', category: 'Vibes' },
      { id: 'ic-chill-zone', name: 'chill-zone', type: 'voice', category: 'Voice' },
    ],
  },
]

export const navItems: NavItem[] = [
  { id: 'friends', label: 'Friends', route: '/', icon: 'users' },
  { id: 'discover', label: 'Discover', route: '/discover', icon: 'compass' },
  { id: 'rituals', label: 'Rituals', route: '/rituals', icon: 'moon' },
]

export const dmConversations: DmConversation[] = [
  { id: 'dm1', name: 'Kai', subtitle: 'Building a game engine rn', avatarColor: '#5865f2', status: 'online' },
  { id: 'dm2', name: 'Luna', subtitle: 'PST \u2022 In voice', avatarColor: '#57f287', status: 'online' },
  { id: 'dm3', name: 'Raven', subtitle: 'EST \u2022 Coding', avatarColor: '#ed4245', status: 'dnd' },
  { id: 'dm4', name: 'Sol', subtitle: 'CST \u2022 Designing', avatarColor: '#fee75c', status: 'idle' },
  { id: 'dm5', name: 'Nyx', subtitle: 'GMT \u2022 Writing', avatarColor: '#5865f2', status: 'online' },
  { id: 'dm6', name: 'Late Night Crew', subtitle: '4 Members', avatarColor: '#eb459e', status: 'online', isGroup: true, memberCount: 4 },
  { id: 'dm7', name: 'Atlas', subtitle: 'PST \u2022 Debugging', avatarColor: '#57f287', status: 'online' },
  { id: 'dm8', name: '3AM Squad', subtitle: '6 Members', avatarColor: '#fee75c', status: 'online', isGroup: true, memberCount: 6 },
  { id: 'dm9', name: 'Ember', subtitle: 'EST \u2022 Streaming', avatarColor: '#ed4245', status: 'idle' },
  { id: 'dm10', name: 'Zephyr', subtitle: 'JST \u2022 Drawing', avatarColor: '#5865f2', status: 'offline' },
]

export const nightOwls: NightOwl[] = [
  { id: 'f1', name: 'Kai', status: 'online', activity: 'Building a game engine', timezone: 'PST', interests: ['game-dev', 'rust', 'open-source'], sleepSchedule: '2am-9am' },
  { id: 'f2', name: 'Luna', status: 'online', activity: 'In voice \u2022 Coding session', timezone: 'PST', interests: ['frontend', 'react', 'music'], sleepSchedule: '3am-10am' },
  { id: 'f3', name: 'Atlas', status: 'online', activity: 'Debugging a nasty race condition', timezone: 'PST', interests: ['backend', 'go', 'distributed-systems'], sleepSchedule: '1am-8am' },
  { id: 'f4', name: 'Nyx', status: 'online', activity: 'Writing documentation', timezone: 'GMT', interests: ['technical-writing', 'python', 'devtools'], sleepSchedule: '4am-11am' },
  { id: 'f5', name: 'Raven', status: 'dnd', activity: 'Deep work \u2014 do not disturb', timezone: 'EST', interests: ['security', 'linux', 'hacking'], sleepSchedule: '5am-12pm' },
  { id: 'f6', name: 'Sol', status: 'idle', activity: 'Away for 15m', timezone: 'CST', interests: ['design', 'figma', 'typography'], sleepSchedule: '2am-9am' },
  { id: 'f7', name: 'Ember', status: 'idle', activity: 'Streaming on Twitch', timezone: 'EST', interests: ['streaming', 'gaming', 'community'], sleepSchedule: '4am-11am' },
  { id: 'f8', name: 'Sage', status: 'online', activity: 'Reviewing pull requests', timezone: 'CET', interests: ['code-review', 'typescript', 'testing'], sleepSchedule: '3am-10am' },
  { id: 'f9', name: 'Phoenix', status: 'online', activity: 'Designing UI components', timezone: 'PST', interests: ['design', 'react', 'css'], sleepSchedule: '2am-9am' },
  { id: 'f10', name: 'Orion', status: 'dnd', activity: 'Recording a podcast', timezone: 'CST', interests: ['podcasting', 'audio', 'storytelling'], sleepSchedule: '3am-10am' },
  { id: 'f11', name: 'Nova', status: 'online', activity: 'Pair programming', timezone: 'EST', interests: ['pair-programming', 'mentoring', 'python'], sleepSchedule: '1am-8am' },
  { id: 'f12', name: 'Echo', status: 'offline', activity: 'Last seen 2h ago', timezone: 'GMT', interests: ['music-production', 'ai', 'synthesis'], sleepSchedule: '2am-9am' },
  { id: 'f13', name: 'Zen', status: 'offline', activity: 'Last seen 5h ago', timezone: 'JST', interests: ['meditation', 'minimalism', 'go'], sleepSchedule: '1am-8am' },
  { id: 'f14', name: 'Drift', status: 'online', activity: 'Fixing production bugs', timezone: 'PST', interests: ['devops', 'kubernetes', 'monitoring'], sleepSchedule: '12am-7am' },
  { id: 'f15', name: 'Cosmo', status: 'idle', activity: 'Taking a hydration break', timezone: 'CET', interests: ['wellness', 'productivity', 'journaling'], sleepSchedule: '3am-10am' },
]

export const suggestedOwls: NightOwl[] = [
  { id: 's1', name: 'Vex', status: 'online', activity: 'Building a CLI tool in Rust', timezone: 'PST', interests: ['rust', 'cli-tools', 'open-source'], sleepSchedule: '1am-8am' },
  { id: 's2', name: 'Byte', status: 'online', activity: 'Contributing to OSS projects', timezone: 'PST', interests: ['open-source', 'typescript', 'react'], sleepSchedule: '2am-9am' },
  { id: 's3', name: 'Pixel', status: 'online', activity: 'Prototyping a design system', timezone: 'EST', interests: ['design', 'figma', 'css', 'react'], sleepSchedule: '3am-10am' },
  { id: 's4', name: 'Glitch', status: 'idle', activity: 'Reverse engineering a binary', timezone: 'CST', interests: ['security', 'reverse-engineering', 'ctf'], sleepSchedule: '1am-8am' },
  { id: 's5', name: 'Cipher', status: 'online', activity: 'Writing a cryptography library', timezone: 'GMT', interests: ['cryptography', 'rust', 'math'], sleepSchedule: '4am-11am' },
  { id: 's6', name: 'Flux', status: 'online', activity: 'Training an ML model overnight', timezone: 'PST', interests: ['machine-learning', 'python', 'ai'], sleepSchedule: '2am-9am' },
  { id: 's7', name: 'Mochi', status: 'online', activity: 'Drawing character art', timezone: 'JST', interests: ['art', 'illustration', 'animation'], sleepSchedule: '1am-8am' },
  { id: 's8', name: 'Strobe', status: 'idle', activity: 'Mixing a late-night set', timezone: 'EST', interests: ['music-production', 'dj', 'audio'], sleepSchedule: '3am-10am' },
  { id: 's9', name: 'Wraith', status: 'online', activity: 'Speedrunning a platformer', timezone: 'CST', interests: ['gaming', 'speedrunning', 'streaming'], sleepSchedule: '2am-9am' },
]

export const inboxNotifications: InboxNotification[] = [
  { id: 'n1', type: 'friend_accepted', title: 'Vex', description: 'accepted your friend request', avatarColor: '#5865f2', timeAgo: '2m ago', read: false },
  { id: 'n2', type: 'new_message', title: 'Kai', description: 'sent you a message: "yo check out this new shader I made"', avatarColor: '#5865f2', timeAgo: '5m ago', read: false },
  { id: 'n3', type: 'server_message', title: 'Night Owls HQ', description: '3 new messages in #general', avatarColor: '#57f287', timeAgo: '12m ago', read: false },
  { id: 'n4', type: 'mention', title: 'Luna', description: 'mentioned you in #coding-session', avatarColor: '#57f287', timeAgo: '18m ago', read: false },
  { id: 'n5', type: 'new_message', title: 'Raven', description: 'sent you a message: "found another vuln..."', avatarColor: '#ed4245', timeAgo: '25m ago', read: true },
  { id: 'n6', type: 'friend_accepted', title: 'Byte', description: 'accepted your friend request', avatarColor: '#fee75c', timeAgo: '1h ago', read: true },
  { id: 'n7', type: 'server_message', title: 'Builders Club', description: '7 new messages in #show-and-tell', avatarColor: '#eb459e', timeAgo: '1h ago', read: true },
  { id: 'n8', type: 'mention', title: 'Atlas', description: 'mentioned you in #debugging', avatarColor: '#57f287', timeAgo: '2h ago', read: true },
  { id: 'n9', type: 'new_message', title: 'Sol', description: 'sent you a message: "updated the mockups"', avatarColor: '#fee75c', timeAgo: '3h ago', read: true },
  { id: 'n10', type: 'server_message', title: 'Insomnia Crew', description: '12 new messages in #late-night-chat', avatarColor: '#5865f2', timeAgo: '4h ago', read: true },
]

export const mockMessages: Record<string, MockMessage[]> = {
  dm1: [
    { id: 'm1', senderId: 'me', senderName: 'You', content: 'yo Kai, how\'s the game engine coming along?', timestamp: '2:47 AM' },
    { id: 'm2', senderId: 'dm1', senderName: 'Kai', content: 'dude it\'s going crazy rn, just got physics working', timestamp: '2:48 AM' },
    { id: 'm3', senderId: 'dm1', senderName: 'Kai', content: 'check this out - rigid bodies colliding in real time', timestamp: '2:48 AM' },
    { id: 'm4', senderId: 'me', senderName: 'You', content: 'that\'s insane, what engine are you using under the hood?', timestamp: '2:50 AM' },
    { id: 'm5', senderId: 'dm1', senderName: 'Kai', content: 'custom built in Rust, using wgpu for rendering', timestamp: '2:51 AM' },
    { id: 'm6', senderId: 'me', senderName: 'You', content: 'respect. we should pair on the networking layer sometime', timestamp: '2:53 AM' },
  ],
  dm2: [
    { id: 'm1', senderId: 'dm2', senderName: 'Luna', content: 'you joining the voice channel tonight?', timestamp: '1:30 AM' },
    { id: 'm2', senderId: 'me', senderName: 'You', content: 'yeah give me 10, finishing up this PR', timestamp: '1:32 AM' },
    { id: 'm3', senderId: 'dm2', senderName: 'Luna', content: 'cool, Atlas and Phoenix are already in', timestamp: '1:33 AM' },
  ],
  dm3: [
    { id: 'm1', senderId: 'dm3', senderName: 'Raven', content: 'found a crazy vulnerability in that auth library', timestamp: '3:15 AM' },
    { id: 'm2', senderId: 'me', senderName: 'You', content: 'wait which one??', timestamp: '3:16 AM' },
    { id: 'm3', senderId: 'dm3', senderName: 'Raven', content: 'can\'t say yet, responsible disclosure. but it\'s bad', timestamp: '3:17 AM' },
  ],
  dm4: [
    { id: 'm1', senderId: 'me', senderName: 'You', content: 'Sol those mockups you sent are fire', timestamp: '12:20 AM' },
    { id: 'm2', senderId: 'dm4', senderName: 'Sol', content: 'thanks! been iterating on the spacing all night', timestamp: '12:45 AM' },
  ],
  dm5: [
    { id: 'm1', senderId: 'dm5', senderName: 'Nyx', content: 'just published the new API docs, can you review?', timestamp: '4:00 AM' },
    { id: 'm2', senderId: 'me', senderName: 'You', content: 'on it, sending feedback in 20', timestamp: '4:05 AM' },
  ],
}

export const nestChannelMessages: Record<string, MockMessage[]> = {
  'no-general': [
    { id: 'nc1', senderId: 'f1', senderName: 'Kai', content: 'anyone else still up grinding?', timestamp: '2:30 AM' },
    { id: 'nc2', senderId: 'f2', senderName: 'Luna', content: 'always lol, just hit a flow state', timestamp: '2:31 AM' },
    { id: 'nc3', senderId: 'f8', senderName: 'Sage', content: 'the 2am-4am window is unmatched for deep work', timestamp: '2:33 AM' },
    { id: 'nc4', senderId: 'f14', senderName: 'Drift', content: 'facts. no slack notifications, no meetings, just code', timestamp: '2:35 AM' },
    { id: 'nc5', senderId: 'me', senderName: 'You', content: 'this is why we built this app', timestamp: '2:36 AM' },
  ],
  'no-coding': [
    { id: 'nc1', senderId: 'f3', senderName: 'Atlas', content: 'just found a wild race condition in our queue system', timestamp: '3:15 AM' },
    { id: 'nc2', senderId: 'f11', senderName: 'Nova', content: 'oh no, mutex or channel based?', timestamp: '3:16 AM' },
    { id: 'nc3', senderId: 'f3', senderName: 'Atlas', content: 'channel based, the goroutine was leaking under load', timestamp: '3:17 AM' },
    { id: 'nc4', senderId: 'me', senderName: 'You', content: 'classic. buffered or unbuffered?', timestamp: '3:18 AM' },
  ],
  'no-debugging': [
    { id: 'nc1', senderId: 'f5', senderName: 'Raven', content: 'who else has been bitten by stale closures in useEffect?', timestamp: '1:45 AM' },
    { id: 'nc2', senderId: 'f9', senderName: 'Phoenix', content: 'every single week lol', timestamp: '1:46 AM' },
    { id: 'nc3', senderId: 'f14', senderName: 'Drift', content: 'useRef is your friend', timestamp: '1:47 AM' },
  ],
  'bc-general': [
    { id: 'nc1', senderId: 'f9', senderName: 'Phoenix', content: 'shipped v2 of the design system tonight', timestamp: '3:00 AM' },
    { id: 'nc2', senderId: 'f1', senderName: 'Kai', content: 'lets gooo, the new tokens look clean', timestamp: '3:02 AM' },
    { id: 'nc3', senderId: 'me', senderName: 'You', content: 'nice work phoenix, the spacing system is chef kiss', timestamp: '3:04 AM' },
  ],
  'bc-projects': [
    { id: 'nc1', senderId: 'f11', senderName: 'Nova', content: 'working on a real-time collab editor, anyone want to pair?', timestamp: '2:00 AM' },
    { id: 'nc2', senderId: 'f8', senderName: 'Sage', content: 'im down, what stack?', timestamp: '2:02 AM' },
    { id: 'nc3', senderId: 'f11', senderName: 'Nova', content: 'yjs + hocuspocus for the CRDT layer, react for the frontend', timestamp: '2:03 AM' },
  ],
  'ic-general': [
    { id: 'nc1', senderId: 'f6', senderName: 'Sol', content: 'its 4am and im redesigning my entire portfolio again', timestamp: '4:00 AM' },
    { id: 'nc2', senderId: 'f15', senderName: 'Cosmo', content: 'relatable. hydrate tho', timestamp: '4:01 AM' },
    { id: 'nc3', senderId: 'f7', senderName: 'Ember', content: 'the curse of the creative night owl', timestamp: '4:02 AM' },
  ],
  'ic-cant-sleep': [
    { id: 'nc1', senderId: 'f15', senderName: 'Cosmo', content: 'brain just wont turn off tonight', timestamp: '3:30 AM' },
    { id: 'nc2', senderId: 'f6', senderName: 'Sol', content: 'same, tried everything. ended up sketching UI concepts', timestamp: '3:32 AM' },
    { id: 'nc3', senderId: 'me', senderName: 'You', content: 'might as well be productive right', timestamp: '3:33 AM' },
  ],
}
