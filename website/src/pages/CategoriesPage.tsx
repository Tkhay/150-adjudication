import type { AwardsData } from '../data/useAwards'
import { CategoryCard } from '../components/CategoryCard'

export function CategoriesPage({ data }: { data: AwardsData }) {
  const totalNominees = data.categories.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Welcome, Adjudicator</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Select an award category below to review its nominees and their supporting
          dossiers.
        </p>
        <p className="mt-2 text-sm font-medium text-neutral-500">
          {totalNominees} nominations across {data.categories.length} categories
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.categories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </div>
  )
}
