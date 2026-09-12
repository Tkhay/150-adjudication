import { useEffect } from 'react'

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: { url: string; filename?: string }[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && index < images.length - 1) onNavigate(index + 1)
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index, images.length, onClose, onNavigate])

  const current = images[index]
  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <img
        src={current.url}
        alt={current.filename ?? 'Supporting evidence'}
        className="max-h-[85vh] max-w-full rounded shadow-lg"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-neutral-900"
      >
        Close
      </button>
      {images.length > 1 && (
        <>
          {index > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onNavigate(index - 1)
              }}
              aria-label="Previous image"
              className="absolute left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-900"
            >
              Previous
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onNavigate(index + 1)
              }}
              aria-label="Next image"
              className="absolute right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-900"
            >
              Next
            </button>
          )}
        </>
      )}
    </div>
  )
}
