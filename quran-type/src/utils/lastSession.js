// Persists the user's last typing position locally so anyone — logged in or
// not — can pick up where they left off. Stored in localStorage as a single
// JSON record.

const KEY = 'tt_last_session'

export function saveLastSession({ surahId, surahName, ayahIndex, ayahKey, totalAyahs }) {
  if (surahId == null || ayahIndex == null) return
  try {
    localStorage.setItem(KEY, JSON.stringify({
      surahId,
      surahName: surahName ?? '',
      ayahIndex,
      ayahKey: ayahKey ?? '',
      totalAyahs: totalAyahs ?? 0,
      updatedAt: Date.now(),
    }))
  } catch {
    // localStorage unavailable (private mode etc.) — silently ignore
  }
}

export function getLastSession() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.surahId == null || data.ayahIndex == null) return null
    return data
  } catch {
    return null
  }
}

export function clearLastSession() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
