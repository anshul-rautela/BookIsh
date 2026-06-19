import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getActiveRooms, createRoom } from '../api/live'
import { useAuthStore } from '../store/authStore'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatRelativeTime } from '../utils/dateUtils'

export default function LiveRooms() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ topic: '', bookId: '' })

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getActiveRooms,
    refetchInterval: 30000,
  })

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: (room) => {
      qc.invalidateQueries({ queryKey: ['rooms'] })
      navigate(`/rooms/${room.id}`)
    },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            🔴 Live Rooms
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1">Join real-time book discussions</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-sm rounded-xl font-medium transition-all"
          >
            + Create Room
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms?.map(room => (
            <button
              key={room.id}
              onClick={() => navigate(`/rooms/${room.id}`)}
              className="text-left bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-5 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-900/20 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium uppercase tracking-wider">Live</span>
              </div>
              <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
                {room.topic}
              </h3>
              {room.book && (
                <div className="flex items-center gap-2 mb-3">
                  {room.book.coverUrl && (
                    <img src={room.book.coverUrl} alt="" className="w-8 h-10 object-cover rounded" />
                  )}
                  <p className="text-xs text-slate-500 line-clamp-2">{room.book.title}</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{room.activeUserCount} online</span>
                </div>
                <span>by {room.createdBy?.username}</span>
              </div>
            </button>
          ))}
          {!rooms?.length && (
            <div className="col-span-full text-center py-20 text-slate-500">
              <div className="text-6xl mb-4">🎙️</div>
              <h2 className="text-xl font-semibold text-slate-300 mb-2">No live rooms</h2>
              <p className="mb-6">Create the first live room and start the conversation!</p>
              {isAuthenticated && (
                <button
                  onClick={() => setModal(true)}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all"
                >
                  Create Room
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Live Room">
        <div className="space-y-4">
          <input
            placeholder="Topic (e.g., 'Discussing Dune Chapter 5')"
            value={form.topic}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            className="w-full bg-[#16213e] border border-[#2a2a4a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500"
          />
          <button
            onClick={() => createMutation.mutate({ topic: form.topic, bookId: form.bookId || null })}
            disabled={!form.topic || createMutation.isPending}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
          >
            {createMutation.isPending ? 'Creating...' : '🚀 Start Room'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
