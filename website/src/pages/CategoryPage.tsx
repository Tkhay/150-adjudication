import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { AwardsData } from '../data/useAwards'
import { NomineeCard } from '../components/NomineeCard'
import { SearchBox } from '../components/SearchBox'

export function CategoryPage({ data }: { data: AwardsData }) {
  const { categorySlug = '' } = useParams()
  const [query, setQuery] = useState('')

  const categoryName = data.categoryNameBySlug.get(categorySlug)
  const nominees = data.nomineesByCategorySlug.get(categorySlug) ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return nominees
    return nominees.filter((n) => (n.nominee_name ?? '').toLowerCase().includes(q))
  }, [nominees, query])

  if (!categoryName) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm font-medium text-red-700 hover:underline">
          Back to Categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">{categoryName}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {nominees.length} {nominees.length === 1 ? 'nominee' : 'nominees'}
        </p>
      </div>

      <div className="space-y-2">
        <SearchBox value={query} onChange={setQuery} />
        {query && (
          <p className="text-sm text-neutral-500">
            Showing {filtered.length} of {nominees.length}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((nominee) => (
          <NomineeCard key={nominee.id} nominee={nominee} categorySlug={categorySlug} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-neutral-500 sm:col-span-2">No nominees match your search.</p>
        )}
      </div>
    </div>
  )
}
