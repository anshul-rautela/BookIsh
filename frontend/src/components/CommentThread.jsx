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
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-[#D4C3A9]' : ''}`}>
      <div className="bg-[#F5EFE0] border border-[#E4D7C3] rounded-xl p-4 mb-3 hover:border-[#D4C3A9] transition-colors group shadow-sm">
        {/* Author row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#8C2520] text-[#FFFDF7] flex items-center justify-center text-[10px] font-bold font-serif flex-shrink-0">
              {comment.author?.userName?.[0]?.toUpperCase()}
            </div>
            <Link
              to={`/users/${comment.author?.id}`}
              className="text-xs font-bold font-serif text-[#8C2520] hover:text-[#6C1A16] transition-colors"
            >
              {comment.author?.userName}
            </Link>
            <span className="text-xs text-[#78716C]">{formatRelativeTime(comment.createdAt)}</span>
          </div>

          {/* Delete (author only) */}
          {isAuthor && (
            <button
              onClick={() => onDeleteComment && onDeleteComment(comment.id)}
              className="opacity-0 group-hover:opacity-100 text-xs text-[#78716C] hover:text-red-700 transition-all"
              title="Delete comment"
            >
              🗑
            </button>
          )}
        </div>

        {/* Body */}
        {(comment.isSpoiler || comment.spoiler) ? (
          <SpoilerText text={comment.body} label="Spoiler comment – click to reveal" />
        ) : (
          <SpoilerText text={comment.body} />
        )}

        {/* Reply button */}
        {depth < maxDepth && onReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="mt-2 text-xs text-[#78716C] hover:text-[#8C2520] font-medium transition-colors"
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
            className="text-xs text-[#78716C] hover:text-[#8C2520] ml-6 mb-2 transition-colors font-medium"
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
      <div className="text-center py-8 text-[#78716C]">
        <div className="text-3xl mb-2">💬</div>
        <p className="text-sm font-serif">No comments yet. {onReply ? 'Be the first!' : ''}</p>
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
