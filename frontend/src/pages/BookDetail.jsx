import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBook, addToShelf, getShelfEntry } from '../api/books'
import { getDiscussions, createDiscussion } from '../api/discussions'
import { useAuthStore } from '../store/authStore'
import DiscussionCard from '../components/DiscussionCard'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

const SHELF_OPTIONS = [
  { value: 'WANT_TO_READ', label: '📌 Want to Read', color: 'bg-slate-600' },
  { value: 'READING',      label: '📖 Reading',       color: 'bg-violet-600' },
  { value: 'FINISHED',     label: '✅ Finished',       color: 'bg-green-600' },
]

const DESC_LIMIT = 400

export default function BookDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [tab, setTab]                   = useState('book')
  const [chapterNum, setChapterNum]     = useState(1)
  const [discussionModal, setDiscussionModal] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [form, setForm] = useState({
    title: '', body: '', scope: 'BOOK', chapterNumber: '', isSpoiler: false,
  })
  const [discussionError, setDiscussionError] = useState('')

  // ── Fetch book from OpenLibrary (via backend proxy) ──────────────────────────
  const { data: book, isLoading, isError } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBook(id),
  })

  // ── Fetch shelf entry (authenticated only) ────────────────────────────────
  const { data: shelf } = useQuery({
    queryKey: ['shelf', id],
    queryFn: () => getShelfEntry(id),
    enabled: isAuthenticated,
    retry: false,
  })

  // ── Discussions ───────────────────────────────────────────────────────────
  const discussionParams = tab === 'chapter'
    ? { scope: 'CHAPTER', chapter: chapterNum }
    : { scope: 'BOOK' }

  const { data: discussions } = useQuery({
    queryKey: ['discussions', id, discussionParams],
    queryFn:  () => getDiscussions(id, discussionParams),
    enabled:  !!id,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const shelfMutation = useMutation({
    mutationFn: (data) => addToShelf(id, { ...data, bookTitle: book?.title, coverUrl: book?.coverUrl }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['shelf', id] }),
  })

  const discussionMutation = useMutation({
    mutationFn: (data) => createDiscussion(id, { ...data, bookTitle: book?.title }),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['discussions', id] })
      setDiscussionModal(false)
      setDiscussionError('')
      setForm({ title: '', body: '', scope: 'BOOK', chapterNumber: '', isSpoiler: false })
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to post discussion. Check if you are logged in.'
      setDiscussionError(String(msg))
    },
  })

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
  if (isError || !book) return (
    <div className="pt-24 text-center text-slate-400">Book not found.</div>
  )

  const description   = book.description || ''
  const shortDesc     = description.slice(0, DESC_LIMIT)
  const needsReadMore = description.length > DESC_LIMIT

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">

      {/* ── Book Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10 p-6 bg-[#F5EFE0] border border-[#E4D7C3] rounded-3xl shadow-sm">

        {/* Cover */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <img
            src={book.coverUrl || `https://placehold.co/160x240/f3ebdd/8c2520?text=${encodeURIComponent(book.title)}`}
            alt={book.title}
            className="w-40 h-60 object-cover rounded-2xl shadow-md border border-[#E4D7C3]"
            onError={e => { e.target.src = 'https://placehold.co/160x240/f3ebdd/8c2520?text=No+Cover' }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold font-serif text-[#1C1917] mb-1">{book.title}</h1>

          {/* Author */}
          <p className="text-[#8C2520] text-lg mb-1 font-serif font-bold">{book.author}</p>

          {book.publishedYear && (
            <p className="text-[#78716C] text-sm mb-4 font-serif italic">First published: {book.publishedYear}</p>
          )}

          {/* Description with Read More */}
          {description && (
            <div className="mb-6">
              <p className="text-[#44403C] text-sm leading-relaxed font-serif">
                {descExpanded ? description : shortDesc}
                {needsReadMore && !descExpanded && (
                  <span className="text-[#78716C]">…</span>
                )}
              </p>
              {needsReadMore && (
                <button
                  onClick={() => setDescExpanded(v => !v)}
                  className="mt-2 text-xs font-serif font-bold text-[#8C2520] hover:text-[#6C1A16] transition-colors"
                >
                  {descExpanded ? '▲ Show less' : '▼ Read more'}
                </button>
              )}
            </div>
          )}

          {/* Subjects */}
          {book.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {book.subjects.slice(0, 6).map(s => (
                <span key={s} className="px-2.5 py-1 text-xs font-serif bg-[#8C2520]/10 border border-[#8C2520]/20 text-[#8C2520] rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* ── My Shelf ─────────────────────────────────────────────────── */}
          {isAuthenticated ? (
            <div>
              <p className="text-xs text-[#78716C] mb-2 uppercase tracking-wider font-serif font-bold">My Shelf</p>
              <div className="flex flex-wrap gap-2">
                {SHELF_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => shelfMutation.mutate({ status: opt.value })}
                    disabled={shelfMutation.isPending}
                    className={`px-4 py-2 text-sm rounded-xl font-serif font-semibold transition-all ${
                      shelf?.status === opt.value
                        ? 'bg-[#8C2520] text-[#FFFDF7] shadow-md scale-105'
                        : 'bg-[#FFFDF7] border border-[#D4C3A9] text-[#1C1917] hover:border-[#8C2520] hover:text-[#8C2520]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                {shelf?.status && (
                  <button
                    onClick={() => shelfMutation.mutate({ status: '' })}
                    className="px-3 py-2 text-xs text-[#78716C] hover:text-red-700 transition-colors font-serif"
                    title="Remove from shelf"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* Chapter progress when Reading */}
              {shelf?.status === 'READING' && (
                <div className="flex items-center gap-3 mt-4">
                  <label className="text-xs text-[#57534E] font-serif">Chapter progress:</label>
                  <input
                    type="number"
                    min="1"
                    defaultValue={shelf.currentChapter || 1}
                    className="w-20 bg-[#FFFDF7] border border-[#D4C3A9] rounded-lg px-3 py-1.5 text-sm text-[#1C1917] focus:border-[#8C2520] font-serif shadow-inner"
                    onBlur={e => shelfMutation.mutate({ status: 'READING', currentChapter: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] text-sm rounded-xl transition-all font-serif font-semibold shadow-sm"
            >
              Sign in to add to shelf
            </button>
          )}
        </div>
      </div>

      {/* ── Discussions ───────────────────────────────────────────── */}
      <div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#F5EFE0] border border-[#E4D7C3] p-1 rounded-xl mb-6 w-fit shadow-sm">
          {[['book', '📖 Book Discussion'], ['chapter', '📋 Chapter Discussions']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm rounded-lg font-serif font-semibold transition-all ${
                tab === t ? 'bg-[#8C2520] text-[#FFFDF7] shadow-sm' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chapter selector for chapter tab */}
        {tab === 'chapter' && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-[#F5EFE0] border border-[#E4D7C3] rounded-xl shadow-sm">
            <span className="text-sm text-[#1C1917] font-serif font-bold">📋 Chapter:</span>
            <input
              type="number"
              min="1"
              value={chapterNum}
              onChange={e => setChapterNum(parseInt(e.target.value) || 1)}
              className="w-20 bg-[#FFFDF7] border border-[#D4C3A9] rounded-lg px-3 py-1.5 text-sm text-[#1C1917] focus:border-[#8C2520] outline-none font-serif shadow-inner"
            />
            <span className="text-xs text-[#78716C] font-serif">Select a chapter to see or start specific discussions</span>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-serif text-[#1C1917]">
            {tab === 'chapter'
              ? `Chapter ${chapterNum} — ${discussions?.content?.length ?? 0} Discussion${discussions?.content?.length !== 1 ? 's' : ''}`
              : `${discussions?.content?.length ?? 0} Discussion${discussions?.content?.length !== 1 ? 's' : ''}`
            }
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => {
                setForm(f => ({ ...f, scope: tab === 'chapter' ? 'CHAPTER' : 'BOOK', chapterNumber: tab === 'chapter' ? String(chapterNum) : '' }))
                setDiscussionModal(true)
              }}
              className="px-4 py-2 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] text-sm rounded-xl transition-all font-serif font-bold shadow-sm"
            >
              + New Discussion
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {discussions?.content?.map(d => (
            <DiscussionCard key={d.id} discussion={d} bookId={id} />
          ))}
          {!discussions?.content?.length && (
            <div className="text-center py-16 text-[#78716C] font-serif">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-base">No {tab === 'chapter' ? `Chapter ${chapterNum}` : 'book-wide'} discussions yet.</p>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setForm(f => ({ ...f, scope: tab === 'chapter' ? 'CHAPTER' : 'BOOK', chapterNumber: tab === 'chapter' ? String(chapterNum) : '' }))
                    setDiscussionModal(true)
                  }}
                  className="mt-4 inline-flex px-5 py-2.5 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  Start the conversation →
                </button>
              ) : (
                <p className="mt-2 text-sm"><Link to="/login" className="text-[#8C2520] font-bold hover:underline">Sign in</Link> to contribute.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Discussion Modal ─────────────────────────────────────────── */}
      <Modal isOpen={discussionModal} onClose={() => { setDiscussionModal(false); setDiscussionError('') }} title="New Discussion">
        <div className="space-y-4">
          <input
            placeholder="Discussion title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] font-serif shadow-inner"
          />
          <div className="flex gap-2">
            {['BOOK', 'CHAPTER'].map(s => (
              <button
                key={s}
                onClick={() => setForm(f => ({ ...f, scope: s }))}
                className={`px-3 py-1.5 text-xs rounded-lg font-serif font-semibold transition-all ${
                  form.scope === s ? 'bg-[#8C2520] text-[#FFFDF7]' : 'bg-[#FFFDF7] border border-[#D4C3A9] text-[#57534E]'
                }`}
              >
                {s === 'BOOK' ? '📖 Book Wide' : '📑 Chapter Specific'}
              </button>
            ))}
          </div>
          {form.scope === 'CHAPTER' && (
            <input
              type="number"
              placeholder="Chapter number"
              value={form.chapterNumber}
              onChange={e => setForm(f => ({ ...f, chapterNumber: e.target.value }))}
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] font-serif shadow-inner"
            />
          )}
          <textarea
            placeholder="Share your thoughts..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={5}
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] resize-none font-serif shadow-inner"
          />
          <label className="flex items-center gap-2 text-xs text-[#57534E] cursor-pointer select-none font-serif">
            <input
              type="checkbox"
              checked={form.isSpoiler}
              onChange={e => setForm(f => ({ ...f, isSpoiler: e.target.checked }))}
              className="accent-[#8C2520]"
            />
            ⚠️ Contains spoilers
          </label>
          {discussionError && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 text-sm font-serif">
              ⚠️ {discussionError}
            </div>
          )}
          <button
            onClick={() => {
              setDiscussionError('')
              discussionMutation.mutate({
                title: form.title,
                body:  form.body,
                scope: form.scope,
                chapterNumber: form.scope === 'CHAPTER' ? parseInt(form.chapterNumber) : null,
                isSpoiler: form.isSpoiler,
              })
            }}
            disabled={!form.title || !form.body || discussionMutation.isPending}
            className="w-full py-3 bg-[#8C2520] hover:bg-[#6C1A16] disabled:opacity-50 text-[#FFFDF7] rounded-xl font-serif font-bold text-base transition-all shadow-sm"
          >
            {discussionMutation.isPending ? 'Posting...' : 'Post Discussion'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
