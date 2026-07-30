import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#FFFDF7] border border-[#D4C3A9] rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4D7C3]">
          <h2 className="text-xl font-bold font-serif text-[#1C1917]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] hover:bg-[#E4D7C3]/50 w-8 h-8 flex items-center justify-center rounded-lg transition-all font-bold"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
