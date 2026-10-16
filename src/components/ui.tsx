import type { ReactNode } from 'react'
import type { Availability } from '../types'
import { availabilityMeta } from '../lib/format'

export function MatchMeter({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDF0F5]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label="AI match">
        <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-ink">{value}% match</span>
    </div>
  )
}

export function AvailabilityDot({ value }: { value: Availability }) {
  const m = availabilityMeta[value]
  return (
    <span className="relative inline-flex size-2.5 shrink-0" title={m.label}>
      <span className={`size-2.5 rounded-full ring-2 ring-white ${m.dot}`} />
      <span className="sr-only">{m.label}</span>
    </span>
  )
}

export function AvailabilityChip({ value }: { value: Availability }) {
  const m = availabilityMeta[value]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.chip}`}>
      <span className={`size-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

export function SkillChip({ children, match, size = 'sm' }: { children: ReactNode; match?: boolean; size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 'h-8 px-3 text-[13px]' : 'h-6 px-2 text-xs'
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md font-medium ${s} ${
        match ? 'bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100' : 'bg-[#F1F3F7] text-[#3B4456]'
      }`}
    >
      {children}
    </span>
  )
}

export function Equalizer({ className = '' }: { className?: string }) {
  return (
    <span className={`eq inline-flex h-3 items-end gap-[2px] ${className}`} aria-hidden>
      <span className="h-full" />
      <span className="h-full" />
      <span className="h-full" />
    </span>
  )
}
