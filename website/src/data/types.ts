export type EvidenceKind = 'image' | 'document' | 'video' | 'external_link'

export interface Evidence {
  kind: EvidenceKind
  url: string
  filename?: string
}

export interface Nomination {
  id: string
  nominee_name: string
  award_category: string
  justification: string
  nominator_name: string
  supporting_evidence: Evidence[]
}

export interface Category {
  slug: string
  name: string
  count: number
}
