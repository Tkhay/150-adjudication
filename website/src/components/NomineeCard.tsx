import { Link } from 'react-router-dom'
import type { Nomination } from '../data/types'

export function NomineeCard({
  nominee,
  categorySlug,
}: {
  nominee: Nomination
  categorySlug: string
}) {
  const evidenceCount = nominee.supporting_evidence?.length ?? 0

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:bg-red-50 hover:shadow-md">
      <div>
        <p className="font-medium text-neutral-900">
          {nominee.nominee_name || 'Unnamed nominee'}
        </p>
        {nominee.nominator_name && (
          <p className="text-sm text-neutral-500">Nominated by {nominee.nominator_name}</p>
        )}
        {evidenceCount > 0 && (
          <p className="mt-1 text-xs text-neutral-400">
            📎 {evidenceCount} supporting {evidenceCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
      <Link
        to={`/category/${categorySlug}/nominee/${nominee.id}`}
        className="shrink-0 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        View Dossier
      </Link>
    </div>
  )
}
