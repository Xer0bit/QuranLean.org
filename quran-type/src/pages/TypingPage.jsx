import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AyahDisplay from '../components/AyahDisplay'
import AyahNavigator from '../components/AyahNavigator'
import TypingArea from '../components/TypingArea'
import ResultsBar from '../components/ResultsBar'
import useQuranStore from '../store/useQuranStore'
import useAuthStore from '../store/useAuthStore'

export default function TypingPage() {
  const { surahId, ayahIndex } = useParams()
  const navigate = useNavigate()
  const { loadSurah, goToNextAyah, goToAyah, isLoading, error, theme, verses, currentAyahIndex, currentSurah, verseKey } = useQuranStore()
  const { saveSession } = useAuthStore()

  const [result, setResult] = useState(null)
  const resetRef = useRef(null)

  useEffect(() => {
    loadSurah(Number(surahId)).then(() => {
      if (ayahIndex !== undefined) {
        goToAyah(Number(ayahIndex))
      }
    })
  }, [surahId])

  useEffect(() => {
    setResult(null)
  }, [currentAyahIndex])

  useEffect(() => {
    const handleKey = (e) => {
      // Ignore keys aimed at the ayah-jump number input.
      const tag = e.target?.tagName
      if ((tag === 'INPUT' || tag === 'TEXTAREA') && e.target?.inputMode === 'numeric') return

      if (e.key === 'Escape') navigate('/')
      if (e.key === 'Enter' && result) handleNext()
      if (e.key === 'Tab' && result) {
        e.preventDefault()
        handleRetry()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [result])

  const handleComplete = useCallback((stats) => {
    setResult(stats)
    if (currentSurah) {
      saveSession(
        currentSurah.id,
        currentSurah.nameSimple,
        verseKey,
        currentAyahIndex,
        stats.wpm,
        stats.accuracy,
      )
    }
  }, [currentSurah, verseKey, currentAyahIndex, saveSession])

  const handleNext = useCallback(() => {
    setResult(null)
    goToNextAyah()
  }, [goToNextAyah])

  const handleRetry = useCallback(() => {
    setResult(null)
  }, [])

  const bg = theme === 'dark' ? '#0f0f0f' : '#fafaf8'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
      <div className="text-sm" style={{ color: muted }}>Loading surah…</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: bg }}>
      <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
      <p className="text-sm" style={{ color: muted }}>Could not load this surah. Please check your connection.</p>
      <button
        onClick={() => loadSurah(Number(surahId))}
        className="px-4 py-2 rounded-xl text-sm border"
        style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5', color: text }}
      >
        Retry
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      <Navbar />

      <main className="flex-1 flex flex-col px-4 py-8 fade-in">
        <div style={{ maxWidth: 780, margin: '0 auto', width: '100%' }}>
          <AyahNavigator />

          <AyahDisplay />

          <TypingArea key={`${currentAyahIndex}-${result ? 'done' : 'typing'}`} onComplete={handleComplete} />

          {!result && (
            <div className="mt-8 text-xs text-center" style={{ color: muted }}>
              Tab to retry · Esc for surahs
            </div>
          )}

          {result && (
            <div className="mt-8">
              <ResultsBar
                wpm={result.wpm}
                accuracy={result.accuracy}
                onNext={handleNext}
                onRetry={handleRetry}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
