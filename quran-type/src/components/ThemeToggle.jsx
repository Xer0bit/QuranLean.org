import { Sun, Moon } from 'lucide-react'
import useQuranStore from '../store/useQuranStore'

export default function ThemeToggle() {
  const { theme, setTheme } = useQuranStore()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors"
      style={{
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        color: theme === 'dark' ? '#6b6b6b' : '#9a9a9a',
      }}
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
