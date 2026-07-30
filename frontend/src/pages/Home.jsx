import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchBooks } from '../api/books'
import { getForums } from '../api/forums'
import BookCard from '../components/BookCard'
import LoadingSpinner from '../components/LoadingSpinner'

function useDebounce(fn, delay) {
  let timer
  return useCallback((...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }, [])
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const navigate = useNavigate()

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['search', searchQ],
    queryFn: () => searchBooks(searchQ),
    enabled: searchQ.length > 1,
  })

  const { data: forums } = useQuery({
    queryKey: ['forums'],
    queryFn: getForums,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) setSearchQ(query.trim())
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#8C2520]/10 border border-[#8C2520]/20 px-4 py-1.5 rounded-full text-xs font-serif font-semibold text-[#8C2520] mb-6 shadow-sm">
            📜 Your Literary Sanctuary & Reading Guild
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6 leading-tight text-[#1C1917]">
            Discover, Track, &
            <br />
            <span className="italic text-[#8C2520]">Discuss Literature</span>
          </h1>
          <p className="text-[#57534E] text-lg mb-10 max-w-xl mx-auto font-serif leading-relaxed">
            Gather with fellow book lovers. Build your personal library, share chapter insights, and explore timeless discussions.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <input
                id="hero-search"
                value={query}
                onChange={e => { setQuery(e.target.value); if (e.target.value.length > 1) setSearchQ(e.target.value) }}
                placeholder="Search by book title, author, or keyword..."
                className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] focus:ring-1 focus:ring-[#8C2520] rounded-2xl px-5 py-4 text-[#1C1917] placeholder-[#78716C] text-base transition-all shadow-md font-serif"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-7 py-4 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] rounded-2xl font-serif font-bold text-base transition-all shadow-md hover:shadow-lg"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {searchResults?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-serif font-bold text-[#1C1917] mb-5 flex items-center gap-2">
            🔍 Results for "{searchQ}"
            <span className="text-sm text-[#78716C] font-normal">({searchResults.length} books)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Forums */}
      {forums?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-[#E4D7C3]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#1C1917]">🗣️ Community Forums</h2>
            <a href="/forums" className="text-sm font-serif font-bold text-[#8C2520] hover:text-[#6C1A16] transition-colors">View all →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forums.slice(0, 6).map(forum => (
              <a
                key={forum.id}
                href={`/forums/${forum.name}`}
                className="bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl p-5 hover:border-[#8C2520]/50 hover:shadow-lg hover:shadow-[#8C2520]/10 transition-all group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1C1917] group-hover:text-[#8C2520] transition-colors">
                      f/{forum.name}
                    </h3>
                    <p className="text-xs text-[#57534E] mt-1 line-clamp-2 leading-relaxed font-serif">{forum.description}</p>
                  </div>
                  <span className="text-2xl">📖</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E4D7C3] text-xs font-serif text-[#78716C]">{forum.postCount || 0} posts</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Active Live Rooms – Coming Soon teaser */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-[#E4D7C3]">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-2xl font-serif font-bold text-[#1C1917] flex items-center gap-2">
            🎙️ Live Reading Salons
          </h2>
          <span className="px-3 py-0.5 rounded-full bg-[#8C2520]/10 border border-[#8C2520]/20 text-[#8C2520] text-xs font-serif font-semibold uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
        <p className="text-[#57534E] text-sm font-serif">Real-time bookish discussion rooms are currently being forged. Stay tuned!</p>
      </section>
    </div>
  )
}
