import { useState } from 'react'
import { Link } from 'react-router-dom'
import SpoilerText from './SpoilerText'
import { formatRelativeTime } from '../utils/dateUtils'

function Comment({ comment, depth = 0, onReply, currentUserId, onDeleteComment, onEditComment }) {
  const [showReplies, setShowReplies] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body || '')
  const [editSpoiler, setEditSpoiler] = useState(Boolean(comment.isSpoiler || comment.spoiler))
  const [saving, setSaving] = useState(false)

  const maxDepth = 3
  const isAuthor = currentUserId && comment.author?.id &&
    String(currentUserId) === String(comment.author.id)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editBody.trim() || saving) return
    setSaving(true)
    try {
      await onEditComment(comment.id, { body: editBody.trim(), isSpoiler: editSpoiler })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

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

          {/* Edit / Delete (author only) */}
          {isAuthor && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
              <button
                onClick={() => {
                  setEditBody(comment.body || '')
                  setEditSpoiler(Boolean(comment.isSpoiler || comment.spoiler))
                  setIsEditing(true)
                }}
                className="text-xs text-[#8C2520] hover:text-[#6C1A16] font-serif font-bold transition-all"
                title="Edit comment"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDeleteComment && onDeleteComment(comment.id)}
                className="text-xs text-[#78716C] hover:text-red-700 transition-all"
                title="Delete comment"
              >
                🗑
              </button>
            </div>
          )}
        </div>

        {/* Body or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-2 mt-2">
            <textarea
              value={editBody}
              onChange={e => setEditBody(e.target.value)}
              rows={3}
              className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-3 py-2 text-sm text-[#1C1917] focus:border-[#8C2520] font-serif resize-none shadow-inner"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-[#57534E] cursor-pointer font-serif select-none">
                <input
                  type="checkbox"
                  checked={editSpoiler}
                  onChange={e => setEditSpoiler(e.target.checked)}
                  className="accent-[#8C2520]"
                />
                ⚠️ Mark as spoiler
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-[#78716C] hover:text-[#1C1917] font-serif font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editBody.trim() || saving}
                  className="px-3 py-1 bg-[#8C2520] hover:bg-[#6C1A16] text-[#FFFDF7] text-xs font-serif font-bold rounded-lg disabled:opacity-50 transition-all shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          (comment.isSpoiler || comment.spoiler) ? (
            <SpoilerText text={comment.body} label="Spoiler comment – click to reveal" />
          ) : (
            <SpoilerText text={comment.body} />
          )
        )}

        {/* Reply button */}
        {!isEditing && depth < maxDepth && onReply && (
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
              onEditComment={onEditComment}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default function CommentThread({ comments, onReply, currentUserId, onDeleteComment, onEditComment }) {
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
          onEditComment={onEditComment}
        />
      ))}
    </div>
  )
}
