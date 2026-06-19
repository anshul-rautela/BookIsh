import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
  const coverFallback = 'https://via.placeholder.com/150x220/1a1a2e/7c3aed?text=No+Cover'

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl overflow-hidden hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/30 transition-all duration-300 hover:-translate-y-1">
        <div className="relative overflow-hidden aspect-[2/3]">
          <img
            src={book.coverUrl || coverFallback}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = coverFallback }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 group-hover:text-violet-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 truncate">{book.author}</p>
          {book.publishedYear && (
            <p className="text-xs text-slate-600 mt-1">{book.publishedYear}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
