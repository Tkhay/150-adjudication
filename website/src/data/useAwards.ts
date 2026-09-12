import { useEffect, useMemo, useState } from 'react'
import { slugify } from '../lib/slug'
import type { Category, Nomination } from './types'

export interface AwardsData {
  nominees: Nomination[]
  categories: Category[]
  categoryNameBySlug: Map<string, string>
  nomineesByCategorySlug: Map<string, Nomination[]>
  nomineeById: Map<string, Nomination>
}

function deriveAwardsData(raw: Nomination[]): AwardsData {
  const nomineeById = new Map<string, Nomination>()
  const byCategoryName = new Map<string, Nomination[]>()

  for (const nomination of raw) {
    const category = nomination.award_category?.trim() || 'Uncategorized'
    nomineeById.set(nomination.id, nomination)
    const list = byCategoryName.get(category) ?? []
    list.push(nomination)
    byCategoryName.set(category, list)
  }

  const categoryNameBySlug = new Map<string, string>()
  const nomineesByCategorySlug = new Map<string, Nomination[]>()
  const categories: Category[] = []
  const usedSlugs = new Set<string>()

  for (const [name, nominees] of byCategoryName) {
    let slug = slugify(name) || 'category'
    while (usedSlugs.has(slug)) slug = `${slug}-2`
    usedSlugs.add(slug)

    const sorted = [...nominees].sort((a, b) =>
      (a.nominee_name ?? '').localeCompare(b.nominee_name ?? '')
    )

    categoryNameBySlug.set(slug, name)
    nomineesByCategorySlug.set(slug, sorted)
    categories.push({ slug, name, count: sorted.length })
  }

  categories.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return {
    nominees: raw,
    categories,
    categoryNameBySlug,
    nomineesByCategorySlug,
    nomineeById,
  }
}

export function useAwards() {
  const [raw, setRaw] = useState<Nomination[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/awards.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load awards data (${res.status})`)
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setRaw(json)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const data = useMemo(() => (raw ? deriveAwardsData(raw) : null), [raw])

  return { data, error }
}
