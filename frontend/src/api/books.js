import api from './axios'

/**
 * Search books via the backend → OpenLibrary proxy.
 * Maps the raw OpenLibrary response into the shape the UI expects.
 */
export const searchBooks = async (q) => {
  const { data } = await api.get('/books/search', { params: { q } })
  const docs = data.docs || []
  return docs.map((doc) => ({
    id:            doc.key?.replace('/works/', '') ?? doc.key,
    title:         doc.title ?? 'Unknown Title',
    author:        doc.author_name?.[0] ?? 'Unknown Author',
    publishedYear: doc.first_publish_year ?? null,
    coverUrl:      doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }))
}

/**
 * Fetch author name from OpenLibrary given a key like "/authors/OL23919A"
 */
export const getAuthorName = async (authorKey) => {
  try {
    // Strip leading slash for our backend proxy path
    const key = authorKey.replace('/authors/', '')
    const res = await fetch(`https://openlibrary.org/authors/${key}.json`)
    const data = await res.json()
    return data.name ?? 'Unknown Author'
  } catch {
    return 'Unknown Author'
  }
}

/**
 * Fetch a single OpenLibrary work. Returns a normalised book object
 * including a resolved author name.
 */
export const getBook = async (id) => {
  const { data } = await api.get(`/books/${id}`)

  // Resolve description
  const description = typeof data.description === 'string'
    ? data.description
    : data.description?.value ?? ''

  // Resolve cover
  const coverId = data.covers?.[0]
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : null

  // Resolve author name (first author)
  const authorKey = data.authors?.[0]?.author?.key ?? null
  const author = authorKey ? await getAuthorName(authorKey) : 'Unknown Author'

  return {
    id,
    title:         data.title ?? 'Unknown Title',
    author,
    authorKey,
    description,
    coverUrl,
    publishedYear: data.first_publish_date ?? null,
    subjects:      data.subjects ?? [],
  }
}

/** Shelf endpoints — openLibraryId e.g. "OL45804W" */
export const addToShelf    = (id, data) => api.post(`/books/${id}/shelf`, data).then(r => r.data)
export const getShelfEntry = (id)       => api.get(`/books/${id}/shelf`).then(r => r.data)
export const getUserShelf  = (userId)   => api.get(`/user/${userId}/shelf`).then(r => r.data)
