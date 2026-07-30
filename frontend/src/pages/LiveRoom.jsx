/**
 * Live Room – Coming Soon (individual room view placeholder)
 */
import { useNavigate } from 'react-router-dom'

export default function LiveRoom() {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl mx-auto px-4 pt-32 pb-12 text-center">
      <div className="text-6xl mb-6">💬</div>
      <h1 className="text-3xl font-bold text-slate-100 mb-4">Live Room</h1>
      <p className="text-slate-400 mb-8">Real-time chat rooms are coming soon. Stay tuned!</p>
      <button
        onClick={() => navigate('/rooms')}
        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all"
      >
        ← Back to Rooms
      </button>
    </div>
  )
}
