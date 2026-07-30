import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

export default function CommentBox({ onSubmit, placeholder = 'Write a comment...', parentId = null, onCancel }) {
  const { isAuthenticated } = useAuthStore()
  const [body, setBody] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5EFE0] border border-[#E4D7C3] rounded-xl p-4 text-center">
        <p className="text-[#57534E] text-sm mb-3 font-serif">Sign in to join the discussion</p>
        <Link to="/login" className="px-4 py-2 bg-[#8C2520] text-[#FFFDF7] text-sm rounded-xl hover:bg-[#6C1A16] transition-all font-semibold shadow-sm">
          Sign In
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim() || loading) return
    setLoading(true)
    try {
      await onSubmit({ body: body.trim(), parentCommentId: parentId, isSpoiler })
      setBody('')
      setIsSpoiler(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-[#FFFDF7] border border-[#D4C3A9] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#8C2520] focus:ring-1 focus:ring-[#8C2520] resize-none transition-all shadow-inner font-serif"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-[#57534E] cursor-pointer font-serif">
          <input
            type="checkbox"
            checked={isSpoiler}
            onChange={e => setIsSpoiler(e.target.checked)}
            className="accent-[#8C2520]"
          />
          ⚠️ Mark as spoiler
        </label>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-[#78716C] hover:text-[#1C1917] transition-all font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!body.trim() || loading}
            className="px-4 py-1.5 bg-[#8C2520] hover:bg-[#6C1A16] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFDF7] text-xs rounded-xl transition-all font-semibold shadow-sm"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
