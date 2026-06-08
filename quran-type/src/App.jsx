import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import TypingPage from './pages/TypingPage'
import AuthCallback from './pages/AuthCallback'
import useQuranStore from './store/useQuranStore'
import useAuthStore from './store/useAuthStore'

export default function App() {
  const { theme } = useQuranStore()
  const { init } = useAuthStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => { init() }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/surah/:surahId" element={<TypingPage />} />
      <Route path="/surah/:surahId/ayah/:ayahIndex" element={<TypingPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  )
}
