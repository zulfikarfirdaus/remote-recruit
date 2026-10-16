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
  github: { user: string; repos: number; languages: string[] } | null
  links: { behance?: string; dribbble?: string; linkedin?: string }
  /** seconds, from the generated media manifest */
  duration: number
  /** captions exist for this candidate */
  hasCaptions: boolean
}
