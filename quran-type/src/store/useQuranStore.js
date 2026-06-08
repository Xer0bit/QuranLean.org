import { create } from 'zustand'
import { fetchSurahData, fetchAllSurahs } from '../api/quran'
import { normalizeText } from '../utils/textNormalizer'
import { saveLastSession } from '../utils/lastSession'

const useQuranStore = create((set, get) => ({
  currentSurah: null,
  currentAyahIndex: 0,
  verses: [],
  tafseerMap: {},      // verseKey → tafseer text, pre-loaded for entire surah
  targetText: '',
  arabicText: '',
  verseKey: '',
  sessionStats: [],
  theme: localStorage.getItem('theme') || 'dark',
  isLoading: false,
  error: null,

  async loadSurah(surahNumber) {
    set({ isLoading: true, error: null, verses: [], tafseerMap: {}, currentAyahIndex: 0 })
    try {
      const [surahs, { verses, tafseerMap }] = await Promise.all([
        fetchAllSurahs(),
        fetchSurahData(surahNumber),
      ])
      const surah = surahs.find(s => s.id === Number(surahNumber))
      const validVerses = verses.filter(v => normalizeText(v.translationText).length > 0)
      const first = validVerses[0]
      set({
        currentSurah: surah,
        verses: validVerses,
        tafseerMap,
        currentAyahIndex: 0,
        targetText: first ? normalizeText(first.translationText) : '',
        arabicText: first?.arabicText ?? '',
        verseKey: first?.verseKey ?? '',
        isLoading: false,
      })
      if (surah && first) {
        saveLastSession({
          surahId: surah.id,
          surahName: surah.nameSimple,
          ayahIndex: 0,
          ayahKey: first.verseKey,
          totalAyahs: validVerses.length,
        })
      }
    } catch (e) {
      set({ isLoading: false, error: e.message })
    }
  },

  _persist(index, v) {
    const { currentSurah, verses } = get()
    if (currentSurah && v) {
      saveLastSession({
        surahId: currentSurah.id,
        surahName: currentSurah.nameSimple,
        ayahIndex: index,
        ayahKey: v.verseKey,
        totalAyahs: verses.length,
      })
    }
  },

  goToNextAyah() {
    const { verses, currentAyahIndex } = get()
    const next = currentAyahIndex + 1
    if (next >= verses.length) return
    const v = verses[next]
    set({
      currentAyahIndex: next,
      targetText: normalizeText(v.translationText),
      arabicText: v.arabicText,
      verseKey: v.verseKey,
    })
    get()._persist(next, v)
  },

  goToPrevAyah() {
    const { verses, currentAyahIndex } = get()
    const prev = currentAyahIndex - 1
    if (prev < 0) return
    const v = verses[prev]
    set({
      currentAyahIndex: prev,
      targetText: normalizeText(v.translationText),
      arabicText: v.arabicText,
      verseKey: v.verseKey,
    })
    get()._persist(prev, v)
  },

  goToAyah(index) {
    const { verses } = get()
    if (index < 0 || index >= verses.length) return
    const v = verses[index]
    set({
      currentAyahIndex: index,
      targetText: normalizeText(v.translationText),
      arabicText: v.arabicText,
      verseKey: v.verseKey,
    })
    get()._persist(index, v)
  },

  addSessionStat(stat) {
    set(s => ({ sessionStats: [...s.sessionStats, stat] }))
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
}))

export default useQuranStore
