const BASE = 'https://api.qurancdn.com/api/qdc'

// Module-level caches — populated once per surah, never re-fetched
const surahListCache = new Map()   // 'all' → Surah[]
const surahDataCache = new Map()   // surahId → { verses, tafseerMap }

function stripHtml(html) {
  return (html ?? '')
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')   // drop footnote markers entirely
    .replace(/<[^>]+>/g, '')                        // strip remaining tags
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchAllSurahs() {
  if (surahListCache.has('all')) return surahListCache.get('all')
  const res = await fetch(`${BASE}/chapters?language=en`)
  if (!res.ok) throw new Error('Failed to load surahs')
  const data = await res.json()
  const surahs = data.chapters.map(c => ({
    id: c.id,
    nameSimple: c.name_simple,
    nameArabic: c.name_arabic,
    versesCount: c.verses_count,
    revelationPlace: c.revelation_place,
  }))
  surahListCache.set('all', surahs)
  return surahs
}

// Fetches Arabic verses + Saheeh International translation + Ibn Kathir tafseer
// in three parallel requests, all cached as a single unit per surah.
//
// Translation endpoint: /quran/translations/20?chapter_number={n}
//   Returns translations in verse-order — matched by index to verses array.
//   ID 20 = Saheeh International (ID 131 does not exist on this API).
//
// Tafseer endpoint: /tafsirs/169/by_chapter/{n}
//   Returns objects with verse_key — keyed into a map for O(1) lookup.
export async function fetchSurahData(surahNumber) {
  if (surahDataCache.has(surahNumber)) return surahDataCache.get(surahNumber)

  const [versesRes, translationRes, tafseerRes] = await Promise.all([
    fetch(`${BASE}/verses/by_chapter/${surahNumber}?fields=text_uthmani&per_page=300&page=1`),
    fetch(`${BASE}/quran/translations/20?chapter_number=${surahNumber}`),
    fetch(`${BASE}/tafsirs/169/by_chapter/${surahNumber}?per_page=300&page=1`),
  ])

  if (!versesRes.ok) throw new Error('Failed to load verses')
  if (!translationRes.ok) throw new Error('Failed to load translation')
  if (!tafseerRes.ok) throw new Error('Failed to load tafseer')

  const [versesData, translationData, tafseerData] = await Promise.all([
    versesRes.json(), translationRes.json(), tafseerRes.json(),
  ])

  const rawTranslations = translationData.translations ?? []

  const verses = versesData.verses.map((v, i) => ({
    verseNumber: v.verse_number,
    verseKey: v.verse_key,
    arabicText: v.text_uthmani,
    translationText: stripHtml(rawTranslations[i]?.text ?? ''),
  }))

  const tafseerMap = {}
  for (const t of tafseerData.tafsirs ?? []) {
    tafseerMap[t.verse_key] = stripHtml(t.text)
  }

  const result = { verses, tafseerMap }
  surahDataCache.set(surahNumber, result)
  return result
}
