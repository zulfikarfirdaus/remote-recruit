import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, BriefcaseBusiness, ChevronLeft, ChevronRight, Clock, Globe, MapPin, MessageSquare, Share2, Sparkles, Wallet, X, type LucideIcon } from 'lucide-react'
import type { Candidate } from '../types'
import { photo } from '../data'
import { formatRate, rankedSkills } from '../lib/format'
import { AvailabilityChip, SkillChip } from './ui'
import { VideoResume } from './VideoResume'
import { AiInfo, CodeActivity, DetailsGrid, Portfolio, Section, SkillGroups } from './ProfileSections'

interface Props {
  c: Candidate
  index: number
  total: number
  query: string
  isMatch: (s: string) => boolean
  saved: boolean
  onToggleSave: () => void
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onShare: () => void
  onMessage: () => void
  dir: 1 | -1
}

function useIsMobile() {
  const q = '(max-width: 767px)'
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const f = () => setM(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  return m
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function ProfileModal(p: Props) {
  const { c } = p
  const mobile = useIsMobile()
  const panel = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [pastHeader, setPastHeader] = useState(false)

  useEffect(() => {
    panel.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // New candidate: back to the top of the decision header
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    setPastHeader(false)
  }, [c.id])

  // Sticky footer appears once the decision header has scrolled away
  useEffect(() => {
    const el = scroller.current?.querySelector(`[data-header="${c.id}"]`)
    if (!el || !scroller.current) return
    const io = new IntersectionObserver(([e]) => setPastHeader(!e.isIntersecting), { root: scroller.current, threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [c.id])

  const onKeyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    const typing = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'
    if (e.key === 'Escape') {
      e.preventDefault()
      p.onClose()
    } else if (e.key === 'ArrowLeft' && !typing && !e.metaKey && !e.altKey) {
      e.preventDefault()
      p.onPrev()
    } else if (e.key === 'ArrowRight' && !typing && !e.metaKey && !e.altKey) {
      e.preventDefault()
      p.onNext()
    } else if (e.key === 'Tab' && panel.current) {
      // Keep focus inside the dialog
      const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null)
      if (!els.length) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const topSkills = rankedSkills(c, p.isMatch).slice(0, 6)
  const context = p.query.trim() || 'All candidates'

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch justify-center md:items-center md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-[2px]" onClick={p.onClose} aria-hidden />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-name"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={mobile ? { y: '100%' } : { opacity: 0, y: 16, scale: 0.98 }}
        animate={mobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={mobile ? { y: '100%' } : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="relative flex h-full w-full flex-col overflow-hidden bg-surface outline-none md:h-auto md:max-h-[calc(100vh-48px)] md:max-w-[1200px] md:rounded-2xl md:shadow-2xl"
      >
        {/* 1. Modal bar */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3 sm:px-5">
          <div className="flex items-center gap-1">
            <IconBtn label="Previous candidate (←)" onClick={p.onPrev}>
              <ChevronLeft className="size-5" />
            </IconBtn>
            <IconBtn label="Next candidate (→)" onClick={p.onNext}>
              <ChevronRight className="size-5" />
            </IconBtn>
          </div>
          <p className="min-w-0 truncate text-[13px] text-muted" aria-live="polite">
            <span className="font-semibold text-ink tabular-nums">
              {p.index + 1} of {p.total}
            </span>{' '}
            · {context}
          </p>
          <div className="ml-auto flex items-center gap-1">
            <IconBtn label={p.saved ? 'Saved' : 'Save'} onClick={p.onToggleSave} pressed={p.saved}>
              {p.saved ? <BookmarkCheck className="size-[18px] text-brand" /> : <Bookmark className="size-[18px]" />}
            </IconBtn>
            <IconBtn label="Copy link to this candidate" onClick={p.onShare}>
              <Share2 className="size-[18px]" />
            </IconBtn>
            <span className="mx-1 h-6 w-px bg-line" />
            <IconBtn label="Close (Esc)" onClick={p.onClose}>
              <X className="size-5" />
            </IconBtn>
          </div>
        </div>

        <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="popLayout" initial={false} custom={p.dir}>
            <motion.div
              key={c.id}
              custom={p.dir}
              initial={{ opacity: 0, x: p.dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: p.dir * -24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="px-4 pb-28 pt-5 sm:px-8 sm:pt-7"
            >
              {/* 2. Decision header */}
              <div data-header={c.id} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-10">
                <div className="min-w-0">
                  <div className="flex items-start gap-4">
                    <img src={photo(c, 64)} alt="" className="size-16 shrink-0 rounded-full object-cover ring-1 ring-line" />
                    <div className="min-w-0">
                      <h2 id="profile-name" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <span className="truncate">{c.name}</span>
                        <span className="text-base" aria-label={c.country}>{c.flag}</span>
                      </h2>
                      <p className="text-[15px] text-[#3B4456]">{c.role}</p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {c.city}, {c.country}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {c.timezone}
                        </span>
                      </p>
                      <div className="mt-2.5">
                        <AvailabilityChip value={c.availability} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Top skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {topSkills.map((s) => (
                        <SkillChip key={s} match={p.isMatch(s)} size="md">{s}</SkillChip>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <Tile icon={Wallet} label="Hourly rate" empty={c.rate == null}>
                      {c.rate == null ? 'Rate on request' : <>${c.rate}<span className="text-sm font-medium text-muted">/hr</span></>}
                    </Tile>
                    <Tile icon={BriefcaseBusiness} label="Experience">
                      {c.years}<span className="text-sm font-medium text-muted"> yrs</span>
                    </Tile>
                    <Tile icon={Sparkles} label="AI match" info={<AiInfo />}>
                      <span className="text-brand">{c.aiMatch}%</span>
                    </Tile>
                    <Tile icon={Globe} label="Languages" small>
                      {c.languages.slice(0, 2).join(', ')}
                      {c.languages.length > 2 && <span className="text-muted"> +{c.languages.length - 2}</span>}
                    </Tile>
                  </dl>
                  <div className="mt-3 flex gap-2.5">
                    <button
                      type="button"
                      onClick={p.onToggleSave}
                      aria-pressed={p.saved}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold hover:border-[#C9D1DE] sm:flex-none"
                    >
                      {p.saved ? <BookmarkCheck className="size-4 text-brand" /> : <Bookmark className="size-4" />}
                      {p.saved ? 'Saved' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={p.onMessage}
                      className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-600 sm:flex-1"
                    >
                      <MessageSquare className="size-4" />
                      Message {c.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Video + details */}
              <div className="mt-8 grid gap-8 border-t border-line pt-7 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-10">
                <div>
                  <h2 className="mb-4 text-base font-semibold">Video resume</h2>
                  <VideoResume c={c} />
                </div>
                <div className="min-w-0 space-y-7">
                  <div>
                    <h2 className="mb-2 text-base font-semibold">About</h2>
                    <p className="text-[15px] leading-relaxed text-[#3B4456]">{c.bio}</p>
                  </div>
                  <div>
                    <h2 className="mb-1 text-base font-semibold">Details</h2>
                    <DetailsGrid c={c} />
                  </div>
                  <div>
                    <h2 className="mb-3 text-base font-semibold">All skills</h2>
                    <SkillGroups c={c} isMatch={p.isMatch} />
                  </div>
                </div>
              </div>

              {/* 4. Below, no tabs */}
              <div className="mt-10 space-y-10">
                <Portfolio c={c} />
                <CodeActivity c={c} />
              </div>
              {!c.portfolio.length && !c.github && (
                <Section title="Portfolio">
                  <p className="text-sm text-muted">Not provided</p>
                </Section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 5. Sticky footer: CTA is never lost */}
        <AnimatePresence>
          {pastHeader && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 40 }}
              className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:px-8"
            >
              <div className="flex items-center gap-3">
                <img src={photo(c, 36)} alt="" className="size-9 rounded-full object-cover" />
                <p className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-muted"> · </span>
                  <span className={c.rate == null ? 'text-muted' : 'font-semibold'}>{formatRate(c.rate)}</span>
                  <span className="hidden text-muted sm:inline"> · {c.aiMatch}% match</span>
                </p>
                <button
                  type="button"
                  onClick={p.onMessage}
                  className="flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  <MessageSquare className="size-4" />
                  Message
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function Tile({ icon: Icon, label, children, info, empty, small }: { icon: LucideIcon; label: string; children: ReactNode; info?: ReactNode; empty?: boolean; small?: boolean }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-bg/60 p-3.5">
      <span className="mb-3 grid size-9 place-items-center rounded-lg bg-surface text-brand ring-1 ring-line" aria-hidden>
        <Icon className="size-[18px]" />
      </span>
      <dt className="flex items-center gap-1 text-xs font-medium text-muted">
        {label}
        {info}
      </dt>
      <dd
        className={`mt-1 leading-tight ${
          empty ? 'text-[14px] font-semibold text-muted' : small ? 'text-[14px] font-semibold' : 'text-[22px] font-bold tracking-tight'
        }`}
      >
        {children}
      </dd>
    </div>
  )
}

function IconBtn({ label, onClick, children, pressed }: { label: string; onClick: () => void; children: ReactNode; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="grid size-9 place-items-center rounded-lg text-ink hover:bg-[#F1F3F7]"
    >
      {children}
    </button>
  )
}
