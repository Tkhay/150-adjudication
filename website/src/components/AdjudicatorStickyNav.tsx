import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function AdjudicatorStickyNav({
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
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement | null
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return
      }

      if (e.key === 'ArrowLeft' && prevId) {
        e.preventDefault()
        navigate(`/category/${categorySlug}/nominee/${prevId}`)
      } else if (e.key === 'ArrowRight' && nextId) {
        e.preventDefault()
        navigate(`/category/${categorySlug}/nominee/${nextId}`)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        navigate(`/category/${categorySlug}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [categorySlug, prevId, nextId, navigate])

  const progressPct = total > 0 ? Math.round((position / total) * 100) : 0

  return (
    <div className="sticky bottom-4 z-40 mx-auto mt-10 max-w-xl px-4 print:hidden">
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 p-3 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {/* Previous Button */}
          {prevId ? (
            <Link
              to={`/category/${categorySlug}/nominee/${prevId}`}
              className="rounded-lg bg-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
            >
              Previous
            </Link>
          ) : (
            <div className="rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-600 cursor-not-allowed">
              Previous
            </div>
          )}

          {/* Progress & Center Status */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold tracking-wide text-neutral-200">
              Nominee {position} of {total}
            </span>
            <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-neutral-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Next Button */}
          {nextId ? (
            <Link
              to={`/category/${categorySlug}/nominee/${nextId}`}
              className="rounded-lg bg-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
            >
              Next
            </Link>
          ) : (
            <div className="rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-600 cursor-not-allowed">
              Next
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
