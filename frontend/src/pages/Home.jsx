import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchBooks } from '../api/books'
import { getForums } from '../api/forums'
import { getActiveRooms } from '../api/live'
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

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: getActiveRooms,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) setSearchQ(query.trim())
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-[#0f0f1a] to-cyan-900/20" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 px-4 py-2 rounded-full text-sm text-violet-300 mb-6">
            ✨ Your social reading community
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Discover, Track,
            </span>
            <br />
            <span className="text-slate-100">and Discuss Books</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of readers. Build your reading list, participate in discussions, and chat live.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <input
                id="hero-search"
                value={query}
                onChange={e => { setQuery(e.target.value); if (e.target.value.length > 1) setSearchQ(e.target.value) }}
                placeholder="Search for any book..."
                className="w-full bg-[#1a1a2e] border border-[#2a2a4a] focus:border-violet-500 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-500 text-base transition-all shadow-lg"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-2xl font-semibold text-base transition-all shadow-lg hover:shadow-violet-700/30"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {searchResults?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2">
            🔍 Results for "{searchQ}"
            <span className="text-sm text-slate-500 font-normal">({searchResults.length} books)</span>
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
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-[#2a2a4a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100">🗣️ Community Forums</h2>
            <a href="/forums" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">View all →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forums.slice(0, 6).map(forum => (
              <a
                key={forum.id}
                href={`/forums/${forum.name}`}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-5 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100 group-hover:text-violet-400 transition-colors">
                      f/{forum.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{forum.description}</p>
                  </div>
                  <span className="text-2xl">📖</span>
                </div>
                <div className="mt-3 text-xs text-slate-600">{forum.postCount || 0} posts</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Active Live Rooms */}
      {rooms?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-[#2a2a4a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              🔴 Live Rooms
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </h2>
            <a href="/rooms" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">View all →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.slice(0, 3).map(room => (
              <a
                key={room.id}
                href={`/rooms/${room.id}`}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-900/20 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </div>
                <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {room.topic}
                </h3>
                {room.book && (
                  <p className="text-xs text-slate-500 mt-1 truncate">📚 {room.book.title}</p>
                )}
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                  <span>👥 {room.activeUserCount} online</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
