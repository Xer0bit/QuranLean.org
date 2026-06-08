import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import useQuranStore from '../store/useQuranStore'

export default function TafseerTooltip({ verseKey, children }) {
  const [visible, setVisible] = useState(false)
  const { tafseerMap, theme } = useQuranStore()
  const hoverTimer = useRef(null)

  const surface = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const border = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'

  const tafseerText = tafseerMap[verseKey] ?? ''

  const open = () => setVisible(true)
  const close = (e) => { e?.stopPropagation(); setVisible(false) }

  const handleMouseEnter = () => { hoverTimer.current = setTimeout(open, 300) }
  const handleMouseLeave = () => clearTimeout(hoverTimer.current)

  return (
    <div className="relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={open}
        className="cursor-pointer"
      >
        {children}
      </div>

      {visible && tafseerText && (
        <div
          className="absolute left-0 right-0 z-20 mt-3 rounded-2xl border p-4 shadow-xl fade-in"
          style={{ background: surface, borderColor: border, maxHeight: 300, overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: accent }}>
              Tafseer — Ibn Kathir
            </span>
            <button onClick={close} style={{ color: muted }}>
              <X size={15} />
            </button>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: text }}>
            {tafseerText}
          </p>
        </div>
      )}
    </div>
  )
}
