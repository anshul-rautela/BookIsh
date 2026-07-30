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
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-12">
      {/* Post */}
      <div className="flex gap-5 bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        {/* Vote */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={() => isAuthenticated && voteMutation.mutate(1)}
            className="text-[#78716C] hover:text-[#8C2520] text-xl transition-colors disabled:opacity-50"
            disabled={!isAuthenticated}
          >
            ▲
          </button>
          <span className={`text-sm font-serif font-bold ${post.voteCount > 0 ? 'text-[#8C2520]' : post.voteCount < 0 ? 'text-red-700' : 'text-[#78716C]'}`}>
            {post.voteCount}
          </span>
          <button
            onClick={() => isAuthenticated && voteMutation.mutate(-1)}
            className="text-[#78716C] hover:text-red-700 text-xl transition-colors disabled:opacity-50"
            disabled={!isAuthenticated}
          >
            ▼
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 text-xs font-serif text-[#78716C]">
            <span className="text-[#8C2520] font-bold">f/{post.forumName}</span>
            <span>·</span>
            <span>Posted by <span className="text-[#8C2520] font-bold">{post.user?.username}</span></span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-[#1C1917] mb-4 leading-snug">{post.title}</h1>
          <p className="text-[#44403C] font-serif leading-relaxed whitespace-pre-wrap text-base">{post.body}</p>
          <div className="mt-6 pt-4 border-t border-[#E4D7C3] text-xs font-serif text-[#78716C]">💬 {post.commentCount} comments</div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8">
        <h2 className="text-xl font-bold font-serif text-[#1C1917] mb-4">Leave a Comment</h2>
        {replyTo && (
          <div className="flex items-center gap-2 mb-3 text-xs font-serif font-bold text-[#8C2520]">
            ↩ Replying to comment
            <button onClick={() => setReplyTo(null)} className="text-[#78716C] hover:text-[#1C1917]">✕</button>
          </div>
        )}
        <CommentBox onSubmit={handleSubmit} parentId={replyTo} onCancel={replyTo ? () => setReplyTo(null) : undefined} />
      </div>

      {/* Comments */}
      <h2 className="text-xl font-bold font-serif text-[#1C1917] mb-4">{post.comments?.length || 0} Comments</h2>
      <CommentThread comments={post.comments} onReply={setReplyTo} />
    </div>
  )
}
