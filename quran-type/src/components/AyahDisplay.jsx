import TafseerTooltip from './TafseerTooltip'
import useQuranStore from '../store/useQuranStore'

export default function AyahDisplay() {
  const { arabicText, verseKey, targetText, theme } = useQuranStore()

  const border = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
  const muted = theme === 'dark' ? '#6b6b6b' : '#9a9a9a'
  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'

  return (
    <div className="mb-8">
      <TafseerTooltip verseKey={verseKey}>
        <div className="text-center py-2">
          <p
            className="font-arabic text-3xl leading-loose"
            style={{ color: accent, direction: 'rtl', opacity: 0.9 }}
          >
            {arabicText}
          </p>
          <p className="text-xs mt-2 tracking-widest" style={{ color: muted }}>
            {verseKey} · hover for tafseer
          </p>
        </div>
      </TafseerTooltip>

      <div
        className="mt-4 pt-4 border-t"
        style={{ borderColor: border }}
      >
        <p className="text-sm italic leading-relaxed text-center" style={{ color: muted }}>
          {targetText}
        </p>
      </div>
    </div>
  )
}
