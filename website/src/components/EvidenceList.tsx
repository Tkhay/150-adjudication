import { useState } from 'react'
import type { Evidence } from '../data/types'
import { EvidenceItem } from './EvidenceItem'
import { Lightbox } from './Lightbox'

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (evidence.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
        No supporting evidence or attachments submitted for this nomination.
      </div>
    )
  }

  const documents = evidence.filter((e) => e.kind === 'document')
  const images = evidence.filter((e) => e.kind === 'image')
  const videos = evidence.filter((e) => e.kind === 'video')
  const links = evidence.filter((e) => e.kind === 'external_link')

  const showSubheaders = [documents.length > 0, images.length > 0 || videos.length > 0, links.length > 0].filter(Boolean).length > 1

  return (
    <div className="space-y-6">
      {/* Documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          {showSubheaders && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Documents & Statements ({documents.length})
            </h3>
          )}
          <div className="space-y-3">
            {documents.map((item, i) => (
              <EvidenceItem key={`doc-${item.url}-${i}`} evidence={item} />
            ))}
          </div>
        </div>
      )}

      {/* Media (Images & Videos) */}
      {(images.length > 0 || videos.length > 0) && (
        <div className="space-y-3">
          {showSubheaders && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Media & Photographs ({images.length + videos.length})
            </h3>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {images.map((item) => (
                <EvidenceItem
                  key={`img-${item.url}`}
                  evidence={item}
                  onOpenImage={() => setLightboxIndex(images.findIndex((img) => img.url === item.url))}
                />
              ))}
            </div>
          )}
          {videos.length > 0 && (
            <div className="space-y-3">
              {videos.map((item, i) => (
                <EvidenceItem key={`vid-${item.url}-${i}`} evidence={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* External Links */}
      {links.length > 0 && (
        <div className="space-y-3">
          {showSubheaders && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              External References ({links.length})
            </h3>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {links.map((item, i) => (
              <EvidenceItem key={`link-${item.url}-${i}`} evidence={item} />
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}

