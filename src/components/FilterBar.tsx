import { ChevronDown } from 'lucide-react'

const FILTERS = ['Skills', 'Rate', 'Availability', 'Location']

export function FilterBar({ count, query }: { count: number; query: string }) {
  const q = query.trim()
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-[15px] text-muted" aria-live="polite">
        <span className="font-semibold text-ink">{count} {count === 1 ? 'candidate' : 'candidates'}</span>
        {q ? <> for “{q}”</> : ' in all roles'}
      </h1>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-ink hover:border-[#C9D1DE]"
          >
            {f}
            <ChevronDown className="size-4 text-muted" />
          </button>
        ))}
      </div>
    </div>
  )
}
