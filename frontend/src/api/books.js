import api from './axios'

export const searchBooks = (q) => api.get('/books/search', { params: { q } }).then(r => r.data)
export const getBook = (id) => api.get(`/books/${id}`).then(r => r.data)
export const addToShelf = (id, data) => api.post(`/books/${id}/shelf`, data).then(r => r.data)
export const getShelfEntry = (id) => api.get(`/books/${id}/shelf`).then(r => r.data)
export const getUserShelf = (userId) => api.get(`/users/${userId}/shelf`).then(r => r.data)
