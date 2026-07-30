import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDiscussion, useAddComment, useUpdateDiscussion } from '../hooks/useDiscussion'
import { useAuthStore } from '../store/authStore'
import { deleteDiscussion, deleteComment, updateComment } from '../api/discussions'
import { useQueryClient } from '@tanstack/react-query'
import CommentThread from '../components/CommentThread'
import CommentBox from '../components/CommentBox'
import SpoilerText from '../components/SpoilerText'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/dateUtils'

export default function DiscussionThread() {
  const { id: bookId, discussionId } = useParams()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [replyTo, setReplyTo] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '', body: '', scope: 'BOOK', chapterNumber: '', isSpoiler: false
  })
  const [editError, setEditError] = useState('')

  const { data: discussion, isLoading } = useDiscussion(discussionId)
  const addComment = useAddComment(discussionId)
  const updateDiscMutation = useUpdateDiscussion(discussionId, bookId)

  const isAuthor = user?.id && discussion?.author?.id &&
    String(user.id) === String(discussion.author.id)

  const handleOpenEdit = () => {
    setEditForm({
      title: discussion.title || '',
      body: discussion.body || '',
      scope: discussion.scope || 'BOOK',
      chapterNumber: discussion.chapterNumber != null ? String(discussion.chapterNumber) : '',
      isSpoiler: Boolean(discussion.isSpoiler || discussion.spoiler)
    })
    setEditError('')
    setEditModal(true)
  }

  const handleSaveEdit = () => {
    setEditError('')
    updateDiscMutation.mutate({
      title: editForm.title,
      body: editForm.body,
      scope: editForm.scope,
      chapterNumber: editForm.scope === 'CHAPTER' ? parseInt(editForm.chapterNumber) : null,
      isSpoiler: editForm.isSpoiler,
    }, {
      onSuccess: () => setEditModal(false),
      onError: (err) => {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update discussion.'
        setEditError(String(msg))
      }
    })
  }

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Delete this discussion? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteDiscussion(discussionId)
      const redirectBookId = bookId || discussion?.book?.openLibraryId
      qc.invalidateQueries({ queryKey: ['discussions'] })
      qc.invalidateQueries({ queryKey: ['discussion', discussionId] })
      if (redirectBookId) {
        navigate(`/books/${redirectBookId}`, { replace: true })
      } else {
        navigate(-1)
      }
    } catch (err) {
      setDeleting(false)
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete discussion.'
      alert(msg)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(commentId)
      qc.invalidateQueries({ queryKey: ['discussion', discussionId] })
    } catch {
      alert('Failed to delete comment.')
    }
  }

  const handleEditComment = async (commentId, data) => {
    try {
      await updateComment(commentId, data)
      qc.invalidateQueries({ queryKey: ['discussion', discussionId] })
    } catch {
      alert('Failed to update comment.')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
  if (!discussion) return <div className="pt-24 text-center text-slate-400">Discussion not found.</div>

  const handleReply = (parentId) => setReplyTo(parentId)
  const handleSubmit = async (data) => {
    await addComment.mutateAsync({ ...data, parentCommentId: replyTo })
    setReplyTo(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-12">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-serif font-bold text-[#8C2520] hover:text-[#6C1A16] mb-6 flex items-center gap-1.5 transition-colors group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back
      </button>

      {/* ── Discussion body ────────────────────────────────────────── */}
      <div className="bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {discussion.scope === 'CHAPTER' && discussion.chapterNumber && (
            <span className="text-xs font-serif bg-[#8C2520]/10 text-[#8C2520] border border-[#8C2520]/20 px-2.5 py-0.5 rounded-full font-semibold">
              📋 Chapter {discussion.chapterNumber}
            </span>
          )}
          {(discussion.isSpoiler || discussion.spoiler) && (
            <span className="text-xs font-serif bg-[#8C2520]/10 text-[#8C2520] border border-[#8C2520]/20 px-2.5 py-0.5 rounded-full font-semibold">
              ⚠️ Spoiler
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold font-serif text-[#1C1917] mb-4 leading-snug">{discussion.title}</h1>

        {(discussion.isSpoiler || discussion.spoiler) ? (
          <SpoilerText text={discussion.body} />
        ) : (
          <p className="text-[#44403C] font-serif leading-relaxed whitespace-pre-wrap text-base">{discussion.body}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-[#E4D7C3] text-xs font-serif text-[#78716C]">
          <div className="flex items-center gap-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#8C2520] flex items-center justify-center text-xs font-serif font-bold text-[#FFFDF7] shadow-sm">
                {discussion.author?.userName?.[0]?.toUpperCase()}
              </div>
              <Link
                to={`/users/${discussion.author?.id}`}
                className="text-[#8C2520] font-serif font-bold hover:underline transition-colors"
              >
                {discussion.author?.userName}
              </Link>
            </div>
            <span>{formatDate(discussion.createdAt)}</span>
            <span>💬 {discussion.comments?.length ?? 0} comments</span>
          </div>

          {/* Edit / Delete (author only) */}
          {isAuthor && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenEdit}
                className="text-xs text-[#8C2520] hover:text-[#6C1A16] font-serif font-bold transition-colors flex items-center gap-1"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDeleteDiscussion}
                disabled={deleting}
                className="text-xs text-[#78716C] hover:text-red-700 font-serif font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                🗑 {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Discussion Modal ────────────────────────────────────── */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Discussion">
        <div className="space-y-4">
          <input
            placeholder="Discussion title"
            value={editForm.title}
            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] font-serif shadow-inner"
          />
          <div className="flex gap-2">
            {['BOOK', 'CHAPTER'].map(s => (
              <button
                key={s}
                onClick={() => setEditForm(f => ({ ...f, scope: s }))}
                className={`px-3 py-1.5 text-xs rounded-lg font-serif font-semibold transition-all ${
                  editForm.scope === s ? 'bg-[#8C2520] text-[#FFFDF7]' : 'bg-[#FFFDF7] border border-[#D4C3A9] text-[#57534E]'
                }`}
              >
                {s === 'BOOK' ? '📖 Book Wide' : '📑 Chapter Specific'}
              </button>
            ))}
          </div>
          {editForm.scope === 'CHAPTER' && (
            <input
              type="number"
              placeholder="Chapter number"
              value={editForm.chapterNumber}
              onChange={e => setEditForm(f => ({ ...f, chapterNumber: e.target.value }))}
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] font-serif shadow-inner"
            />
          )}
          <textarea
            placeholder="Share your thoughts..."
            value={editForm.body}
            onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
            rows={5}
            className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] resize-none font-serif shadow-inner"
          />
          <label className="flex items-center gap-2 text-xs text-[#57534E] cursor-pointer select-none font-serif">
            <input
              type="checkbox"
              checked={editForm.isSpoiler}
              onChange={e => setEditForm(f => ({ ...f, isSpoiler: e.target.checked }))}
              className="accent-[#8C2520]"
            />
            ⚠️ Contains spoilers
          </label>
          {editError && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 text-sm font-serif">
              ⚠️ {editError}
            </div>
          )}
          <button
            onClick={handleSaveEdit}
            disabled={!editForm.title || !editForm.body || updateDiscMutation.isPending}
            className="w-full py-3 bg-[#8C2520] hover:bg-[#6C1A16] disabled:opacity-50 text-[#FFFDF7] rounded-xl font-serif font-bold text-base transition-all shadow-sm"
          >
            {updateDiscMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* ── Comment form (authenticated only) ────────────────────────── */}
      {isAuthenticated ? (
        <div className="mb-8">
          <h2 className="text-xl font-bold font-serif text-[#1C1917] mb-4">
            {replyTo ? '↩ Reply to comment' : 'Add a Comment'}
          </h2>
          {replyTo && (
            <div className="flex items-center gap-2 mb-3 text-xs font-serif font-bold text-[#8C2520]">
              Replying to a comment
              <button onClick={() => setReplyTo(null)} className="text-[#78716C] hover:text-[#1C1917]">✕ Cancel</button>
            </div>
          )}
          <CommentBox
            onSubmit={handleSubmit}
            parentId={replyTo}
            onCancel={replyTo ? () => setReplyTo(null) : undefined}
          />
        </div>
      ) : (
        <div className="mb-8 p-5 bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl text-center shadow-sm">
          <p className="text-[#57534E] text-sm font-serif">
            <Link to="/login" className="text-[#8C2520] font-bold hover:underline">Sign in</Link> to join the discussion.
          </p>
        </div>
      )}

      {/* ── Comments ─────────────────────────────────────────────────── */}
      <h2 className="text-xl font-bold font-serif text-[#1C1917] mb-4">
        {discussion.comments?.length || 0} Comments
      </h2>
      <CommentThread
        comments={discussion.comments}
        onReply={isAuthenticated ? handleReply : undefined}
        currentUserId={user?.id}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleEditComment}
      />
    </div>
  )
}
