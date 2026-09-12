import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { AwardsData } from '../data/useAwards'
import { Breadcrumb } from '../components/Breadcrumb'
import { EvidenceList } from '../components/EvidenceList'
import { PrevNextNav } from '../components/PrevNextNav'
import { AdjudicatorStickyNav } from '../components/AdjudicatorStickyNav'

export function NomineePage({ data }: { data: AwardsData }) {
  const { categorySlug = '', nomineeId = '' } = useParams()
  const [copied, setCopied] = useState(false)

  const categoryName = data.categoryNameBySlug.get(categorySlug)
  const nominees = data.nomineesByCategorySlug.get(categorySlug) ?? []
  const nominee = data.nomineeById.get(nomineeId)

  if (!categoryName || !nominee || nominee.award_category !== categoryName) {
    return <Navigate to="/" replace />
  }

  const index = nominees.findIndex((n) => n.id === nominee.id)
  const prevId = index > 0 ? nominees[index - 1].id : null
  const nextId = index < nominees.length - 1 ? nominees[index + 1].id : null

  const rawJustification = nominee.justification?.trim() ?? ''
  const wordCount = rawJustification.split(/\s+/).filter(Boolean).length

  const paragraphs = rawJustification
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const evidenceCount = nominee.supporting_evidence?.length ?? 0

  function handleCopyJustification() {
    if (!rawJustification) return
    navigator.clipboard.writeText(rawJustification).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4 print:hidden">
        <Breadcrumb categoryName={categoryName} categorySlug={categorySlug} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            title="Print or save as PDF"
          >
            Print Dossier
          </button>

          <Link
            to={`/category/${categorySlug}`}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            All Nominees
          </Link>
        </div>
      </div>

      {/* Dossier Hero Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/category/${categorySlug}`}
                className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 hover:bg-neutral-200"
              >
                {categoryName}
              </Link>
              <span className="text-xs text-neutral-500">
                Candidate {index + 1} of {nominees.length}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {nominee.nominee_name || 'Unnamed nominee'}
            </h1>

            {nominee.nominator_name && (
              <p className="text-sm text-neutral-600">
                Nominated by <strong className="font-semibold text-neutral-800">{nominee.nominator_name}</strong>
              </p>
            )}
          </div>

          {/* Quick Dossier Stats */}
          <div className="flex flex-row gap-3 border-t border-neutral-100 pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-center sm:text-right">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Evidence
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                {evidenceCount} {evidenceCount === 1 ? 'Attachment' : 'Attachments'}
              </span>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-center sm:text-right">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Statement
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                {wordCount} Words
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Nomination Statement & Justification */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
              Nomination Statement & Justification
            </h2>
            <p className="text-xs text-neutral-500">
              Submitted justification for the adjudicator panel ({wordCount} words)
            </p>
          </div>

          {rawJustification && (
            <button
              type="button"
              onClick={handleCopyJustification}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 print:hidden"
            >
              {copied ? 'Copied' : 'Copy Statement'}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
          {paragraphs.length > 0 ? (
            <div className="space-y-4 text-base leading-relaxed text-neutral-800">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-neutral-500">No justification provided with this nomination.</p>
          )}
        </div>
      </div>

      {/* Supporting Evidence Section */}
      <div className="space-y-3">
        <div className="border-b border-neutral-200 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
            Supporting Evidence & Documentation ({evidenceCount})
          </h2>
          <p className="text-xs text-neutral-500">
            Official documents, media, and external references submitted for adjudication
          </p>
        </div>
        <EvidenceList evidence={nominee.supporting_evidence ?? []} />
      </div>

      {/* Static In-Page Prev/Next Nav */}
      <div className="print:hidden">
        <PrevNextNav
          categorySlug={categorySlug}
          prevId={prevId}
          nextId={nextId}
          position={index + 1}
          total={nominees.length}
        />
      </div>

      {/* Sticky Bottom Adjudication Navigation Bar with Keyboard Shortcuts */}
      <AdjudicatorStickyNav
        categorySlug={categorySlug}
        prevId={prevId}
        nextId={nextId}
        position={index + 1}
        total={nominees.length}
      />
    </div>
  )
}

