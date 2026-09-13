export function isPdf(filename: string | undefined | null): boolean {
  return (filename ?? '').toLowerCase().endsWith('.pdf')
}

export function isWordDoc(filename: string | undefined | null): boolean {
  const lower = (filename ?? '').toLowerCase()
  return lower.endsWith('.docx') || lower.endsWith('.doc')
}

export function isPreviewable(filename: string | undefined | null): boolean {
  return isPdf(filename) || isWordDoc(filename)
}

export function getPreviewUrl(url: string, filename: string | undefined | null): string {
  if (isWordDoc(filename)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
  }
  return url
}

export function getFileExtension(filename?: string | null): string {
  if (!filename) return ''
  const parts = filename.split('.')
  if (parts.length <= 1) return ''
  return parts.pop()?.toUpperCase() ?? ''
}

export function cleanFilename(filename?: string | null): string {
  if (!filename) return 'Supporting Document'

  // Extract extension
  const lastDot = filename.lastIndexOf('.')
  let base = lastDot > 0 ? filename.slice(0, lastDot) : filename

  // Remove WordPress Everest Forms 32-hex hash (with optional -1 suffix)
  base = base.replace(/[-_][0-9a-f]{24,}(?:-\d+)?$/i, '')

  // Replace hyphens and underscores with spaces
  base = base.replace(/[-_]+/g, ' ').trim()

  // If entirely uppercase, convert to Title Case for readability
  if (base.length > 3 && base === base.toUpperCase()) {
    base = base
      .toLowerCase()
      .split(' ')
      .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ')
  }

  return base || 'Supporting Document'
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'external link'
  }
}
