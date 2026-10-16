import { Search } from 'lucide-react'

export function Logo() {
  return (
    <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RemoteRecruit home">
      <img src="/rr-mark.png" alt="" className="h-7 w-auto" />
      <img src="/rr-wordmark-white.png" alt="" className="hidden h-[18px] w-auto sm:block" />
    </a>
  )
}

export function TopBar({ query, onQuery }: { query: string; onQuery: (q: string) => void }) {
  return (
    <header className="sticky top-0 z-30 bg-navy">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo />
        <form className="relative min-w-0 flex-1 max-w-xl" role="search" onSubmit={(e) => e.preventDefault()}>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Search candidates"
            placeholder="Search by role or skill"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15 focus:outline-none"
          />
        </form>
        <nav className="ml-auto flex items-center gap-2">
          <button className="hidden h-9 rounded-lg px-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white sm:block">Sign in</button>
          <button className="h-9 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-600">Join</button>
        </nav>
      </div>
    </header>
  )
}
