import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { Candidate } from '../types'
import { CandidateCard } from './CandidateCard'

interface Props {
  list: Candidate[]
  isMatch: (s: string) => boolean
  saved: Set<string>
  onToggleSave: (id: string) => void
  onOpen: (c: Candidate, el: HTMLElement) => void
}

export function TopCandidates({ list, isMatch, saved, onToggleSave, onOpen }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * 560, behavior: 'smooth' })
  if (!list.length) return null
  return (
    <section aria-labelledby="top-heading" className="mt-6">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 id="top-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="size-[18px] text-brand" /> Top candidates
          </h2>
          <p className="text-[13px] text-muted">Highest AI match for this search</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              onClick={() => scroll(d)}
              aria-label={d < 0 ? 'Scroll top candidates left' : 'Scroll top candidates right'}
              className="grid size-9 place-items-center rounded-full border border-line bg-surface hover:border-[#C9D1DE]"
            >
              {d < 0 ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          ))}
        </div>
      </div>
      <div ref={track} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0">
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
    </section>
  )
}
