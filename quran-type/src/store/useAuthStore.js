import { create } from 'zustand'

const API = import.meta.env.VITE_API_URL || ''

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('tt_token') || null,
  isLoading: false,
  error: null,

  async init() {
    const { token } = get()
    if (!token) return
    set({ isLoading: true })
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { get().logout(); return }
      const user = await res.json()
      set({ user, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  async signup(name, email, password) {
    set({ isLoading: true, error: null })
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) { set({ isLoading: false, error: data.detail }); throw new Error(data.detail) }
    localStorage.setItem('tt_token', data.token)
    set({ user: data.user, token: data.token, isLoading: false })
  },

  async login(email, password) {
    set({ isLoading: true, error: null })
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { set({ isLoading: false, error: data.detail }); throw new Error(data.detail) }
    localStorage.setItem('tt_token', data.token)
    set({ user: data.user, token: data.token, isLoading: false })
  },

  setTokenFromCallback(token) {
    localStorage.setItem('tt_token', token)
    set({ token })
    get().init()
  },

  logout() {
    localStorage.removeItem('tt_token')
    set({ user: null, token: null })
  },

  googleLoginUrl() {
    return `${API}/auth/google`
  },

  clearError() { set({ error: null }) },

  async saveSession(surahId, surahName, ayahKey, ayahIndex, wpm, accuracy) {
    const { token } = get()
    if (!token) return
    await fetch(`${API}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ surah_id: surahId, surah_name: surahName, ayah_key: ayahKey, ayah_index: ayahIndex, wpm, accuracy }),
    }).catch(() => {})
  },

  async fetchProgress() {
    const { token } = get()
    if (!token) return []
    const res = await fetch(`${API}/api/progress`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return []
    return res.json()
  },

  async fetchStats() {
    const { token } = get()
    if (!token) return null
    const res = await fetch(`${API}/api/stats`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    return res.json()
  },
}))

export default useAuthStore
