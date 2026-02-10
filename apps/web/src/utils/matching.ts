import type { NightOwl, MatchSuggestion } from '../models/nav'

const tzOffsets: Record<string, number> = {
  PST: -8,
  MST: -7,
  CST: -6,
  EST: -5,
  GMT: 0,
  CET: 1,
  EET: 2,
  IST: 5.5,
  JST: 9,
  AEST: 10,
}

function timezoneScore(userTz: string, candidateTz?: string): { score: number; reason?: string } {
  if (!candidateTz) return { score: 0 }
  const userOffset = tzOffsets[userTz] ?? 0
  const candidateOffset = tzOffsets[candidateTz] ?? 0
  const diff = Math.abs(userOffset - candidateOffset)

  if (diff === 0) return { score: 40, reason: `Same timezone (${candidateTz})` }
  if (diff <= 2) return { score: 25, reason: `Nearby timezone (${candidateTz})` }
  if (diff <= 4) return { score: 10, reason: `${candidateTz} timezone` }
  return { score: 0 }
}

function interestScore(
  userInterests: string[],
  candidateInterests?: string[]
): { score: number; mutual: string[]; reason?: string } {
  if (!candidateInterests || userInterests.length === 0)
    return { score: 0, mutual: [] }

  const mutual = userInterests.filter((i) => candidateInterests.includes(i))
  const score = Math.min(mutual.length * 10, 40)
  const reason =
    mutual.length > 0
      ? `Both into ${mutual.slice(0, 2).join(', ')}${mutual.length > 2 ? ` +${mutual.length - 2} more` : ''}`
      : undefined

  return { score, mutual, reason }
}

function onlineScore(status: string): { score: number; reason?: string } {
  if (status === 'online') return { score: 10, reason: 'Online right now' }
  if (status === 'idle') return { score: 5 }
  return { score: 0 }
}

function sleepScore(userSchedule: string, candidateSchedule?: string): { score: number; reason?: string } {
  if (!candidateSchedule || !userSchedule) return { score: 0 }
  // Simple overlap check — if both are night owls with similar schedules, they match
  const userStart = parseInt(userSchedule)
  const candidateStart = parseInt(candidateSchedule)
  if (isNaN(userStart) || isNaN(candidateStart)) return { score: 5, reason: 'Night owl schedule' }

  const diff = Math.abs(userStart - candidateStart)
  if (diff <= 1) return { score: 10, reason: 'Similar sleep schedule' }
  if (diff <= 2) return { score: 5, reason: 'Compatible schedule' }
  return { score: 0 }
}

export function computeMatches(
  userTimezone: string,
  userInterests: string[],
  userSleepSchedule: string,
  candidates: NightOwl[]
): MatchSuggestion[] {
  return candidates
    .map((owl) => {
      const tz = timezoneScore(userTimezone, owl.timezone)
      const interest = interestScore(userInterests, owl.interests)
      const online = onlineScore(owl.status)
      const sleep = sleepScore(userSleepSchedule, owl.sleepSchedule)

      const total = tz.score + interest.score + online.score + sleep.score
      const reasons = [tz.reason, interest.reason, online.reason, sleep.reason].filter(
        Boolean
      ) as string[]

      return {
        owl,
        compatibility: total,
        reasons,
        mutualInterests: interest.mutual,
      }
    })
    .sort((a, b) => b.compatibility - a.compatibility)
}
