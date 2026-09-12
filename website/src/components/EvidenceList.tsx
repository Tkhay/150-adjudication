import { useState } from 'react'
import type { Evidence } from '../data/types'
import { EvidenceItem } from './EvidenceItem'
import { Lightbox } from './Lightbox'

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const images = evidence.filter((e) => e.kind === 'image')

  if (evidence.length === 0) {
    return <p className="text-sm text-neutral-500">No supporting evidence submitted for this nomination.</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {evidence.map((item, i) => (
          <EvidenceItem
            key={`${item.url}-${i}`}
            evidence={item}
            onOpenImage={
              item.kind === 'image'
                ? () => setLightboxIndex(images.findIndex((img) => img.url === item.url))
                : undefined
            }
          />
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}
