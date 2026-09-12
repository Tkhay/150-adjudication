export function CategoriesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded bg-neutral-200" />
        <div className="h-4 w-96 max-w-full rounded bg-neutral-200" />
        <div className="h-4 w-48 rounded bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="h-5 w-3/4 rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200" />
            <div className="mt-4 h-4 w-1/4 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
