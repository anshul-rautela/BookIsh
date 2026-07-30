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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#F5EFE0]/90 border-b border-[#E4D7C3] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mr-4 flex-shrink-0 group">
          <span className="text-2xl filter drop-shadow-sm">📖</span>
          <span className="text-2xl font-extrabold font-serif tracking-tight text-[#1C1917] group-hover:text-[#8C2520] transition-colors">
            Bookish
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by title, author, or genre..."
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-2 pl-10 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] focus:ring-1 focus:ring-[#8C2520] transition-all shadow-inner"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]">🔍</span>
          </div>
        </form>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 font-medium">
          {[
            { to: '/books',  label: 'Books' },
            { to: '/forums', label: 'Forums' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3.5 py-2 text-sm text-[#44403C] hover:text-[#8C2520] hover:bg-[#8C2520]/10 rounded-lg transition-all"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/rooms"
            className="px-3.5 py-2 text-sm text-[#78716C] hover:text-[#1C1917] rounded-lg transition-all flex items-center gap-1.5"
          >
            🎙️ Live
            <span className="text-[10px] text-[#8C2520] font-semibold bg-[#8C2520]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">soon</span>
          </Link>
        </div>

        {/* Auth */}
        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-3.5 py-2 hover:border-[#8C2520] transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#8C2520] text-[#FFFDF7] flex items-center justify-center text-xs font-bold font-serif">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-[#1C1917] hidden sm:block font-serif">{user?.username}</span>
                <span className="text-[#78716C] text-xs">▾</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl shadow-xl py-2 z-50">
                  <Link
                    to={`/users/${user?.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-[#1C1917] hover:bg-[#8C2520]/10 hover:text-[#8C2520] font-medium transition-all"
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); navigate('/') }}
                    className="w-full text-left px-4 py-2 text-sm text-[#78716C] hover:bg-red-500/10 hover:text-red-700 transition-all font-medium"
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
                className="px-4 py-2 text-sm font-semibold text-[#44403C] hover:text-[#8C2520] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] rounded-xl transition-all font-semibold shadow-sm"
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
