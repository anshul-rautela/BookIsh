import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBook, addToShelf, getShelfEntry } from '../api/books'
import { getDiscussions, createDiscussion } from '../api/discussions'
import { useAuthStore } from '../store/authStore'
import DiscussionCard from '../components/DiscussionCard'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

const SHELF_OPTIONS = [
  { value: 'WANT_TO_READ', label: '📌 Want to Read', color: 'bg-slate-600' },
  { value: 'READING', label: '📖 Reading', color: 'bg-violet-600' },
  { value: 'FINISHED', label: '✅ Finished', color: 'bg-green-600' },
]

export default function BookDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState('book')
  const [chapterNum, setChapterNum] = useState(1)
  const [discussionModal, setDiscussionModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', scope: 'BOOK', chapterNumber: '', isSpoiler: false })

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBook(id),
  })

  const { data: shelf } = useQuery({
    queryKey: ['shelf', id],
    queryFn: () => getShelfEntry(id),
    enabled: isAuthenticated,
    retry: false,
  })

  const params = tab === 'chapter'
    ? { scope: 'CHAPTER', chapter: chapterNum }
    : { scope: 'BOOK' }

  const { data: discussions } = useQuery({
    queryKey: ['discussions', id, params],
    queryFn: () => getDiscussions(id, params),
    enabled: !!id,
  })

  const shelfMutation = useMutation({
    mutationFn: (data) => addToShelf(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shelf', id] }),
  })

  const discussionMutation = useMutation({
    mutationFn: (data) => createDiscussion(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discussions', id] })
      setDiscussionModal(false)
      setForm({ title: '', body: '', scope: 'BOOK', chapterNumber: '', isSpoiler: false })
    },
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
  if (!book) return <div className="pt-24 text-center text-slate-400">Book not found.</div>

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      {/* Book Header */}
      <div className="flex gap-8 mb-10 p-6 bg-[#1a1a2e] border border-[#2a2a4a] rounded-3xl">
        <div className="flex-shrink-0">
          <img
            src={book.coverUrl || 'https://via.placeholder.com/160x240/1a1a2e/7c3aed?text=No+Cover'}
            alt={book.title}
            className="w-40 h-60 object-cover rounded-2xl shadow-2xl"
            onError={e => e.target.src = 'https://via.placeholder.com/160x240/1a1a2e/7c3aed?text=No+Cover'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">{book.title}</h1>
          <p className="text-violet-400 text-lg mb-1">{book.author}</p>
          {book.publishedYear && <p className="text-slate-500 text-sm mb-4">{book.publishedYear}</p>}
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 mb-6">{book.description || 'No description available.'}</p>

          {/* Shelf Selector */}
          {isAuthenticated ? (
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">My Shelf</p>
              <div className="flex flex-wrap gap-2">
                {SHELF_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => shelfMutation.mutate({ status: opt.value })}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                      shelf?.status === opt.value
                        ? `${opt.color} text-white shadow-lg`
                        : 'bg-[#16213e] border border-[#2a2a4a] text-slate-300 hover:border-violet-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
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
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-all"
            >
              Sign in to add to shelf
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-[#1a1a2e] border border-[#2a2a4a] p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab('book')}
          className={`px-5 py-2 text-sm rounded-lg font-medium transition-all ${
            tab === 'book' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Book Discussion
        </button>
        <button
          onClick={() => setTab('chapter')}
          className={`px-5 py-2 text-sm rounded-lg font-medium transition-all ${
            tab === 'chapter' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Chapter Discussions
        </button>
      </div>

      {/* Chapter Selector */}
      {tab === 'chapter' && (
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-slate-400">Chapter:</label>
          <input
            type="number"
            min="1"
            value={chapterNum}
            onChange={e => setChapterNum(parseInt(e.target.value) || 1)}
            className="w-20 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:border-violet-500"
          />
        </div>
      )}

      {/* Discussions Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          {discussions?.content?.length || 0} Discussions
        </h2>
        {isAuthenticated && (
          <button
            onClick={() => setDiscussionModal(true)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-all"
          >
            + New Discussion
          </button>
        )}
      </div>

      {/* Discussion List */}
      <div className="space-y-3">
        {discussions?.content?.map(d => <DiscussionCard key={d.id} discussion={d} />)}
        {!discussions?.content?.length && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-5xl mb-3">💬</div>
            <p>No discussions yet. Start one!</p>
          </div>
        )}
      </div>

      {/* Create Discussion Modal */}
      <Modal isOpen={discussionModal} onClose={() => setDiscussionModal(false)} title="New Discussion">
        <div className="space-y-4">
          <input
            placeholder="Discussion title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, scope: 'BOOK' }))}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${form.scope === 'BOOK' ? 'bg-violet-600 text-white' : 'bg-[#16213e] border border-[#2a2a4a] text-slate-400'}`}
            >
              Book Wide
            </button>
            <button
              onClick={() => setForm(f => ({ ...f, scope: 'CHAPTER' }))}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${form.scope === 'CHAPTER' ? 'bg-violet-600 text-white' : 'bg-[#16213e] border border-[#2a2a4a] text-slate-400'}`}
            >
              Chapter Specific
            </button>
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
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
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
              body: form.body,
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
