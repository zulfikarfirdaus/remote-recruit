import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Info, Maximize2, ShieldCheck, X } from 'lucide-react'
import type { Candidate, PortfolioItem } from '../types'
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
  const [open, setOpen] = useState<PortfolioItem | null>(null)
  if (!c.portfolio.length) return null
  return (
    <Section title="Portfolio" aside={<span className="text-[13px] text-muted">{c.portfolio.length} projects</span>}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.portfolio.map((p) => (
          <li key={p.title}>
            <button
              type="button"
              onClick={() => setOpen(p)}
              className="group block w-full overflow-hidden rounded-xl border border-line bg-surface text-left transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,.25)]"
            >
              <PortfolioThumb seed={p.seed} />
              <div className="flex items-start justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-semibold">{p.title}</h3>
                  <p className="mt-0.5 text-[13px] text-muted">{p.outcome}</p>
                </div>
                <Maximize2 className="mt-0.5 size-4 shrink-0 text-muted group-hover:text-brand" aria-hidden />
              </div>
            </button>
          </li>
        ))}
      </ul>
      {open && <ProjectViewer c={c} p={open} onClose={() => setOpen(null)} />}
    </Section>
  )
}

/** Case studies open inside RemoteRecruit, so the conversation stays on the platform */
function ProjectViewer({ c, p, onClose }: { c: Candidate; p: PortfolioItem; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    return () => prev?.focus()
  }, [])
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.stopPropagation()
      }}
    >
      <div className="absolute inset-0 bg-navy/70" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
        tabIndex={-1}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-surface shadow-2xl outline-none"
      >
        <PortfolioThumb seed={p.seed} />
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-medium text-muted">{c.name} · Case study</p>
            <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
            <p className="mt-1 text-[15px] text-[#3B4456]">{p.outcome}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project"
            className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-[#F1F3F7]"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
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

/**
 * Developer work without contact leakage: GitHub is connected once (OAuth) and RR shows
 * verified activity, never the handle or a link out.
 */
export function CodeActivity({ c }: { c: Candidate }) {
  const gh = c.github
  if (!gh) return null
  const rnd = seeded(c.id)
  const weeks = Array.from({ length: 52 }, () => {
    const r = rnd()
    return r < 0.18 ? 0 : r < 0.45 ? 1 : r < 0.75 ? 2 : r < 0.92 ? 3 : 4
  })
  const active = weeks.filter(Boolean).length
  const shades = ['bg-[#EDF0F5]', 'bg-[#BFDCF6]', 'bg-[#7DB7EC]', 'bg-[#3A8FDB]', 'bg-brand']
  return (
    <Section
      title="Code activity"
      aside={
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-[#067647]">
          <ShieldCheck className="size-3.5" /> Verified via GitHub
        </span>
      }
    >
      <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center sm:gap-8">
        <div>
          <p className="text-xs text-muted">Public repositories</p>
          <p className="mt-0.5 text-[22px] font-bold tracking-tight">{gh.repos}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Active weeks</p>
          <p className="mt-0.5 text-[22px] font-bold tracking-tight">
            {active}
            <span className="text-sm font-medium text-muted">/52</span>
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-muted">Top languages</p>
          <div className="flex flex-wrap gap-1.5">
            {gh.languages.map((l) => (
              <SkillChip key={l}>{l}</SkillChip>
            ))}
          </div>
        </div>
        <div className="sm:col-span-3">
          <p className="mb-1.5 text-xs text-muted">Contributions, last 12 months</p>
          <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-[3px] sm:grid-cols-[repeat(52,minmax(0,1fr))]" aria-hidden>
            {weeks.map((w, i) => (
              <span key={i} className={`aspect-square rounded-[2px] ${shades[w]} ${i < 26 ? 'max-sm:hidden' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
