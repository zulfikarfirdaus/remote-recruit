import { MeshGradient } from '@paper-design/shaders-react'
import { Sparkles } from 'lucide-react'
import type { Candidate } from '../types'
import { CandidateCard } from './CandidateCard'

interface Props {
  list: Candidate[]
  isMatch: (s: string) => boolean
  saved: Set<string>
  onToggleSave: (id: string) => void
  onOpen: (c: Candidate, el: HTMLElement) => void
}

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function TopCandidates({ list, isMatch, saved, onToggleSave, onOpen }: Props) {
  if (!list.length) return null
  return (
    <section aria-labelledby="top-heading" className="relative isolate mt-6 overflow-hidden rounded-3xl bg-navy">
      {/* Brand-coloured mesh gradient behind the strongest matches */}
      <MeshGradient
        className="absolute inset-0 -z-10 size-full"
        colors={['#00102E', '#0265C3', '#0A3A8C', '#4FA8F5']}
        distortion={0.8}
        swirl={0.35}
        grainMixer={0}
        grainOverlay={0.08}
        speed={reduceMotion ? 0 : 0.25}
      />
      <div className="px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="top-heading" className="flex items-center gap-2 text-lg font-semibold text-white">
              <Sparkles className="size-[18px] text-[#9FD0FF]" /> Top candidates
            </h2>
            <p className="text-[13px] text-white/75">The {list.length} highest AI matches for this search</p>
          </div>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {list.map((c) => (
            <CandidateCard
              key={c.id}
              c={c}
              variant="carousel"
              isMatch={isMatch}
              saved={saved.has(c.id)}
              onToggleSave={() => onToggleSave(c.id)}
              onOpen={(el) => onOpen(c, el)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
