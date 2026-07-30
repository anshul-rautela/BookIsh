import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../utils/dateUtils'

export default function DiscussionCard({ discussion, bookId }) {
  // bookId can come from the parent prop or from the discussion's own book reference
  const bid = bookId || discussion.book?.openLibraryId
  const isSpoiler = Boolean(discussion.isSpoiler || discussion.spoiler)

  return (
    <Link
      to={`/books/${bid}/discussions/${discussion.id}`}
      className="block bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl p-5 hover:border-[#8C2520]/50 hover:shadow-lg hover:shadow-[#8C2520]/10 transition-all duration-300 group shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">

          {/* Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {isSpoiler && (
              <span className="text-xs bg-[#8C2520]/15 text-[#8C2520] border border-[#8C2520]/30 px-2.5 py-0.5 rounded-full font-serif font-bold flex items-center gap-1 shadow-sm">
                ⚠️ Contains Spoilers
              </span>
            )}
            {discussion.scope === 'CHAPTER' && discussion.chapterNumber && (
              <span className="text-xs bg-[#8C2520]/10 text-[#8C2520] border border-[#8C2520]/20 px-2.5 py-0.5 rounded-full font-serif font-bold">
                Ch. {discussion.chapterNumber}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-lg text-[#1C1917] group-hover:text-[#8C2520] transition-colors line-clamp-2 leading-snug">
            {discussion.title}
          </h3>

          {/* Body preview */}
          {isSpoiler ? (
            <div className="mt-2 text-xs text-[#78716C] italic font-serif bg-[#E4D7C3]/50 px-3 py-1.5 rounded-lg border border-[#D4C3A9] inline-flex items-center gap-1.5">
              🔒 Spoilers hidden — click to read full discussion
            </div>
          ) : (
            <p className="text-sm text-[#44403C] font-serif mt-1.5 line-clamp-2 leading-relaxed">{discussion.body}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#E4D7C3]/60 text-xs text-[#78716C]">
        <span className="flex items-center gap-1.5 font-medium">
          <div className="w-5 h-5 rounded-full bg-[#8C2520] text-[#FFFDF7] flex items-center justify-center text-[10px] font-bold font-serif">
            {discussion.author?.userName?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-[#1C1917]">{discussion.author?.userName ?? 'Unknown'}</span>
        </span>
        <span>💬 {discussion.comments?.length ?? 0}</span>
        <span>{formatRelativeTime(discussion.createdAt)}</span>
      </div>
    </Link>
  )
}
