// Three logo concepts for QuranLearn.org
// Usage: <LogoQalam theme="dark" /> | <LogoStar theme="dark" /> | <LogoQaf theme="dark" />

// Concept 1 — The Qalam (pen + typing cursor)
export function LogoQalam({ theme = 'dark', size = 'md' }) {
  const gold = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const fg = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const muted = theme === 'dark' ? '#9a9a9a' : '#6b6b6b'
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 * scale, transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      {/* Qalam + cursor icon */}
      <svg width={32} height={40} viewBox="0 0 32 40" fill="none">
        {/* Qalam body — triangular pen shape */}
        <polygon points="12,2 22,2 26,30 8,30" fill={gold} opacity="0.9" />
        {/* Pen tip */}
        <polygon points="8,30 26,30 17,38" fill={gold} />
        {/* Typing cursor bars (I-beam lines) */}
        <rect x="27" y="8" width="3" height="24" rx="1.5" fill={gold} opacity="0.6" />
        <rect x="25" y="8" width="7" height="3" rx="1.5" fill={gold} opacity="0.6" />
        <rect x="25" y="29" width="7" height="3" rx="1.5" fill={gold} opacity="0.6" />
        {/* Highlight on pen */}
        <rect x="14" y="6" width="2" height="16" rx="1" fill="white" opacity="0.2" />
      </svg>

      {/* Wordmark */}
      <div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 18,
          lineHeight: 1.15,
          color: fg,
          letterSpacing: '-0.3px',
        }}>
          <span>Quran</span><br />
          <span>Learn</span>
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 8,
          letterSpacing: '0.18em',
          color: muted,
          marginTop: 3,
          textTransform: 'uppercase',
        }}>
          Type · Reflect · Understand
        </div>
      </div>
    </div>
  )
}

// Concept 2 — 8-pointed star (Rub el Hizb)
export function LogoStar({ theme = 'dark', size = 'md' }) {
  const gold = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const fg = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const muted = theme === 'dark' ? '#9a9a9a' : '#6b6b6b'
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1

  // 8-pointed star (two overlapping squares)
  const star = () => {
    const r = 18, ri = 9, cx = 18, cy = 18
    const pts = Array.from({ length: 8 }, (_, i) => {
      const outer = (i * 45 - 22.5) * (Math.PI / 180)
      const inner = (i * 45) * (Math.PI / 180)
      const ox = cx + r * Math.cos(outer)
      const oy = cy + r * Math.sin(outer)
      const ix = cx + ri * Math.cos(inner)
      const iy = cy + ri * Math.sin(inner)
      return `${ox},${oy} ${ix},${iy}`
    }).join(' ')
    return pts
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 * scale, transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      {/* Rub el Hizb star */}
      <svg width={36} height={36} viewBox="0 0 36 36" fill="none">
        {/* Outer star */}
        <rect x="7" y="7" width="22" height="22" rx="2" fill={gold} transform="rotate(0 18 18)" />
        <rect x="7" y="7" width="22" height="22" rx="2" fill={gold} transform="rotate(45 18 18)" />
        {/* Center circle */}
        <circle cx="18" cy="18" r="6" fill={theme === 'dark' ? '#1a1a1a' : '#fafaf8'} />
        <circle cx="18" cy="18" r="4" fill={gold} opacity="0.3" />
        {/* Center dot */}
        <circle cx="18" cy="18" r="2" fill={gold} />
      </svg>

      {/* Wordmark */}
      <div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: 22,
          lineHeight: 1.1,
          color: fg,
          letterSpacing: '-0.5px',
        }}>
          <span>quran</span><br />
          <span style={{ color: gold, fontWeight: 500 }}>learn</span>
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 9,
          letterSpacing: '0.22em',
          color: muted,
          marginTop: 2,
          textTransform: 'uppercase',
        }}>
          · org ·
        </div>
      </div>
    </div>
  )
}

// Concept 3 — Arabic lettermark ق (Qaf) as icon
export function LogoQaf({ theme = 'dark', size = 'md' }) {
  const gold = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const fg = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const muted = theme === 'dark' ? '#9a9a9a' : '#6b6b6b'
  const border = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 * scale, transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      {/* ق in circle */}
      <div style={{
        width: 46,
        height: 46,
        borderRadius: '50%',
        border: `1.5px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Amiri', serif",
          fontSize: 24,
          color: gold,
          lineHeight: 1,
          display: 'block',
          marginTop: 3,
        }}>ق</span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 36, background: theme === 'dark' ? '#2a2a2a' : '#e5e5e5' }} />

      {/* Wordmark */}
      <div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 18,
          color: fg,
          letterSpacing: '-0.2px',
          lineHeight: 1.2,
        }}>
          QuranLearn
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 10,
          color: gold,
          letterSpacing: '0.05em',
          lineHeight: 1,
        }}>
          .org
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 7.5,
          color: muted,
          letterSpacing: '0.2em',
          marginTop: 3,
          textTransform: 'uppercase',
        }}>
          English · Tafseer
        </div>
      </div>
    </div>
  )
}

// Default export — the Qaf logo (most distinctive)
export default LogoQaf
