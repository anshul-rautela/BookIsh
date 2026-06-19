export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
      pages.push(i)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-1.5 text-sm bg-[#1a1a2e] border border-[#2a2a4a] text-slate-300 rounded-lg hover:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        ← Prev
      </button>

      {pages.map((p, idx) => (
        <div key={p} className="flex items-center gap-2">
          {idx > 0 && pages[idx - 1] !== p - 1 && (
            <span className="text-slate-500 px-1">…</span>
          )}
          <button
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-sm rounded-lg transition-all ${
              p === page
                ? 'bg-violet-600 text-white font-bold'
                : 'bg-[#1a1a2e] border border-[#2a2a4a] text-slate-300 hover:border-violet-500'
            }`}
          >
            {p + 1}
          </button>
        </div>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="px-3 py-1.5 text-sm bg-[#1a1a2e] border border-[#2a2a4a] text-slate-300 rounded-lg hover:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  )
}
