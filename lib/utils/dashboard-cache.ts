/**
 * lib/utils/dashboard-cache.ts
 *
 * Lightweight in-memory SWR (stale-while-revalidate) cache for dashboard API calls.
 * - Returns cached data immediately (0ms) if fresh (< maxAge)
 * - Returns stale data immediately and revalidates in background if stale (< staleWhileRevalidate)
 * - No npm package needed — ~40 lines, zero dependencies
 *
 * Usage:
 *   const data = await cachedFetch('/api/earnings', { maxAge: 30_000, staleWhileRevalidate: 120_000 })
 */

interface CacheEntry {
  data: unknown
  timestamp: number
  revalidating: boolean
}

const cache = new Map<string, CacheEntry>()

interface CacheFetchOptions {
  maxAge?: number               // ms — serve fresh (default 30s)
  staleWhileRevalidate?: number // ms — serve stale + revalidate (default 120s)
  fetchInit?: RequestInit
}

export async function cachedFetch<T = unknown>(
  url: string,
  { maxAge = 30_000, staleWhileRevalidate = 120_000, fetchInit = {} }: CacheFetchOptions = {}
): Promise<T> {
  const now = Date.now()
  const entry = cache.get(url)

  const doFetch = async (): Promise<T> => {
    const res = await fetch(url, { credentials: "same-origin", ...fetchInit })
    if (!res.ok) throw new Error(`${url} → ${res.status}`)
    return res.json()
  }

  if (entry) {
    const age = now - entry.timestamp

    // Fresh — return immediately
    if (age < maxAge) return entry.data as T

    // Stale but within SWR window — return immediately + revalidate in background
    if (age < staleWhileRevalidate) {
      if (!entry.revalidating) {
        entry.revalidating = true
        doFetch()
          .then(data => cache.set(url, { data, timestamp: Date.now(), revalidating: false }))
          .catch(() => { entry.revalidating = false })
      }
      return entry.data as T
    }
  }

  // No cache or expired — fetch and wait
  const data = await doFetch()
  cache.set(url, { data, timestamp: now, revalidating: false })
  return data
}

/** Manually invalidate a cached URL (e.g. after a mutation) */
export function invalidateCache(url: string) {
  cache.delete(url)
}

/** Invalidate everything (e.g. on logout) */
export function clearAllCache() {
  cache.clear()
}
