export function isPdf(filename: string | undefined | null): boolean {
  return (filename ?? '').toLowerCase().endsWith('.pdf')
}
