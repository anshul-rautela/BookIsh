import api from './axios'

export const getDiscussions = (bookId, params) =>
  api.get(`/books/${bookId}/discussions`, { params }).then(r => r.data)
export const createDiscussion = (bookId, data) =>
  api.post(`/books/${bookId}/discussions`, data).then(r => r.data)
export const getDiscussion = (id) =>
  api.get(`/discussions/${id}`).then(r => r.data)
export const addComment = (discussionId, data) =>
  api.post(`/discussions/${discussionId}/comments`, data).then(r => r.data)
export const deleteDiscussion = (id) =>
  api.delete(`/discussions/${id}`).then(r => r.data)
export const deleteComment = (id) =>
  api.delete(`/comments/${id}`).then(r => r.data)
