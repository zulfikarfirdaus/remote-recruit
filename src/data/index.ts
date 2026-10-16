import raw from './candidates.json'
import media from './media.json'
import type { Candidate } from '../types'

const durations = media as Record<string, number>

export const candidates: Candidate[] = (raw as Omit<Candidate, 'duration' | 'hasCaptions'>[]).map((c) => ({
  ...c,
  duration: durations[c.id] ?? 0,
  hasCaptions: c.id in durations,
}))

export const byId = (id: string | null) => candidates.find((c) => c.id === id) ?? null

export const audioSrc = (id: string) => `/media/${id}.m4a`
export const vttSrc = (id: string) => `/media/${id}.vtt`

/** Unsplash (imgix) crop centred on the face, at 2× for sharp rendering */
export const photo = (c: { photo: string }, w: number, h = w) =>
  `${c.photo}?w=${w * 2}&h=${h * 2}&fit=crop&crop=faces&q=75&auto=format`
