import type { Availability, Candidate } from '../types'

export const formatRate = (rate: number | null) => (rate == null ? 'Rate on request' : `$${rate}/hr`)
export const formatAnnual = (v: number | null) => (v == null ? 'Not provided' : `$${v.toLocaleString('en-US')}/yr`)

export const formatTime = (s: number) => {
  if (!Number.isFinite(s)) s = 0
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export const availabilityMeta: Record<Availability, { label: string; dot: string; chip: string }> = {
  now: { label: 'Available now', dot: 'bg-success', chip: 'bg-success-50 text-[#067647]' },
  'two-weeks': { label: 'Available in 2 weeks', dot: 'bg-warn', chip: 'bg-warn-50 text-[#B54708]' },
  'part-time': { label: 'Part-time only', dot: 'bg-brand', chip: 'bg-brand-50 text-brand-600' },
}

// Skills that count as a match for the search. "Designer"/"design" alone would match
// almost everything, so only the specific terms in the query highlight.
const GENERIC = new Set(['designer', 'design', 'and', 'the', 'senior', 'junior', 'lead'])
const RELATED: Record<string, string[]> = {
  ux: ['ux design', 'user research', 'usability testing', 'interaction design', 'wireframing', 'information architecture', 'prototyping'],
  ui: ['ui design', 'visual design', 'design systems'],
  research: ['user research', 'usability testing', 'survey design'],
}

export const queryTokens = (q: string) =>
  q.toLowerCase().split(/[^a-z0-9/]+/).flatMap((t) => t.split('/')).filter((t) => t.length > 1)

export function skillMatcher(query: string) {
  const tokens = queryTokens(query).filter((t) => !GENERIC.has(t))
  const related = new Set(tokens.flatMap((t) => RELATED[t] ?? []))
  return (skill: string) => {
    const s = skill.toLowerCase()
    return related.has(s) || tokens.some((t) => s.split(/\s+/).includes(t))
  }
}

export function rankedSkills(c: Candidate, isMatch: (s: string) => boolean) {
  const all = [...c.skills.design, ...c.skills.tools]
  return [...all.filter(isMatch), ...all.filter((s) => !isMatch(s))]
}

export function matchesQuery(c: Candidate, query: string) {
  const tokens = queryTokens(query)
  if (!tokens.length) return true
  const hay = [c.role, ...c.skills.design, ...c.skills.tools, c.country, c.city].join(' ').toLowerCase()
  return tokens.some((t) => hay.includes(t))
}

// Deterministic pseudo-random numbers so the contribution strip is stable per candidate
export function seeded(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}
