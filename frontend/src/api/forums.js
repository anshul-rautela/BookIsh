import api from './axios'

export const getForums = () => api.get('/forums').then(r => r.data)
export const createForum = (data) => api.post('/forums', data).then(r => r.data)
export const getForumByName = (name) => api.get(`/forums/${name}`).then(r => r.data)
export const getForumPosts = (name, params) =>
  api.get(`/forums/${name}/posts`, { params }).then(r => r.data)
export const createPost = (name, data) =>
  api.post(`/forums/${name}/posts`, data).then(r => r.data)
export const getPost = (id) => api.get(`/forums/posts/${id}`).then(r => r.data)
export const votePost = (id, vote) =>
  api.post(`/forums/posts/${id}/vote`, { vote }).then(r => r.data)
export const addForumComment = (postId, data) =>
  api.post(`/forums/posts/${postId}/comments`, data).then(r => r.data)
