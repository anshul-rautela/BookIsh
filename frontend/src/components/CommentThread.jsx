import { useState } from 'react'
import SpoilerText from './SpoilerText'
import { formatRelativeTime } from '../utils/dateUtils'

function Comment({ comment, depth = 0, onReply }) {
  const [showReplies, setShowReplies] = useState(true)
  const maxDepth = 3

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l border-[#2a2a4a]' : ''}`}>
      <div className="bg-[#16213e] rounded-xl p-4 mb-3 hover:bg-[#1a1f35] transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {comment.user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-medium text-violet-400">{comment.user?.username}</span>
          <span className="text-xs text-slate-600">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {comment.spoiler ? (
          <SpoilerText text={comment.body} />
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">{comment.body}</p>
        )}

        {depth < maxDepth && (
          <button
            onClick={() => onReply && onReply(comment.id)}
            className="mt-2 text-xs text-slate-500 hover:text-violet-400 transition-colors"
          >
            ↩ Reply
          </button>
        )}
      </div>

      {comment.replies?.length > 0 && (
        <>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-slate-500 hover:text-violet-400 ml-6 mb-2 transition-colors"
          >
            {showReplies ? '▾ Hide' : '▸ Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {showReplies && comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
          ))}
        </>
      )}
    </div>
  )
}

export default function CommentThread({ comments, onReply }) {
  if (!comments?.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <div className="text-3xl mb-2">💬</div>
        <p className="text-sm">No comments yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} depth={0} onReply={onReply} />
      ))}
    </div>
  )
}
