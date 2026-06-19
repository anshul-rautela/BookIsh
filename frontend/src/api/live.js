import api from './axios'

export const getActiveRooms = () => api.get('/rooms').then(r => r.data)
export const createRoom = (data) => api.post('/rooms', data).then(r => r.data)
export const getRoom = (id) => api.get(`/rooms/${id}`).then(r => r.data)
export const deactivateRoom = (id) => api.delete(`/rooms/${id}`).then(r => r.data)
