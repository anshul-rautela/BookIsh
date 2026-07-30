import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../utils/dateUtils'

export default function DiscussionCard({ discussion, bookId }) {
  // bookId can come from the parent prop or from the discussion's own book reference
  const bid = bookId || discussion.book?.openLibraryId

  return (
    <Link
      to={`/books/${bid}/discussions/${discussion.id}`}
      className="block bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-5 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">

          {/* Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {discussion.isSpoiler && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                ⚠️ Spoiler
              </span>
            )}
            {discussion.scope === 'CHAPTER' && discussion.chapterNumber && (
              <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Ch. {discussion.chapterNumber}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-100 group-hover:text-violet-400 transition-colors line-clamp-2">
            {discussion.title}
          </h3>

          {/* Body preview */}
          {discussion.isSpoiler ? (
            <div className="mt-2 text-sm text-slate-500 italic">Spoiler — click to read</div>
          ) : (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{discussion.body}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
            {discussion.author?.userName?.[0]?.toUpperCase() || '?'}
          </div>
          {discussion.author?.userName ?? 'Unknown'}
        </span>
        <span>💬 {discussion.comments?.length ?? 0}</span>
        <span>{formatRelativeTime(discussion.createdAt)}</span>
      </div>
    </Link>
  )
}
