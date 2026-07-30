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
      setForm({ title: '', body: '', scope: 'BOOK', chapterNumber: '', isSpoiler: false })
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
      <div className="flex flex-col sm:flex-row gap-8 mb-10 p-6 bg-[#1a1a2e] border border-[#2a2a4a] rounded-3xl">

        {/* Cover */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <img
            src={book.coverUrl || `https://placehold.co/160x240/1a1a2e/7c3aed?text=${encodeURIComponent(book.title)}`}
            alt={book.title}
            className="w-40 h-60 object-cover rounded-2xl shadow-2xl"
            onError={e => { e.target.src = 'https://placehold.co/160x240/1a1a2e/7c3aed?text=No+Cover' }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-slate-100 mb-1">{book.title}</h1>

          {/* Author */}
          <p className="text-violet-400 text-lg mb-1 font-medium">{book.author}</p>

          {book.publishedYear && (
            <p className="text-slate-500 text-sm mb-4">First published: {book.publishedYear}</p>
          )}

          {/* Description with Read More */}
          {description && (
            <div className="mb-6">
              <p className="text-slate-300 text-sm leading-relaxed">
                {descExpanded ? description : shortDesc}
                {needsReadMore && !descExpanded && (
                  <span className="text-slate-500">…</span>
                )}
              </p>
              {needsReadMore && (
                <button
                  onClick={() => setDescExpanded(v => !v)}
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
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
                <span key={s} className="px-2.5 py-1 text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* ── My Shelf ─────────────────────────────────────────────────── */}
          {isAuthenticated ? (
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">My Shelf</p>
              <div className="flex flex-wrap gap-2">
                {SHELF_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => shelfMutation.mutate({ status: opt.value })}
                    disabled={shelfMutation.isPending}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                      shelf?.status === opt.value
                        ? `${opt.color} text-white shadow-lg scale-105`
                        : 'bg-[#16213e] border border-[#2a2a4a] text-slate-300 hover:border-violet-500 hover:text-violet-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                {shelf?.status && (
                  <button
                    onClick={() => shelfMutation.mutate({ status: '' })}
                    className="px-3 py-2 text-xs text-slate-600 hover:text-red-400 transition-colors"
                    title="Remove from shelf"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* Chapter progress when Reading */}
              {shelf?.status === 'READING' && (
                <div className="flex items-center gap-3 mt-4">
                  <label className="text-xs text-slate-500">Chapter progress:</label>
                  <input
                    type="number"
                    min="1"
                    defaultValue={shelf.currentChapter || 1}
                    className="w-20 bg-[#16213e] border border-[#2a2a4a] rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:border-violet-500"
                    onBlur={e => shelfMutation.mutate({ status: 'READING', currentChapter: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-all font-medium"
            >
              Sign in to add to shelf
            </button>
          )}
        </div>
      </div>

      {/* ── Discussions ───────────────────────────────────────────── */}
      <div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#1a1a2e] border border-[#2a2a4a] p-1 rounded-xl mb-6 w-fit">
          {[['book', '📖 Book Discussion'], ['chapter', '📋 Chapter Discussions']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm rounded-lg font-medium transition-all ${
                tab === t ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chapter selector for chapter tab */}
        {tab === 'chapter' && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl">
            <span className="text-sm text-slate-400 font-medium">📋 Chapter:</span>
            <input
              type="number"
              min="1"
              value={chapterNum}
              onChange={e => setChapterNum(parseInt(e.target.value) || 1)}
              className="w-20 bg-[#0f0f1a] border border-[#2a2a4a] rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:border-violet-500 outline-none"
            />
            <span className="text-xs text-slate-500">Select a chapter to see or start specific discussions</span>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
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
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-all font-medium"
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
            <div className="text-center py-16 text-slate-500">
              <div className="text-5xl mb-3">💬</div>
              <p>No {tab === 'chapter' ? `Chapter ${chapterNum}` : 'book-wide'} discussions yet.</p>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setForm(f => ({ ...f, scope: tab === 'chapter' ? 'CHAPTER' : 'BOOK', chapterNumber: tab === 'chapter' ? String(chapterNum) : '' }))
                    setDiscussionModal(true)
                  }}
                  className="mt-4 inline-flex px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all"
                >
                  Start the conversation →
                </button>
              ) : (
                <p className="mt-2 text-sm"><Link to="/login" className="text-violet-400 hover:text-violet-300">Sign in</Link> to contribute.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Discussion Modal ─────────────────────────────────────────── */}
      <Modal isOpen={discussionModal} onClose={() => setDiscussionModal(false)} title="New Discussion">
        <div className="space-y-4">
          <input
            placeholder="Discussion title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500"
          />
          <div className="flex gap-2">
            {['BOOK', 'CHAPTER'].map(s => (
              <button
                key={s}
                onClick={() => setForm(f => ({ ...f, scope: s }))}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  form.scope === s ? 'bg-violet-600 text-white' : 'bg-[#16213e] border border-[#2a2a4a] text-slate-400'
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
              className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500"
            />
          )}
          <textarea
            placeholder="Share your thoughts..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={5}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500 resize-none"
          />
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isSpoiler}
              onChange={e => setForm(f => ({ ...f, isSpoiler: e.target.checked }))}
              className="accent-violet-500"
            />
            ⚠️ Contains spoilers
          </label>
          <button
            onClick={() => discussionMutation.mutate({
              title: form.title,
              body:  form.body,
              scope: form.scope,
              chapterNumber: form.scope === 'CHAPTER' ? parseInt(form.chapterNumber) : null,
              isSpoiler: form.isSpoiler,
            })}
            disabled={!form.title || !form.body || discussionMutation.isPending}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
          >
            {discussionMutation.isPending ? 'Posting...' : 'Post Discussion'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
