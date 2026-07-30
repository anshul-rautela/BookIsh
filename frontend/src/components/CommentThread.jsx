import { useState } from 'react'
import { Link } from 'react-router-dom'
import SpoilerText from './SpoilerText'
import { formatRelativeTime } from '../utils/dateUtils'

function Comment({ comment, depth = 0, onReply, currentUserId, onDeleteComment }) {
  const [showReplies, setShowReplies] = useState(true)
  const maxDepth = 3
  const isAuthor = currentUserId && comment.author?.id &&
    String(currentUserId) === String(comment.author.id)

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l border-[#2a2a4a]' : ''}`}>
      <div className="bg-[#16213e] rounded-xl p-4 mb-3 hover:bg-[#1a1f35] transition-colors group">
        {/* Author row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {comment.author?.userName?.[0]?.toUpperCase()}
            </div>
            <Link
              to={`/users/${comment.author?.id}`}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              {comment.author?.userName}
            </Link>
            <span className="text-xs text-slate-600">{formatRelativeTime(comment.createdAt)}</span>
          </div>

          {/* Delete (author only) */}
          {isAuthor && (
            <button
              onClick={() => onDeleteComment && onDeleteComment(comment.id)}
              className="opacity-0 group-hover:opacity-100 text-xs text-slate-600 hover:text-red-400 transition-all"
              title="Delete comment"
            >
              🗑
            </button>
          )}
        </div>

        {/* Body */}
        {comment.isSpoiler ? (
          <SpoilerText text={comment.body} />
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">{comment.body}</p>
        )}

        {/* Reply button */}
        {depth < maxDepth && onReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="mt-2 text-xs text-slate-500 hover:text-violet-400 transition-colors"
          >
            ↩ Reply
          </button>
        )}
      </div>

      {/* Nested replies */}
      {comment.replies?.length > 0 && (
        <>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-slate-500 hover:text-violet-400 ml-6 mb-2 transition-colors"
          >
            {showReplies ? '▾ Hide' : '▸ Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {showReplies && comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              currentUserId={currentUserId}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default function CommentThread({ comments, onReply, currentUserId, onDeleteComment }) {
  if (!comments?.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <div className="text-3xl mb-2">💬</div>
        <p className="text-sm">No comments yet. {onReply ? 'Be the first!' : ''}</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {comments.map(comment => (
        <Comment
          key={comment.id}
          comment={comment}
          depth={0}
          onReply={onReply}
          currentUserId={currentUserId}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  )
}
