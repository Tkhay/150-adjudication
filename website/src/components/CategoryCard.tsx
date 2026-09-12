import { Link } from 'react-router-dom'
import type { Category } from '../data/types'

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="block rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:bg-red-50 hover:shadow-md"
    >
      <h2 className="text-lg font-semibold text-neutral-900">{category.name}</h2>
      <p className="mt-1 text-sm text-neutral-500">
        {category.count} {category.count === 1 ? 'nominee' : 'nominees'}
      </p>
      <p className="mt-3 text-sm font-medium text-red-700">View Nominees</p>
    </Link>
  )
}
