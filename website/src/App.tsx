import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useAwards } from './data/useAwards'
import { ScrollToTop } from './components/ScrollToTop'
import { CategoriesSkeleton } from './components/CategoriesSkeleton'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryPage } from './pages/CategoryPage'
import { NomineePage } from './pages/NomineePage'

function Header() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-white">
          Mfantsipim 150 Awards <span className="text-red-500">Dossier</span>
        </Link>
        <p className="text-xs text-neutral-400">Adjudicator Review Portal</p>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-4 text-xs text-neutral-400">
        Mfantsipim 150 Awards — Adjudicator Review Portal
      </div>
    </footer>
  )
}

function App() {
  const { data, error } = useAwards()

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              Failed to load awards data: {error}
            </p>
          )}
          {!error && !data && <CategoriesSkeleton />}
          {data && (
            <Routes>
              <Route path="/" element={<CategoriesPage data={data} />} />
              <Route path="/category/:categorySlug" element={<CategoryPage data={data} />} />
              <Route
                path="/category/:categorySlug/nominee/:nomineeId"
                element={<NomineePage data={data} />}
              />
              <Route path="*" element={<CategoriesPage data={data} />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
