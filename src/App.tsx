import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { candidates, byId } from './data'
import type { Candidate } from './types'
import { audible } from './lib/audible'
import { matchesQuery, skillMatcher } from './lib/format'
import { TopBar } from './components/TopBar'
import { FilterBar } from './components/FilterBar'
import { TopCandidates } from './components/TopCandidates'
import { CandidateCard } from './components/CandidateCard'
import { ProfileModal } from './components/ProfileModal'

const idFromUrl = () => new URLSearchParams(location.search).get('c')

function urlFor(id: string | null) {
  const u = new URL(location.href)
  if (id) u.searchParams.set('c', id)
  else u.searchParams.delete('c')
  return u.pathname + u.search + u.hash
}

function loadSaved() {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem('rr-saved') ?? '[]'))
  } catch {
    return new Set<string>()
  }
}

export default function App() {
  const [query, setQuery] = useState('UX Designer')
  const [openId, setOpenId] = useState<string | null>(() => (byId(idFromUrl()) ? idFromUrl() : null))
  const [dir, setDir] = useState<1 | -1>(1)
  const [saved, setSaved] = useState(loadSaved)
  const [toast, setToast] = useState<string | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const lastOpen = useRef<string | null>(openId)

  const isMatch = useMemo(() => skillMatcher(query), [query])
  const results = useMemo(() => candidates.filter((c) => matchesQuery(c, query)), [query])
  const top = useMemo(() => [...results].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 4), [results])
  const rest = useMemo(() => results.filter((c) => !top.includes(c)), [results, top])

  const current = byId(openId)
  const navList = current && results.includes(current) ? results : candidates
  const index = current ? navList.indexOf(current) : -1

  // Back/forward buttons drive the modal (finding 01: deep links)
  useEffect(() => {
    const onPop = () => {
      const id = idFromUrl()
      setOpenId(byId(id) ? id : null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Return focus to the card when the modal closes
  useEffect(() => {
    if (openId) {
      lastOpen.current = openId
      return
    }
    const id = lastOpen.current
    if (!id) return
    const el =
      opener.current?.dataset.card?.endsWith(`:${id}`) && opener.current.isConnected
        ? opener.current
        : document.querySelector<HTMLElement>(`[data-card="grid:${id}"]`)
    if (el) {
      el.focus({ preventScroll: true })
      el.closest('article')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [openId])

  useEffect(() => {
    try {
      localStorage.setItem('rr-saved', JSON.stringify([...saved]))
    } catch {
      /* storage unavailable */
    }
  }, [saved])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const open = (c: Candidate, el: HTMLElement) => {
    opener.current = el
    audible.set(null)
    setDir(1)
    history.pushState({ rrModal: true }, '', urlFor(c.id))
    setOpenId(c.id)
  }

  const close = useCallback(() => {
    if (history.state?.rrModal) history.back()
    else {
      history.replaceState(null, '', urlFor(null))
      setOpenId(null)
    }
  }, [])

  const step = (d: 1 | -1) => {
    if (index < 0) return
    const next = navList[(index + d + navList.length) % navList.length]
    setDir(d)
    history.replaceState(history.state, '', urlFor(next.id))
    setOpenId(next.id)
  }

  const toggleSave = (id: string) => {
    setSaved((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(location.href)
      setToast('Link copied. It opens this candidate directly.')
    } catch {
      setToast(location.href)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar query={query} onQuery={setQuery} />

      <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 sm:px-6">
        <FilterBar count={results.length} query={query} />

        <TopCandidates
          list={top}
          isMatch={isMatch}
          saved={saved}
          onToggleSave={toggleSave}
          onOpen={open}
        />

        {(rest.length > 0 || !results.length) && (
          <section aria-labelledby="all-heading" className="mt-8">
            <h2 id="all-heading" className="mb-3 text-lg font-semibold">
              All results
            </h2>
            {results.length ? (
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rest.map((c) => (
                  <CandidateCard
                    key={c.id}
                    c={c}
                    isMatch={isMatch}
                    saved={saved.has(c.id)}
                    onToggleSave={() => toggleSave(c.id)}
                    onOpen={(el) => open(c, el)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
                <SearchX className="size-8 text-muted" />
                <p className="mt-3 font-semibold">No candidates for “{query.trim()}”</p>
                <p className="mt-1 text-sm text-muted">Try a role like “UX Designer” or a skill like “Figma”.</p>
              </div>
            )}
          </section>
        )}
      </main>

      <AnimatePresence>
        {current && (
          <ProfileModal
            key="profile"
            c={current}
            index={index}
            total={navList.length}
            query={query}
            isMatch={isMatch}
            saved={saved.has(current.id)}
            onToggleSave={() => toggleSave(current.id)}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            onClose={close}
            onShare={share}
            onMessage={() => setToast(`Prototype: this opens a chat with ${current.name.split(' ')[0]}.`)}
            dir={dir}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
