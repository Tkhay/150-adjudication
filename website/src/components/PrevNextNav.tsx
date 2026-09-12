import { Link } from 'react-router-dom'

export function PrevNextNav({
  categorySlug,
  prevId,
  nextId,
  position,
  total,
}: {
  categorySlug: string
  prevId: string | null
  nextId: string | null
  position: number
  total: number
}) {
  return (
    <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
      {prevId ? (
        <Link
          to={`/category/${categorySlug}/nominee/${prevId}`}
          className="text-sm font-medium text-neutral-800 hover:underline"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-neutral-500">
        Nominee {position} of {total}
      </span>
      {nextId ? (
        <Link
          to={`/category/${categorySlug}/nominee/${nextId}`}
          className="text-sm font-medium text-neutral-800 hover:underline"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}
