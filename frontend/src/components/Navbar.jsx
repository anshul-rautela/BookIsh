import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { searchBooks } from '../api/books'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [q, setQ] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/books?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0f0f1a]/80 border-b border-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <span className="text-2xl">📚</span>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Bookish
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search books..."
              className="w-full bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl px-4 py-2 pl-10 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          </div>
        </form>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/books', label: 'Books' },
            { to: '/forums', label: 'Forums' },
            { to: '/rooms', label: 'Live' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm text-slate-300 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl px-3 py-2 hover:border-violet-500 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-slate-200 hidden sm:block">{user?.username}</span>
                <span className="text-slate-500 text-xs">▾</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl shadow-2xl py-2 z-50">
                  <Link
                    to={`/users/${user?.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-200 hover:bg-violet-500/20 hover:text-violet-400 transition-all"
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); navigate('/') }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-slate-300 hover:text-violet-400 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl transition-all font-medium"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
