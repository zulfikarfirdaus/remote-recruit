import { useEffect, useState } from 'react'
import { vttSrc } from '../data'

export interface Cue {
  start: number
  end: number
  text: string
}

const toSec = (t: string) => {
  const p = t.trim().split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]
}

export function parseVtt(src: string): Cue[] {
  return src
    .replace(/\r/g, '')
    .split(/\n\n+/)
    .map((block) => {
      const lines = block.split('\n')
      const i = lines.findIndex((l) => l.includes('-->'))
      if (i < 0) return null
      const [a, b] = lines[i].split('-->')
      return { start: toSec(a), end: toSec(b.split(' ')[1] ?? b), text: lines.slice(i + 1).join(' ') }
    })
    .filter((c): c is Cue => !!c)
}

const cache = new Map<string, Promise<Cue[]>>()
export function loadCues(id: string) {
  if (!cache.has(id)) cache.set(id, fetch(vttSrc(id)).then((r) => (r.ok ? r.text() : '')).then(parseVtt).catch(() => []))
  return cache.get(id)!
}

export function useCues(id: string) {
  const [cues, setCues] = useState<{ id: string; cues: Cue[] } | null>(null)
  useEffect(() => {
    let live = true
    loadCues(id).then((c) => live && setCues({ id, cues: c }))
    return () => {
      live = false
    }
  }, [id])
  return cues?.id === id ? cues.cues : []
}

export const cueAt = (cues: Cue[], t: number) => cues.findIndex((c) => t >= c.start && t < c.end + 0.4)
