import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForumPost, useVotePost, useAddForumComment } from '../hooks/useForum'
import { useAuthStore } from '../store/authStore'
import CommentThread from '../components/CommentThread'
import CommentBox from '../components/CommentBox'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/dateUtils'

export default function ForumPost() {
  const { name, id } = useParams()
  const { isAuthenticated } = useAuthStore()
  const [replyTo, setReplyTo] = useState(null)

  const { data: post, isLoading } = useForumPost(id)
  const voteMutation = useVotePost(id)
  const addComment = useAddForumComment(id)

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!post) return <div className="pt-24 text-center text-slate-400">Post not found.</div>

  const handleSubmit = async (data) => {
    await addComment.mutateAsync({ body: data.body, parentCommentId: replyTo })
    setReplyTo(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
      {/* Post */}
      <div className="flex gap-5 bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6 mb-8">
        {/* Vote */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={() => isAuthenticated && voteMutation.mutate(1)}
            className="text-slate-500 hover:text-violet-400 text-xl transition-colors disabled:opacity-50"
            disabled={!isAuthenticated}
          >
            ▲
          </button>
          <span className={`text-sm font-bold ${post.voteCount > 0 ? 'text-violet-400' : post.voteCount < 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {post.voteCount}
          </span>
          <button
            onClick={() => isAuthenticated && voteMutation.mutate(-1)}
            className="text-slate-500 hover:text-red-400 text-xl transition-colors disabled:opacity-50"
            disabled={!isAuthenticated}
          >
            ▼
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <span className="text-violet-400 font-medium">f/{post.forumName}</span>
            <span>·</span>
            <span>Posted by <span className="text-violet-400">{post.user?.username}</span></span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-4">{post.title}</h1>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
          <div className="mt-4 text-xs text-slate-500">💬 {post.commentCount} comments</div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Leave a Comment</h2>
        {replyTo && (
          <div className="flex items-center gap-2 mb-3 text-xs text-violet-400">
            ↩ Replying to comment
            <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-slate-300">✕</button>
          </div>
        )}
        <CommentBox onSubmit={handleSubmit} parentId={replyTo} onCancel={replyTo ? () => setReplyTo(null) : undefined} />
      </div>

      {/* Comments */}
      <h2 className="text-lg font-semibold text-slate-100 mb-4">{post.comments?.length || 0} Comments</h2>
      <CommentThread comments={post.comments} onReply={setReplyTo} />
    </div>
  )
}
