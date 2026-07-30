import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDiscussion, useAddComment } from '../hooks/useDiscussion'
import { useAuthStore } from '../store/authStore'
import { deleteDiscussion, deleteComment } from '../api/discussions'
import { useQueryClient } from '@tanstack/react-query'
import CommentThread from '../components/CommentThread'
import CommentBox from '../components/CommentBox'
import SpoilerText from '../components/SpoilerText'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/dateUtils'

export default function DiscussionThread() {
  const { id: bookId, discussionId } = useParams()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [replyTo, setReplyTo] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data: discussion, isLoading } = useDiscussion(discussionId)
  const addComment = useAddComment(discussionId)

  const isAuthor = user?.id && discussion?.author?.id &&
    String(user.id) === String(discussion.author.id)

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Delete this discussion? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteDiscussion(discussionId)
      navigate(-1)
    } catch {
      setDeleting(false)
      alert('Failed to delete discussion.')
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

          {/* Delete (author only) */}
          {isAuthor && (
            <button
              onClick={handleDeleteDiscussion}
              disabled={deleting}
              className="text-xs text-[#78716C] hover:text-red-700 font-serif transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              🗑 {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

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
      />
    </div>
  )
}
