import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CornerDownLeft } from 'lucide-react'
import useQuranStore from '../store/useQuranStore'

// Lets the user skip between ayahs or jump directly to a specific ayah number.
export default function AyahNavigator() {
  const { verses, currentAyahIndex, goToPrevAyah, goToNextAyah, goToAyah, theme } = useQuranStore()
  const [draft, setDraft] = useState(String(currentAyahIndex + 1))

  // Keep the input in sync when the ayah changes via keyboard / next button.
  useEffect(() => {
    setDraft(String(currentAyahIndex + 1))
  }, [currentAyahIndex])

  const border = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const surface = theme === 'dark' ? '#1a1a1a' : '#ffffff'

  if (verses.length === 0) return null

  const total = verses.length
  const isFirst = currentAyahIndex <= 0
  const isLast = currentAyahIndex >= total - 1

  const commitJump = () => {
    const n = parseInt(draft, 10)
    if (isNaN(n)) { setDraft(String(currentAyahIndex + 1)); return }
    const clamped = Math.max(1, Math.min(total, n))
    goToAyah(clamped - 1)        // store is 0-indexed; UI is 1-indexed
    setDraft(String(clamped))
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitJump(); e.target.blur() }
    if (e.key === 'Escape') { setDraft(String(currentAyahIndex + 1)); e.target.blur() }
    // Stop the typing engine / page-level handlers from seeing these keys.
    e.stopPropagation()
  }

  const btnBase = 'w-9 h-9 flex items-center justify-center rounded-lg border transition-colors'

  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <button
        onClick={goToPrevAyah}
        disabled={isFirst}
        title="Previous ayah"
        className={btnBase}
        style={{
          borderColor: border,
          color: isFirst ? muted : text,
          opacity: isFirst ? 0.4 : 1,
          cursor: isFirst ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronLeft size={18} />
      </button>

      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
        style={{ borderColor: border, background: surface }}
      >
        <span className="text-xs" style={{ color: muted }}>Ayah</span>
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={onKeyDown}
          onBlur={commitJump}
          className="w-10 text-center bg-transparent outline-none text-sm font-semibold"
          style={{ color: accent }}
          aria-label="Jump to ayah number"
        />
        <span className="text-xs" style={{ color: muted }}>/ {total}</span>
        <button
          onClick={commitJump}
          title="Jump to ayah (Enter)"
          className="ml-1"
          style={{ color: muted }}
        >
          <CornerDownLeft size={13} />
        </button>
      </div>

      <button
        onClick={goToNextAyah}
        disabled={isLast}
        title="Skip to next ayah"
        className={btnBase}
        style={{
          borderColor: border,
          color: isLast ? muted : text,
          opacity: isLast ? 0.4 : 1,
          cursor: isLast ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
