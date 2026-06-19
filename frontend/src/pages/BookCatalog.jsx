import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchBooks } from '../api/books'
import BookCard from '../components/BookCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function BookCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('q') || '')
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const { data: books, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchBooks(query),
    enabled: query.length > 0,
  })

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim() && input !== query) {
        setQuery(input.trim())
        setSearchParams({ q: input.trim() })
      }
    }, 300)
    return () => clearTimeout(t)
  }, [input])

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">📚 Book Catalog</h1>
        <div className="relative max-w-xl">
          <input
            id="catalog-search"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search books by title, author, or ISBN..."
            className="w-full bg-[#1a1a2e] border border-[#2a2a4a] focus:border-violet-500 rounded-2xl px-5 py-3.5 pl-12 text-slate-200 placeholder-slate-500 transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </div>

      {isError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          Failed to fetch books. Please try again.
        </div>
      )}

      {!query && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">Search for books</h2>
          <p className="text-slate-500">Enter a title, author, or ISBN to find books</p>
        </div>
      )}

      {books?.length === 0 && query && !isLoading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No books found</h2>
          <p className="text-slate-500">Try a different search term</p>
        </div>
      )}

      {books?.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-5">{books.length} results for "{query}"</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
