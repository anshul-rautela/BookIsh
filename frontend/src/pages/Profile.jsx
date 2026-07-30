import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserShelf } from '../api/books'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

const SHELF_TABS = ['WANT_TO_READ', 'READING', 'FINISHED']
const SHELF_META = {
  WANT_TO_READ: { label: 'Want to Read', emoji: '📌', color: 'from-slate-500 to-slate-600' },
  READING:      { label: 'Reading',       emoji: '📖', color: 'from-violet-500 to-purple-600' },
  FINISHED:     { label: 'Finished',      emoji: '✅', color: 'from-emerald-500 to-green-600' },
}

/* ── Small book card used inside the shelf grid ─────────────────────── */
function ShelfBookCard({ entry, onRemove, isOwner }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className="relative group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to={`/books/${entry.openLibraryId}`}
        className="block bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl overflow-hidden hover:border-[#8C2520]/50 hover:shadow-xl hover:shadow-[#8C2520]/10 transition-all duration-300 hover:-translate-y-1 shadow-sm"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={entry.coverUrl || `https://placehold.co/150x220/f3ebdd/8c2520?text=${encodeURIComponent(entry.bookTitle || 'Book')}`}
            alt={entry.bookTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = 'https://placehold.co/150x220/f3ebdd/8c2520?text=No+Cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-3">
          <p className="text-sm font-serif font-bold text-[#1C1917] line-clamp-2 group-hover:text-[#8C2520] transition-colors">
            {entry.bookTitle || 'Unknown Title'}
          </p>
          {entry.status === 'READING' && entry.currentChapter && (
            <p className="text-xs text-[#78716C] font-serif mt-1">Ch. {entry.currentChapter}</p>
          )}
        </div>
      </Link>

      {/* Remove button — owner only */}
      {isOwner && hover && (
        <button
          onClick={() => onRemove(entry.openLibraryId)}
          title="Remove from shelf"
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs flex items-center justify-center shadow-lg transition-all"
        >
          ✕
        </button>
      )}
    </div>
  )
}

/* ── Edit profile modal ─────────────────────────────────────────────── */
function EditProfileModal({ profile, onClose, onSave, isPending, error }) {
  const [form, setForm] = useState({
    name:      profile?.name      || '',
    email:     profile?.email     || '',
    bio:       profile?.bio       || '',
    avatarUrl: profile?.avatarUrl || '',
    password:  '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1C1917]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#FBF7EE] border border-[#E4D7C3] rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-serif text-[#1C1917]">Edit Profile</h2>
          <button onClick={onClose} className="text-[#78716C] hover:text-[#1C1917] text-xl transition-colors">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-700 text-sm font-serif rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Avatar URL */}
          <div>
            <label className="block text-xs text-[#57534E] mb-1.5 uppercase tracking-wider font-serif font-bold">
              Avatar URL
            </label>
            {form.avatarUrl && (
              <img
                src={form.avatarUrl}
                alt="avatar preview"
                className="w-16 h-16 rounded-2xl object-cover mb-2 border border-[#E4D7C3]"
                onError={e => e.target.style.display = 'none'}
              />
            )}
            <input
              value={form.avatarUrl}
              onChange={set('avatarUrl')}
              placeholder="https://example.com/your-avatar.jpg"
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] font-serif transition-all outline-none shadow-inner"
            />
          </div>

          {/* Display name */}
          <div>
            <label className="block text-xs text-[#57534E] mb-1.5 uppercase tracking-wider font-serif font-bold">
              Display Name
            </label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Your display name"
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] font-serif transition-all outline-none shadow-inner"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-[#57534E] mb-1.5 uppercase tracking-wider font-serif font-bold">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="your@email.com"
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] font-serif transition-all outline-none shadow-inner"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs text-[#57534E] mb-1.5 uppercase tracking-wider font-serif font-bold">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] font-serif transition-all resize-none outline-none shadow-inner"
            />
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs text-[#57534E] mb-1.5 uppercase tracking-wider font-serif font-bold">
              New Password <span className="normal-case text-[#78716C] font-normal ml-1">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] focus:border-[#8C2520] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] font-serif transition-all outline-none shadow-inner"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#FFFDF7] border border-[#D4C3A9] hover:border-[#1C1917] text-[#1C1917] rounded-xl text-sm font-serif font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={isPending}
              className="flex-1 py-3 bg-[#8C2520] hover:bg-[#6C1A16] disabled:opacity-50 text-[#FFFDF7] rounded-xl text-sm font-serif font-bold transition-all shadow-sm"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Status badge for discussion cards ──────────────────────────────── */
function DiscussionMiniCard({ discussion }) {
  const bid = discussion.book?.openLibraryId
  return (
    <Link
      to={`/books/${bid}/discussions/${discussion.id}`}
      className="block bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl p-4 hover:border-[#8C2520]/50 hover:shadow-lg hover:shadow-[#8C2520]/10 transition-all duration-300 group shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Book mini cover */}
        <div className="w-10 h-14 rounded-lg bg-[#FFFDF7] flex-shrink-0 overflow-hidden border border-[#D4C3A9]">
          {discussion.book?.coverUrl ? (
            <img src={discussion.book.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {discussion.scope === 'CHAPTER' && discussion.chapterNumber && (
              <span className="text-[10px] font-serif bg-[#8C2520]/10 text-[#8C2520] border border-[#8C2520]/20 px-1.5 py-0.5 rounded-full font-semibold">
                Ch. {discussion.chapterNumber}
              </span>
            )}
            {(discussion.isSpoiler || discussion.spoiler) && (
              <span className="text-[10px] font-serif bg-[#8C2520]/10 text-[#8C2520] border border-[#8C2520]/20 px-1.5 py-0.5 rounded-full font-semibold">
                ⚠️ Spoiler
              </span>
            )}
          </div>
          <p className="text-sm font-serif font-bold text-[#1C1917] group-hover:text-[#8C2520] transition-colors line-clamp-2">
            {discussion.title}
          </p>
          <p className="text-xs text-[#78716C] font-serif mt-0.5">
            💬 {discussion.comments?.length ?? 0} comments
          </p>
        </div>
      </div>
    </Link>
  )
}

/* ── Main Profile page ──────────────────────────────────────────────── */
export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: me, setUser } = useAuthStore()
  const qc = useQueryClient()

  // Determine ownership: compare string IDs (store saves `id` from auth response)
  const isOwner = me?.id === id

  const [shelfTab,  setShelfTab]  = useState('READING')
  const [activeTab, setActiveTab] = useState('shelf')   // 'shelf' | 'discussions'
  const [editOpen,  setEditOpen]  = useState(false)
  const [editError, setEditError] = useState('')

  // ── Fetch profile ──────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', id],
    queryFn:  () => api.get(`/user/${id}`).then(r => r.data),
  })

  // ── Fetch shelf ────────────────────────────────────────────────────
  const { data: shelfList = [], isLoading: shelfLoading } = useQuery({
    queryKey: ['user-shelf', id],
    queryFn:  () => getUserShelf(id),
    enabled:  isOwner,
  })

  // ── Fetch user's discussions (public — anyone can see these) ───────
  const { data: myDiscussions = [], isLoading: discsLoading } = useQuery({
    queryKey: ['user-discussions', id],
    queryFn:  () => api.get(`/user/${id}/discussions`).then(r => r.data),
    enabled:  !!id,
  })

  // ── Edit profile mutation ──────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: (dto) => api.put(`/user/${id}`, dto).then(r => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['user', id] })
      setUser({ ...me, username: updated.userName, name: updated.name, email: updated.email })
      setEditOpen(false)
      setEditError('')
    },
    onError: () => setEditError('Failed to update profile. Please try again.'),
  })

  // ── Remove shelf entry ─────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (openLibraryId) =>
      api.post(`/books/${openLibraryId}/shelf`, { status: '' }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-shelf', id] }),
  })

  // ── Group shelf by status ──────────────────────────────────────────
  const grouped = SHELF_TABS.reduce((acc, t) => {
    acc[t] = shelfList.filter(e => e.status === t)
    return acc
  }, {})

  // ── Loading / not found ────────────────────────────────────────────
  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
  if (!profile) return (
    <div className="pt-28 text-center text-[#78716C] font-serif">User not found.</div>
  )

  const displayName = profile.name || profile.userName || 'Reader'
  const initials    = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">

      {/* ── Profile Header Card ──────────────────────────────────────── */}
      <div className="relative bg-[#F5EFE0] border border-[#E4D7C3] rounded-3xl p-8 mb-8 overflow-hidden shadow-sm">
        <div className="relative flex flex-col sm:flex-row items-start gap-6">

          {/* Avatar */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#8C2520]/20 shadow-md"
                onError={e => e.target.style.display = 'none'}
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#8C2520] flex items-center justify-center text-3xl font-bold font-serif text-[#FFFDF7] shadow-md">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold font-serif text-[#1C1917]">{displayName}</h1>
            <p className="text-[#8C2520] text-sm mt-1 font-serif font-bold">@{profile.userName}</p>
            <p className="text-[#78716C] text-sm mt-0.5 font-serif">{profile.email}</p>

            {profile.bio && (
              <p className="text-[#44403C] font-serif text-sm mt-3 max-w-prose leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-5 justify-center sm:justify-start">
              {SHELF_TABS.map(t => (
                <div key={t} className="text-center font-serif">
                  <div className="text-xl font-bold text-[#1C1917]">{grouped[t]?.length ?? 0}</div>
                  <div className="text-[11px] text-[#78716C] mt-0.5">{SHELF_META[t].label}</div>
                </div>
              ))}
              <div className="text-center font-serif">
                <div className="text-xl font-bold text-[#1C1917]">{myDiscussions.length}</div>
                <div className="text-[11px] text-[#78716C] mt-0.5">Discussions</div>
              </div>
            </div>
          </div>

          {/* Edit button (owner only) */}
          {isOwner && (
            <button
              onClick={() => { setEditOpen(true); setEditError('') }}
              className="px-4 py-2 bg-[#FFFDF7] border border-[#D4C3A9] hover:border-[#8C2520] text-[#1C1917] hover:text-[#8C2520] rounded-xl text-sm font-serif font-bold transition-all flex items-center gap-2 mx-auto sm:mx-0 flex-shrink-0 shadow-sm"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Switcher ─────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-[#F5EFE0] border border-[#E4D7C3] p-1 rounded-xl mb-6 w-fit shadow-sm">
        {[
          { key: 'shelf',       label: '📚 My Shelf',      show: isOwner },
          { key: 'discussions', label: '💬 Discussions',    show: true    },
        ].filter(t => t.show).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 text-sm rounded-lg font-serif font-bold transition-all ${
              activeTab === t.key ? 'bg-[#8C2520] text-[#FFFDF7] shadow-sm' : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Shelf Panel ──────────────────────────────────────────────── */}
      {activeTab === 'shelf' && isOwner && (
        <>
          {/* Shelf status tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            {SHELF_TABS.map(t => {
              const meta = SHELF_META[t]
              const active = shelfTab === t
              return (
                <button
                  key={t}
                  onClick={() => setShelfTab(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-serif font-bold transition-all border ${
                    active
                      ? 'bg-[#8C2520] text-[#FFFDF7] border-transparent shadow-sm'
                      : 'bg-[#F5EFE0] border-[#E4D7C3] text-[#57534E] hover:text-[#1C1917] hover:border-[#D4C3A9]'
                  }`}
                >
                  {meta.emoji} {meta.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-[#FFFDF7]/20 text-[#FFFDF7]' : 'bg-[#FFFDF7] text-[#1C1917]'}`}>
                    {grouped[t]?.length ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          {shelfLoading ? (
            <LoadingSpinner className="py-16" />
          ) : grouped[shelfTab]?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {grouped[shelfTab].map(entry => (
                <ShelfBookCard
                  key={entry.id}
                  entry={entry}
                  isOwner={isOwner}
                  onRemove={(olId) => removeMutation.mutate(olId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[#78716C] font-serif">
              <div className="text-5xl mb-3">{SHELF_META[shelfTab].emoji}</div>
              <p className="mb-4 text-base">No books in <span className="text-[#1C1917] font-bold">{SHELF_META[shelfTab].label}</span> yet.</p>
              <Link
                to="/books"
                className="inline-flex px-5 py-2.5 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                Browse books →
              </Link>
            </div>
          )}
        </>
      )}

      {/* ── Not owner: shelf is private message ─────────────────────── */}
      {activeTab === 'shelf' && !isOwner && (
        <div className="text-center py-20 text-[#78716C] font-serif">
          <div className="text-5xl mb-3">🔒</div>
          <p>This shelf is private.</p>
        </div>
      )}

      {/* ── Discussions Panel ─────────────────────────────────────────── */}
      {activeTab === 'discussions' && (
        <>
          {discsLoading ? (
            <LoadingSpinner className="py-16" />
          ) : myDiscussions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {myDiscussions.map(d => (
                <DiscussionMiniCard key={d.id} discussion={d} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[#78716C] font-serif">
              <div className="text-5xl mb-3">💬</div>
              <p>{isOwner ? "You haven't started any discussions yet." : "No discussions yet."}</p>
              {isOwner && (
                <Link to="/books" className="mt-4 inline-flex px-5 py-2.5 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] rounded-xl text-sm font-bold transition-all shadow-sm">
                  Find a book to discuss →
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Edit Profile Modal ────────────────────────────────────────── */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={(dto) => editMutation.mutate(dto)}
          isPending={editMutation.isPending}
          error={editError}
        />
      )}
    </div>
  )
}
