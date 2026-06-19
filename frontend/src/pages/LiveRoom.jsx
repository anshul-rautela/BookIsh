import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRoom } from '../api/live'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuthStore } from '../store/authStore'
import { formatRelativeTime } from '../utils/dateUtils'

export default function LiveRoom() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => getRoom(id),
    onSuccess: (data) => {
      if (data.recentMessages) {
        setMessages(data.recentMessages)
      }
    },
  })

  const onMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const onUserList = useCallback((users) => {
    setActiveUsers(Array.isArray(users) ? users : Object.values(users))
  }, [])

  const { sendMessage } = useWebSocket({ roomId: id, onMessage, onUserList })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (room?.recentMessages) {
      setMessages(room.recentMessages)
    }
  }, [room])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !isAuthenticated) return
    sendMessage(input.trim())
    setInput('')
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  )

  if (!room) return <div className="pt-24 text-center text-slate-400">Room not found.</div>

  return (
    <div className="h-screen flex flex-col pt-16">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-[#1a1a2e] border-b border-[#2a2a4a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/rooms')} className="text-slate-500 hover:text-slate-200 transition-colors">←</button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h1 className="font-semibold text-slate-100">{room.topic}</h1>
          </div>
          {room.book && (
            <span className="text-xs text-slate-500">📚 {room.book.title}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>👥 {activeUsers.length} online</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = msg.user?.id === user?.id
              return (
                <div key={msg.messageId || idx} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {msg.user?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isMe && (
                      <span className="text-xs text-violet-400 font-medium">{msg.user?.username}</span>
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? 'bg-violet-600 text-white rounded-tr-sm'
                        : 'bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-600">{formatRelativeTime(msg.sentAt)}</span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-[#2a2a4a] bg-[#0f0f1a]">
            {isAuthenticated ? (
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1a1a2e] border border-[#2a2a4a] focus:border-violet-500 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-2xl text-sm font-medium transition-all"
                >
                  Send ↗
                </button>
              </form>
            ) : (
              <div className="text-center text-slate-500 text-sm py-2">
                <a href="/login" className="text-violet-400 hover:text-violet-300">Sign in</a> to join the conversation
              </div>
            )}
          </div>
        </div>

        {/* Active Users Sidebar */}
        <div className="hidden lg:flex w-56 flex-col border-l border-[#2a2a4a] bg-[#1a1a2e] overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#2a2a4a]">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Online — {activeUsers.length}
            </h3>
          </div>
          <div className="p-3 space-y-2">
            {activeUsers.map((userId, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                  U
                </div>
                <span className="text-xs text-slate-400 truncate">{userId}</span>
              </div>
            ))}
            {activeUsers.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4">No users online</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
