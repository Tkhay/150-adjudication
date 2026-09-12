import { Link, Navigate, useParams } from 'react-router-dom'
import type { AwardsData } from '../data/useAwards'
import { Breadcrumb } from '../components/Breadcrumb'
import { EvidenceList } from '../components/EvidenceList'
import { PrevNextNav } from '../components/PrevNextNav'

export function NomineePage({ data }: { data: AwardsData }) {
  const { categorySlug = '', nomineeId = '' } = useParams()

  const categoryName = data.categoryNameBySlug.get(categorySlug)
  const nominees = data.nomineesByCategorySlug.get(categorySlug) ?? []
  const nominee = data.nomineeById.get(nomineeId)

  if (!categoryName || !nominee || nominee.award_category !== categoryName) {
    return <Navigate to="/" replace />
  }

  const index = nominees.findIndex((n) => n.id === nominee.id)
  const prevId = index > 0 ? nominees[index - 1].id : null
  const nextId = index < nominees.length - 1 ? nominees[index + 1].id : null

  const paragraphs = (nominee.justification ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Breadcrumb categoryName={categoryName} categorySlug={categorySlug} />
        <Link
          to={`/category/${categorySlug}`}
          className="text-sm font-medium text-red-700 hover:underline"
        >
          ‹ Back to Nominees
        </Link>
      </div>

      <PrevNextNav
        categorySlug={categorySlug}
        prevId={prevId}
        nextId={nextId}
        position={index + 1}
        total={nominees.length}
      />

      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-red-700">
          {categoryName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">
          {nominee.nominee_name || 'Unnamed nominee'}
        </h1>
        {nominee.nominator_name && (
          <p className="mt-1 text-sm text-neutral-500">
            Nominated by {nominee.nominator_name}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="border-b border-neutral-200 pb-2 text-sm font-semibold uppercase tracking-wide text-neutral-700">
          Justification
        </h2>
        <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-neutral-800">
                {p}
              </p>
            ))
          ) : (
            <p className="text-sm text-neutral-500">No justification provided.</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="border-b border-neutral-200 pb-2 text-sm font-semibold uppercase tracking-wide text-neutral-700">
          Supporting Evidence
        </h2>
        <EvidenceList evidence={nominee.supporting_evidence ?? []} />
      </div>

      <PrevNextNav
        categorySlug={categorySlug}
        prevId={prevId}
        nextId={nextId}
        position={index + 1}
        total={nominees.length}
      />
    </div>
  )
}
