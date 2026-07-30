/**
 * Live Rooms – Coming Soon
 *
 * The real-time chat feature is under development.
 * WebSocket infrastructure will be added in a future release.
 */
export default function LiveRooms() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-32 pb-12 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 mb-8 text-5xl">
        🎙️
      </div>
      <h1 className="text-4xl font-bold text-slate-100 mb-4">Live Rooms</h1>
      <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-md mx-auto">
        Real-time book discussions are coming soon! This feature is currently in development and will let you chat live with other readers.
      </p>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium">
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
        Under development
      </div>
    </div>
  )
}
