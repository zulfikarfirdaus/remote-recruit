export type Availability = 'now' | 'two-weeks' | 'part-time'

export interface PortfolioItem {
  title: string
  outcome: string
  seed: string
}

export interface Candidate {
  id: string
  name: string
  country: string
  flag: string
  city: string
  timezone: string
  role: string
  years: number
  rate: number | null
  annualRate: number | null
  aiMatch: number
  availability: Availability
  languages: string[]
  photo: string
  voice: string
  top: boolean
  bio: string
  skills: { design: string[]; tools: string[] }
  transcript: string[]
  portfolio: PortfolioItem[]
  /** imported via GitHub OAuth; shown as verified activity, never as a handle or link */
  github: { repos: number; languages: string[] } | null
  /** seconds, from the generated media manifest */
  duration: number
  /** captions exist for this candidate */
  hasCaptions: boolean
}
