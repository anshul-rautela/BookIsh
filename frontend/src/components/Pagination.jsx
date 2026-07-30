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
        className="px-3.5 py-1.5 text-sm bg-[#F5EFE0] border border-[#E4D7C3] text-[#1C1917] font-serif rounded-lg hover:border-[#8C2520] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        ← Prev
      </button>

      {pages.map((p, idx) => (
        <div key={p} className="flex items-center gap-2">
          {idx > 0 && pages[idx - 1] !== p - 1 && (
            <span className="text-[#78716C] px-1 font-serif">…</span>
          )}
          <button
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-sm font-serif rounded-lg transition-all shadow-sm ${
              p === page
                ? 'bg-[#8C2520] text-[#FFFDF7] font-bold'
                : 'bg-[#F5EFE0] border border-[#E4D7C3] text-[#1C1917] hover:border-[#8C2520]'
            }`}
          >
            {p + 1}
          </button>
        </div>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="px-3.5 py-1.5 text-sm bg-[#F5EFE0] border border-[#E4D7C3] text-[#1C1917] font-serif rounded-lg hover:border-[#8C2520] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        Next →
      </button>
    </div>
  )
}
