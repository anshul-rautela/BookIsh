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
      <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-4 text-center">
        <p className="text-slate-400 text-sm mb-3">Sign in to comment</p>
        <Link to="/login" className="px-4 py-2 bg-violet-600 text-white text-sm rounded-xl hover:bg-violet-500 transition-all">
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
        className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none transition-all"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isSpoiler}
            onChange={e => setIsSpoiler(e.target.checked)}
            className="accent-violet-500"
          />
          ⚠️ Mark as spoiler
        </label>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!body.trim() || loading}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-xl transition-all font-medium"
          >
            {loading ? '...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
