import { isPdf } from '../lib/evidence'
import type { Evidence } from '../data/types'

export function EvidenceItem({
  evidence,
  onOpenImage,
}: {
  evidence: Evidence
  onOpenImage?: () => void
}) {
  const label = evidence.filename || evidence.url

  if (evidence.kind === 'image') {
    return (
      <button
        type="button"
        onClick={onOpenImage}
        className="block overflow-hidden rounded-lg border border-neutral-200"
      >
        <img
          src={evidence.url}
          alt={label}
          className="h-40 w-full object-cover transition hover:opacity-90"
        />
      </button>
    )
  }

  if (evidence.kind === 'document') {
    if (isPdf(evidence.filename)) {
      return (
        <div className="space-y-2">
          <iframe
            src={evidence.url}
            title={label}
            className="h-[80vh] w-full rounded-lg border border-neutral-200"
          />
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-red-700 hover:underline"
          >
            Open in new tab
          </a>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
        <span className="truncate text-sm text-neutral-700">{label}</span>
        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Open document
        </a>
      </div>
    )
  }

  if (evidence.kind === 'video') {
    return (
      <div className="space-y-2">
        <video controls className="w-full rounded-lg border border-neutral-200">
          <source src={evidence.url} />
        </video>
        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-red-700 hover:underline"
        >
          Open in new tab
        </a>
      </div>
    )
  }

  return (
    <a
      href={evidence.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-sm text-red-700 hover:underline"
    >
      <span className="shrink-0 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        External
      </span>
      <span className="truncate">{label}</span>
    </a>
  )
}
