import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Play } from 'lucide-react'

function GithubMark({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  )
}
import SurahPicker from '../components/SurahPicker'
import ThemeToggle from '../components/ThemeToggle'
import AuthModal from '../components/AuthModal'
import { LogoQaf } from '../components/Logo'
import useQuranStore from '../store/useQuranStore'
import useAuthStore from '../store/useAuthStore'
import { getLastSession } from '../utils/lastSession'

export default function Home() {
  const { theme } = useQuranStore()
  const { user, logout, fetchStats } = useAuthStore()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [stats, setStats] = useState(null)
  const [lastSession, setLastSession] = useState(null)

  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const surface = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const border = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'

  useEffect(() => {
    if (user) fetchStats().then(s => s && setStats(s))
  }, [user])

  useEffect(() => {
    setLastSession(getLastSession())
  }, [])

  const resumeLast = () => {
    if (!lastSession) return
    navigate(`/surah/${lastSession.surahId}/ayah/${lastSession.ayahIndex}`)
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: theme === 'dark' ? '#0f0f0f' : '#fafaf8' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <LogoQaf theme={theme} size="sm" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                style={{ background: accent, color: '#0f0f0f' }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : user.name.charAt(0).toUpperCase()
                }
              </div>
              <span className="text-xs" style={{ color: muted }}>{user.name}</span>
              <button onClick={logout} style={{ color: muted }} title="Sign out"><LogOut size={14} /></button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:opacity-80 transition-opacity"
              style={{ borderColor: border, color: accent }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-10 pb-24 fade-in">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <LogoQaf theme={theme} size="lg" />
          </div>
          <p className="text-base mt-6" style={{ color: muted }}>
            Type the words of Allah. Understand every one.
          </p>
        </div>

        {user && stats && (
          <div className="flex gap-6 mb-8 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: accent }}>{stats.total_ayahs}</div>
              <div className="text-xs mt-0.5" style={{ color: muted }}>Ayahs typed</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: text }}>{stats.avg_wpm}</div>
              <div className="text-xs mt-0.5" style={{ color: muted }}>Avg WPM</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: text }}>{stats.avg_accuracy}%</div>
              <div className="text-xs mt-0.5" style={{ color: muted }}>Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: text }}>{stats.best_wpm}</div>
              <div className="text-xs mt-0.5" style={{ color: muted }}>Best WPM</div>
            </div>
          </div>
        )}

        {!user && (
          <p className="text-xs mb-8" style={{ color: muted }}>
            <button onClick={() => setShowAuth(true)} style={{ color: accent }} className="hover:underline">Sign in</button> to save your progress across devices
          </p>
        )}

        {lastSession && (
          <button
            onClick={resumeLast}
            className="w-full max-w-2xl mb-6 flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all hover:opacity-90 hover:scale-[1.01]"
            style={{ background: surface, borderColor: accent }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: accent, color: '#0f0f0f' }}
            >
              <Play size={18} fill="#0f0f0f" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: accent }}>
                Continue where you left off
              </div>
              <div className="text-sm font-medium truncate" style={{ color: text }}>
                {lastSession.surahName || `Surah ${lastSession.surahId}`}
                <span style={{ color: muted }}>
                  {' · '}Ayah {lastSession.ayahIndex + 1}
                  {lastSession.totalAyahs ? ` / ${lastSession.totalAyahs}` : ''}
                </span>
              </div>
            </div>
            <span className="text-sm font-medium flex-shrink-0" style={{ color: accent }}>Resume →</span>
          </button>
        )}

        <SurahPicker />
      </div>

      <footer className="px-6 py-5 border-t text-center" style={{ borderColor: border }}>
        <p className="text-xs flex items-center justify-center gap-1.5 flex-wrap" style={{ color: muted }}>
          <span>A free, open-source project.</span>
          <a
            href="https://github.com/xer0bit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium hover:underline"
            style={{ color: accent }}
          >
            <GithubMark size={12} />
            xer0bit
          </a>
        </p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  )
}
