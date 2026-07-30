import { useState } from 'react'

export default function SpoilerText({ text, label = 'Spoiler – click to reveal', isInline = false }) {
  const [revealed, setRevealed] = useState(false)

  if (!text) return null

  // Function to render text with ||inline spoiler|| or >!inline spoiler!< tags
  const renderInlineSpoilers = (content) => {
    if (typeof content !== 'string') return content
    const regex = /(\|\|.+?\|\||>!.+?!<)/g
    const parts = content.split(regex)

    return parts.map((part, index) => {
      if ((part.startsWith('||') && part.endsWith('||')) || (part.startsWith('>!') && part.endsWith('!<'))) {
        const cleanText = part.replace(/^(\|\||>!)/, '').replace(/(\||!|)$/, '')
        return <InlineSpoiler key={index} text={cleanText} />
      }
      return part
    })
  }

  return (
    <div className="relative my-1">
      <div
        className={`transition-all duration-300 ${
          revealed ? 'filter-none opacity-100' : 'blur-md select-none opacity-30 pointer-events-none'
        }`}
        aria-hidden={!revealed}
      >
        {renderInlineSpoilers(text)}
      </div>
      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="absolute inset-0 flex items-center justify-center bg-[#F5EFE0]/80 border border-[#E4D7C3] rounded-xl hover:bg-[#F5EFE0] transition-all cursor-pointer w-full backdrop-blur-sm shadow-inner group p-4"
        >
          <span className="bg-[#8C2520] group-hover:bg-[#6C1A16] text-[#FFFDF7] text-xs font-serif font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition-all group-hover:scale-105">
            ⚠️ {label}
          </span>
        </button>
      )}
    </div>
  )
}

function InlineSpoiler({ text }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <span
      onClick={(e) => { e.stopPropagation(); setRevealed(!revealed) }}
      className={`inline-block px-2 py-0.5 rounded cursor-pointer transition-all font-serif ${
        revealed
          ? 'bg-[#E4D7C3] text-[#1C1917]'
          : 'bg-[#1C1917] text-transparent select-none hover:bg-[#8C2520]'
      }`}
      title={revealed ? 'Click to hide spoiler' : 'Click to reveal spoiler'}
    >
      {text}
    </span>
  )
}
