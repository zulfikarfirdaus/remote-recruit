import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, FolderGit2, Info } from 'lucide-react'
import type { Candidate } from '../types'
import { availabilityMeta, formatAnnual, formatRate, seeded } from '../lib/format'
import { SkillChip } from './ui'

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-t border-line pt-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** AI match explainer (finding 03): the score is explained, not blurred */
export function AiInfo() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('pointerdown', off)
    return () => document.removeEventListener('pointerdown', off)
  }, [open])
  return (
    <span
      ref={ref}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="ai-info"
        aria-label="How the AI match is calculated"
        className="grid size-5 place-items-center rounded-full text-muted hover:bg-[#EDF0F5] hover:text-brand"
      >
        <Info className="size-3.5" />
      </button>
      {open && (
        <span
          id="ai-info"
          role="dialog"
          aria-label="About AI match"
          className="absolute right-0 top-7 z-20 block w-64 rounded-xl border border-line bg-surface p-3.5 text-left text-[13px] font-normal normal-case tracking-normal text-ink shadow-[0_12px_32px_-12px_rgba(15,23,42,.35)] sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
        >
          <span className="block font-semibold">How AI match works</span>
          <span className="mt-1 block leading-snug text-muted">Based on skills match, experience and video assessment.</span>
          <span className="mt-3 block space-y-1.5">
            {[
              ['Skills match', 50],
              ['Experience', 30],
              ['Video assessment', 20],
            ].map(([l, w]) => (
              <span key={l} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-xs text-muted">{l}</span>
                <span className="h-1.5 flex-1 rounded-full bg-[#EDF0F5]">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${w}%` }} />
                </span>
                <span className="w-8 text-right text-xs tabular-nums text-muted">{w}%</span>
              </span>
            ))}
          </span>
          <span className="mt-2 block text-[11px] text-muted">Weighting of each signal in the score.</span>
        </span>
      )}
    </span>
  )
}

export function DetailsGrid({ c }: { c: Candidate }) {
  const rows: [string, ReactNode, boolean?][] = [
    ['Job title', c.role],
    ['Experience', `${c.years} years`],
    ['Location', `${c.city}, ${c.country}`],
    ['Time zone', c.timezone],
    ['Languages', c.languages.join(', ')],
    ['Availability', availabilityMeta[c.availability].label],
    ['Hourly rate', formatRate(c.rate), c.rate == null],
    ['Annual rate', formatAnnual(c.annualRate), c.annualRate == null],
  ]
  return (
    <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {rows.map(([k, v, empty]) => (
        <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-3 sm:block">
          <dt className="text-xs font-medium text-muted">{k}</dt>
          <dd className={`text-right text-[14px] sm:mt-1 sm:text-left ${empty ? 'italic text-muted' : 'font-medium'}`}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function SkillGroups({ c, isMatch }: { c: Candidate; isMatch: (s: string) => boolean }) {
  return (
    <div className="space-y-4">
      {(
        [
          ['Design', c.skills.design],
          ['Tools', c.skills.tools],
        ] as const
      ).map(([label, list]) =>
        list.length ? (
          <div key={label}>
            <h4 className="mb-2 text-xs font-medium text-muted">{label}</h4>
            <div className="flex flex-wrap gap-1.5">
              {list.map((s) => (
                <SkillChip key={s} match={isMatch(s)} size="md">{s}</SkillChip>
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  )
}

export function Portfolio({ c }: { c: Candidate }) {
  if (!c.portfolio.length) return null
  return (
    <Section title="Portfolio" aside={<span className="text-[13px] text-muted">{c.portfolio.length} projects</span>}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.portfolio.map((p) => (
          <li key={p.title}>
            <a
              href={`https://dribbble.com/search/${encodeURIComponent(p.title)}`}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,.25)]"
            >
              <PortfolioThumb seed={p.seed} />
              <div className="flex items-start justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-semibold">{p.title}</h3>
                  <p className="mt-0.5 text-[13px] text-muted">{p.outcome}</p>
                </div>
                <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted group-hover:text-brand" aria-label="Opens in a new tab" />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// Abstract UI mock as the project thumbnail (no stock photos of unrelated things)
const TINTS = [
  ['#EAF3FC', '#0265C3'],
  ['#E7F8F0', '#12B76A'],
  ['#FEF4E6', '#F79009'],
  ['#F1ECFE', '#7A5AF8'],
  ['#FDECF3', '#E04F8B'],
  ['#E6F6F8', '#0E9384'],
]
function PortfolioThumb({ seed }: { seed: string }) {
  const r = seeded(seed)
  const [bg, fg] = TINTS[Math.floor(r() * TINTS.length)]
  const layout = Math.floor(r() * 3)
  const bars = Array.from({ length: 6 }, () => 30 + r() * 70)
  return (
    <div className="relative aspect-[16/10] overflow-hidden" style={{ background: bg }} aria-hidden>
      <div className="absolute inset-x-6 top-6 bottom-0 rounded-t-lg bg-white shadow-[0_6px_24px_-8px_rgba(15,23,42,.25)] transition-transform duration-500 group-hover:-translate-y-1">
        <div className="flex h-5 items-center gap-1 border-b border-[#EEF1F5] px-2">
          {[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-[#DDE2EA]" />)}
        </div>
        <div className="flex gap-2 p-2.5">
          {layout !== 2 && <div className="w-1/5 space-y-1.5">{[0, 1, 2, 3].map((i) => <div key={i} className="h-1.5 rounded-full" style={{ background: i === 0 ? fg : '#E8ECF2' }} />)}</div>}
          <div className="flex-1 space-y-2">
            <div className="h-2 w-2/5 rounded-full bg-[#1F2937]/80" />
            {layout === 1 ? (
              <div className="flex h-12 items-end gap-1.5">
                {bars.map((h, i) => <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 3 ? fg : `${fg}33` }} />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-md" style={{ background: i === 0 ? `${fg}26` : '#F3F5F8' }} />)}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-12 rounded" style={{ background: fg }} />
              <div className="h-1.5 flex-1 rounded-full bg-[#EEF1F5]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const LINK_META = {
  behance: { label: 'Behance', mark: 'Bē', bg: 'bg-[#1769FF]', url: (h: string) => `https://www.behance.net/${h}` },
  dribbble: { label: 'Dribbble', mark: 'Dr', bg: 'bg-[#EA4C89]', url: (h: string) => `https://dribbble.com/${h}` },
  linkedin: { label: 'LinkedIn', mark: 'in', bg: 'bg-[#0A66C2]', url: (h: string) => `https://www.linkedin.com/in/${h}` },
} as const

export function Links({ c }: { c: Candidate }) {
  const links = (Object.keys(LINK_META) as (keyof typeof LINK_META)[]).filter((k) => c.links[k])
  if (!c.github && !links.length) return null
  return (
    <Section title={c.github ? 'GitHub & links' : 'Links'}>
      <div className={`grid gap-4 ${c.github && links.length ? 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]' : ''}`}>
        {c.github && <GitHubCard c={c} gh={c.github} />}
        {links.length > 0 && (
          <ul className="grid content-start gap-2">
            {links.map((k) => {
              const m = LINK_META[k]
              const handle = c.links[k]!
              return (
                <li key={k}>
                  <a
                    href={m.url(handle)}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-line px-3.5 py-3 hover:border-[#C9D1DE]"
                  >
                    <span className={`grid size-8 place-items-center rounded-lg text-[12px] font-bold text-white ${m.bg}`}>{m.mark}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{m.label}</span>
                      <span className="block truncate text-xs text-muted">/{handle}</span>
                    </span>
                    <ArrowUpRight className="size-4 text-muted group-hover:text-brand" />
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Section>
  )
}

function GitHubCard({ c, gh }: { c: Candidate; gh: NonNullable<Candidate['github']> }) {
  const rnd = seeded(c.id)
  const weeks = Array.from({ length: 52 }, () => {
    const r = rnd()
    return r < 0.18 ? 0 : r < 0.45 ? 1 : r < 0.75 ? 2 : r < 0.92 ? 3 : 4
  })
  const shades = ['bg-[#EDF0F5]', 'bg-[#BFDCF6]', 'bg-[#7DB7EC]', 'bg-[#3A8FDB]', 'bg-brand']
  return (
    <a
      href={`https://github.com/${gh.user}`}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl border border-line p-4 hover:border-[#C9D1DE]"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg bg-ink text-white">
          <FolderGit2 className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">github.com/{gh.user}</p>
          <p className="text-xs text-muted">{gh.repos} public repositories</p>
        </div>
        <ArrowUpRight className="size-4 text-muted group-hover:text-brand" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {gh.languages.map((l) => (
          <SkillChip key={l}>{l}</SkillChip>
        ))}
      </div>
      <div className="mt-4">
        <p className="mb-1.5 text-xs text-muted">Contributions, last 12 months</p>
        <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-[3px] sm:grid-cols-[repeat(52,minmax(0,1fr))]" aria-hidden>
          {weeks.map((w, i) => (
            <span key={i} className={`aspect-square rounded-[2px] ${shades[w]} ${i < 26 ? 'max-sm:hidden' : ''}`} />
          ))}
        </div>
      </div>
    </a>
  )
}
