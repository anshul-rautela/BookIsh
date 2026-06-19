import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getUserShelf } from '../api/books'
import api from '../api/axios'
import BookCard from '../components/BookCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useState } from 'react'

const SHELF_TABS = ['WANT_TO_READ', 'READING', 'FINISHED']
const SHELF_LABELS = { WANT_TO_READ: '📌 Want to Read', READING: '📖 Reading', FINISHED: '✅ Finished' }

export default function Profile() {
  const { id } = useParams()
  const [tab, setTab] = useState('WANT_TO_READ')

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
  })

  const { data: shelf, isLoading: shelfLoading } = useQuery({
    queryKey: ['user-shelf', id],
    queryFn: () => getUserShelf(id),
  })

  if (userLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!user) return <div className="pt-24 text-center text-slate-400">User not found.</div>

  const currentShelf = shelf?.[tab] || []

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      {/* Profile Header */}
      <div className="flex items-start gap-6 bg-[#1a1a2e] border border-[#2a2a4a] rounded-3xl p-8 mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            user.username?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{user.username}</h1>
          <p className="text-violet-400 text-sm mt-1">{user.email}</p>
          {user.bio && (
            <p className="text-slate-400 text-sm mt-3 max-w-lg leading-relaxed">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Shelf Tabs */}
      <div className="flex gap-1 bg-[#1a1a2e] border border-[#2a2a4a] p-1 rounded-xl mb-6 w-fit">
        {SHELF_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              tab === t ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {SHELF_LABELS[t]}
            <span className="ml-2 text-xs opacity-70">{shelf?.[t]?.length || 0}</span>
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {shelfLoading ? (
        <LoadingSpinner className="py-16" />
      ) : currentShelf.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentShelf.map(entry => (
            <div key={entry.id}>
              <BookCard book={entry.book} />
              {entry.status === 'READING' && entry.currentChapter && (
                <p className="text-xs text-slate-500 mt-1 text-center">Chapter {entry.currentChapter}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <div className="text-5xl mb-3">📚</div>
          <p>No books in this shelf yet.</p>
        </div>
      )}
    </div>
  )
}
