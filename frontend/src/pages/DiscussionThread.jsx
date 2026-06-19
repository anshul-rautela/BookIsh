import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDiscussion, useAddComment } from '../hooks/useDiscussion'
import { useAuthStore } from '../store/authStore'
import CommentThread from '../components/CommentThread'
import CommentBox from '../components/CommentBox'
import SpoilerText from '../components/SpoilerText'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/dateUtils'

export default function DiscussionThread() {
  const { id: bookId, discussionId } = useParams()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [replyTo, setReplyTo] = useState(null)

  const { data: discussion, isLoading } = useDiscussion(discussionId)
  const addComment = useAddComment(discussionId)

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
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-violet-400 mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      {/* Discussion */}
      <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {discussion.spoiler && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
              ⚠️ Spoiler
            </span>
          )}
          {discussion.scope === 'CHAPTER' && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              Ch. {discussion.chapterNumber}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-4">{discussion.title}</h1>

        {discussion.spoiler ? (
          <SpoilerText text={discussion.body} />
        ) : (
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{discussion.body}</p>
        )}

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#2a2a4a] text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
              {discussion.user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-violet-400 font-medium">{discussion.user?.username}</span>
          </div>
          <span>{formatDate(discussion.createdAt)}</span>
          <span>💬 {discussion.commentCount} comments</span>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Add a Comment</h2>
        {replyTo && (
          <div className="flex items-center gap-2 mb-3 text-xs text-violet-400">
            ↩ Replying to comment
            <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-slate-300">✕</button>
          </div>
        )}
        <CommentBox
          onSubmit={handleSubmit}
          parentId={replyTo}
          onCancel={replyTo ? () => setReplyTo(null) : undefined}
        />
      </div>

      {/* Comments */}
      <h2 className="text-lg font-semibold text-slate-100 mb-4">
        {discussion.comments?.length || 0} Comments
      </h2>
      <CommentThread comments={discussion.comments} onReply={handleReply} />
    </div>
  )
}
