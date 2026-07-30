import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
  const coverFallback = 'https://via.placeholder.com/150x220/f3ebdd/8c2520?text=No+Cover'

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <div className="bg-[#F5EFE0] border border-[#E4D7C3] rounded-2xl overflow-hidden hover:border-[#8C2520]/60 hover:shadow-xl hover:shadow-[#8C2520]/10 transition-all duration-300 hover:-translate-y-1">
        <div className="relative overflow-hidden aspect-[2/3] bg-[#E5D7C3]">
          <img
            src={book.coverUrl || coverFallback}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = coverFallback }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3.5">
          <h3 className="font-serif font-bold text-sm text-[#1C1917] line-clamp-2 group-hover:text-[#8C2520] transition-colors leading-snug">
            {book.title}
          </h3>
          <p className="text-xs text-[#57534E] font-medium mt-1 truncate">{book.author}</p>
          {book.publishedYear && (
            <p className="text-xs text-[#78716C] mt-0.5">{book.publishedYear}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
