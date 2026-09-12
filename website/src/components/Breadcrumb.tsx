import { Link } from 'react-router-dom'

export function Breadcrumb({
  categoryName,
  categorySlug,
}: {
  categoryName: string
  categorySlug: string
}) {
  return (
    <nav className="text-sm text-neutral-500">
      <Link to="/" className="hover:text-red-700 hover:underline">
        Award Categories
      </Link>
      <span className="mx-1.5">/</span>
      <Link to={`/category/${categorySlug}`} className="hover:text-red-700 hover:underline">
        {categoryName}
      </Link>
    </nav>
  )
}
