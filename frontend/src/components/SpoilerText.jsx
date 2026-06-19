import { useState } from 'react'

export default function SpoilerText({ text, label = 'Spoiler – click to reveal' }) {
  const [revealed, setRevealed] = useState(false)

  if (!text) return null

  return (
    <div className="relative">
      <div
        className={`transition-all duration-300 ${revealed ? '' : 'blur-sm select-none'}`}
        aria-hidden={!revealed}
      >
        {text}
      </div>
      {!revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/20 transition-all cursor-pointer w-full"
        >
          <span className="bg-yellow-500/90 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            ⚠️ {label}
          </span>
        </button>
      )}
    </div>
  )
}
