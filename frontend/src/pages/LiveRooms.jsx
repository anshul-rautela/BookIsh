/**
 * Live Rooms – Coming Soon
 *
 * The real-time chat feature is under development.
 * WebSocket infrastructure will be added in a future release.
 */
export default function LiveRooms() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-32 pb-12 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#8C2520] text-[#FFFDF7] mb-8 text-5xl shadow-md">
        🎙️
      </div>
      <h1 className="text-4xl font-bold font-serif text-[#1C1917] mb-4">Live Reading Rooms</h1>
      <p className="text-[#57534E] font-serif text-lg mb-6 leading-relaxed max-w-md mx-auto">
        Real-time book discussions are coming soon! Chat live with fellow readers in dedicated chapter rooms.
      </p>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8C2520]/10 border border-[#8C2520]/30 text-[#8C2520] text-sm font-serif font-bold">
        <span className="w-2.5 h-2.5 bg-[#8C2520] rounded-full animate-pulse" />
        Under development
      </div>
    </div>
  )
}
