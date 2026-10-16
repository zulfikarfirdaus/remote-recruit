import { useSyncExternalStore } from 'react'

// Only one source may play with sound at a time (finding 02).
// Each player registers a key; unmuting one silences the rest.
let current: string | null = null
const subs = new Set<() => void>()

export const audible = {
  get: () => current,
  set(key: string | null) {
    if (current === key) return
    current = key
    subs.forEach((f) => f())
  },
  subscribe(f: () => void) {
    subs.add(f)
    return () => subs.delete(f)
  },
}

export const useAudible = () => useSyncExternalStore(audible.subscribe, audible.get, audible.get)
