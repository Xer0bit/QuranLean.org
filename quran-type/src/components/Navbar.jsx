import { useState } from 'react'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import AuthModal from './AuthModal'
import useQuranStore from '../store/useQuranStore'
import useAuthStore from '../store/useAuthStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { currentSurah, currentAyahIndex, verses, theme } = useQuranStore()
  const { user, logout } = useAuthStore()
  const [showAuth, setShowAuth] = useState(false)

  const border = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const surface = theme === 'dark' ? '#1a1a1a' : '#ffffff'

  return (
    <>
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: border }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: muted }}
        >
          <ArrowLeft size={16} />
          <span>Surahs</span>
        </button>

        <div className="text-center">
          <div className="font-semibold text-sm" style={{ color: text }}>
            {currentSurah?.nameSimple ?? '—'}
          </div>
          {verses.length > 0 && (
            <div className="text-xs mt-0.5" style={{ color: muted }}>
              Ayah {currentAyahIndex + 1} / {verses.length}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                style={{ background: accent, color: '#0f0f0f' }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : user.name.charAt(0).toUpperCase()
                }
              </div>
              <button onClick={logout} title="Sign out" style={{ color: muted }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium border hover:opacity-80 transition-opacity"
              style={{ borderColor: border, color: accent }}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
