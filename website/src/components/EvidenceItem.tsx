import { useState } from 'react'
import {
  cleanFilename,
  getDomain,
  getFileExtension,
  getPreviewUrl,
  isPreviewable,
} from '../lib/evidence'
import type { Evidence } from '../data/types'

export function EvidenceItem({
  evidence,
  onOpenImage,
}: {
  evidence: Evidence
  onOpenImage?: () => void
}) {
  const [showPreview, setShowPreview] = useState(false)
  const cleanTitle = cleanFilename(evidence.filename)
  const ext = getFileExtension(evidence.filename)
  const canPreview = isPreviewable(evidence.filename)
  const previewUrl = getPreviewUrl(evidence.url, evidence.filename)

  if (evidence.kind === 'image') {
    return (
      <div className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs transition hover:border-neutral-300">
        <button
          type="button"
          onClick={onOpenImage}
          className="relative block h-44 w-full cursor-zoom-in overflow-hidden bg-neutral-100"
          title="Click to expand"
        >
          <img
            src={evidence.url}
            alt={cleanTitle}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
            <span className="rounded-md bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
              Click to view
            </span>
          </div>
        </button>
        <div className="p-3">
          <p className="truncate text-xs font-medium text-neutral-800" title={cleanTitle}>
            {cleanTitle}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Image {ext ? `(${ext})` : ''}</span>
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Open original
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (evidence.kind === 'document') {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-800">
              {ext || 'DOC'}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-neutral-900" title={cleanTitle}>
                {cleanTitle}
              </h4>
              <p className="mt-0.5 truncate text-xs text-neutral-500" title={evidence.filename ?? ''}>
                {evidence.filename || 'Supporting Document'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            {canPreview && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {showPreview ? 'Hide Preview' : 'Preview Inline'}
              </button>
            )}
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800"
            >
              Open document
            </a>
          </div>
        </div>

        {canPreview && showPreview && (
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-200/60 px-3 py-1.5 text-xs text-neutral-600">
              <span>Document Preview</span>
              <a
                href={evidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-800 hover:underline"
              >
                Open in new tab
              </a>
            </div>
            <iframe
              src={previewUrl}
              title={cleanTitle}
              className="h-[75vh] w-full"
            />
          </div>
        )}
      </div>
    )
  }

  if (evidence.kind === 'video') {
    return (
      <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">{cleanTitle}</p>
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-neutral-700 hover:underline"
          >
            Open in new tab
          </a>
        </div>
        <video controls className="w-full rounded-lg border border-neutral-200 bg-black">
          <source src={evidence.url} />
          Your browser does not support HTML5 video.
        </video>
      </div>
    )
  }

  // External link
  const domain = getDomain(evidence.url)
  return (
    <a
      href={evidence.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-neutral-300 hover:bg-neutral-50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-900">
          {cleanTitle !== 'Supporting Document' ? cleanTitle : evidence.url}
        </p>
        <p className="text-xs text-neutral-500">{domain}</p>
      </div>
      <span className="shrink-0 text-xs font-medium text-neutral-600 group-hover:text-neutral-900">
        Open link
      </span>
    </a>
  )
}


