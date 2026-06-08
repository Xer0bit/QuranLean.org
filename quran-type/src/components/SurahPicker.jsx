import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { fetchAllSurahs } from '../api/quran'
import useQuranStore from '../store/useQuranStore'

export default function SurahPicker() {
  const [surahs, setSurahs] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { theme } = useQuranStore()

  useEffect(() => {
    fetchAllSurahs()
      .then(setSurahs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = surahs.filter(s => {
    const q = query.toLowerCase()
    return (
      s.nameSimple.toLowerCase().includes(q) ||
      s.nameArabic.includes(query) ||
      String(s.id).includes(q)
    )
  })

  const surface = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const border = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const inputBg = theme === 'dark' ? '#111111' : '#f5f5f3'

  if (loading) return (
    <div className="flex items-center justify-center py-20" style={{ color: muted }}>
      Loading surahs…
    </div>
  )

  if (error) return (
    <div className="text-center py-20">
      <p style={{ color: '#f87171' }}>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded border" style={{ borderColor: border, color: text }}>
        Retry
      </button>
    </div>
  )

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: muted }} />
        <input
          type="text"
          placeholder="Search surah by name or number…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border"
          style={{ background: inputBg, borderColor: border, color: text }}
        />
      </div>

      <div className="grid gap-2">
        {filtered.map(s => (
          <button
            key={s.id}
            onClick={() => navigate(`/surah/${s.id}`)}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-left border transition-all hover:opacity-80 active:scale-[0.99]"
            style={{ background: surface, borderColor: border }}
          >
            <span
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-medium"
              style={{ background: border, color: muted }}
            >
              {s.id}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate" style={{ color: text }}>{s.nameSimple}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{ borderColor: border, color: muted }}
                >
                  {s.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}
                </span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: muted }}>
                {s.versesCount} ayahs
              </div>
            </div>

            <span
              className="font-arabic text-xl flex-shrink-0"
              style={{ color: accent }}
              dir="rtl"
            >
              {s.nameArabic}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-10 text-sm" style={{ color: muted }}>
          No surahs match "{query}"
        </p>
      )}
    </div>
  )
}
