import useQuranStore from '../store/useQuranStore'
import { useTypingEngine } from '../hooks/useTypingEngine'

export default function ResultsBar({ wpm, accuracy, onNext, onRetry }) {
  const { currentAyahIndex, verses, currentSurah, theme } = useQuranStore()
  const isLastAyah = currentAyahIndex >= verses.length - 1

  const surface = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const border = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'

  return (
    <div
      className="slide-up flex items-center gap-6 rounded-2xl border px-6 py-4"
      style={{ background: surface, borderColor: border }}
    >
      <div>
        <div className="text-3xl font-bold leading-none" style={{ color: accent }}>
          {wpm}
        </div>
        <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: muted }}>
          WPM
        </div>
      </div>

      <div>
        <div className="text-3xl font-bold leading-none" style={{ color: text }}>
          {accuracy}%
        </div>
        <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: muted }}>
          Accuracy
        </div>
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: isLastAyah ? accent : text }}>
          {isLastAyah ? `Surah ${currentSurah?.nameSimple} complete 🎉` : '✓ Ayah complete'}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl text-sm border transition-colors hover:opacity-80"
          style={{ borderColor: border, color: muted, background: 'transparent' }}
        >
          Retry ↺
        </button>
        {isLastAyah ? (
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
            style={{ background: accent, color: '#0f0f0f' }}
          >
            New Surah
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-90 flex items-center gap-2"
            style={{ background: accent, color: '#0f0f0f' }}
          >
            Next Ayah →
            <kbd
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'rgba(0,0,0,0.18)', color: '#0f0f0f' }}
            >
              Enter
            </kbd>
          </button>
        )}
      </div>
    </div>
  )
}
