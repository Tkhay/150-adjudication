export function SearchBox({
  value,
  onChange,
  placeholder = 'Search nominees…',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-9 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute inset-y-0 right-2 flex items-center text-neutral-400 hover:text-red-700"
        >
          ×
        </button>
      )}
    </div>
  )
}
