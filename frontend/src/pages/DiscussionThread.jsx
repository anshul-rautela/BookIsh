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
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-violet-400 mb-6 flex items-center gap-1.5 transition-colors group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back
      </button>

      {/* ── Discussion body ────────────────────────────────────────── */}
      <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6 mb-8">

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {discussion.scope === 'CHAPTER' && discussion.chapterNumber && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              📋 Chapter {discussion.chapterNumber}
            </span>
          )}
          {discussion.isSpoiler && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
              ⚠️ Spoiler
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-4 leading-tight">{discussion.title}</h1>

        {discussion.isSpoiler ? (
          <SpoilerText text={discussion.body} />
        ) : (
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{discussion.body}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-[#2a2a4a] text-xs text-slate-500">
          <div className="flex items-center gap-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                {discussion.author?.userName?.[0]?.toUpperCase()}
              </div>
              <Link
                to={`/users/${discussion.author?.id}`}
                className="text-violet-400 font-medium hover:text-violet-300 transition-colors"
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
              className="text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              🗑 {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {/* ── Comment form (authenticated only) ────────────────────────── */}
      {isAuthenticated ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            {replyTo ? '↩ Reply to comment' : 'Add a Comment'}
          </h2>
          {replyTo && (
            <div className="flex items-center gap-2 mb-3 text-xs text-violet-400">
              Replying to a comment
              <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-slate-300">✕ Cancel</button>
            </div>
          )}
          <CommentBox
            onSubmit={handleSubmit}
            parentId={replyTo}
            onCancel={replyTo ? () => setReplyTo(null) : undefined}
          />
        </div>
      ) : (
        <div className="mb-8 p-5 bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl text-center">
          <p className="text-slate-400 text-sm">
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link> to join the discussion.
          </p>
        </div>
      )}

      {/* ── Comments ─────────────────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-slate-100 mb-4">
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
