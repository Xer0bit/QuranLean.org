# Claude Code — Build Prompt: Quran Typing App

## Project Overview

Build a full, production-ready web application called **"Tarteel Type"** (or similar — name TBD).
It is a **Monkeytype-style Quran learning app** where users type the **English translation** of
Quranic ayahs. The experience is distraction-free, contemplative, and spiritually intentional.
Tafseer is available on hover/tap — never in the way.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | React 18 + Vite                   |
| Styling    | Tailwind CSS v3                   |
| State      | Zustand                           |
| Routing    | React Router v6                   |
| API        | Quran.com Public API v4           |
| Icons      | Lucide React                      |
| Fonts      | Google Fonts — `Amiri` (Arabic), `Inter` (UI) |
| Hosting    | Vercel-ready (no special config needed) |

---

## Project Structure

Scaffold exactly this folder/file structure:

```
quran-type/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   └── quran.js
│   ├── components/
│   │   ├── SurahPicker.jsx
│   │   ├── TypingArea.jsx
│   │   ├── AyahDisplay.jsx
│   │   ├── TafseerTooltip.jsx
│   │   ├── ResultsBar.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── Navbar.jsx
│   ├── hooks/
│   │   ├── useTypingEngine.js
│   │   └── useTafseer.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── TypingPage.jsx
│   ├── store/
│   │   └── useQuranStore.js
│   ├── utils/
│   │   └── textNormalizer.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## API Reference — Quran.com API v4

**Base URL:** `https://api.qurancdn.com/api/qdc`

### Endpoints to use:

```js
// 1. Fetch all Surahs (for the picker)
GET /chapters?language=en

// 2. Fetch all ayahs of a Surah with translation
GET /verses/by_chapter/{surahNumber}
  ?translations=131
  &fields=text_uthmani
  &per_page=300
  &page=1

// 3. Fetch tafseer for a single ayah (lazy — only on hover)
GET /tafsirs/169/by_ayah/{verseKey}
// verseKey format: "1:1" (surah:ayah)
// 169 = Al-Jalalayn (concise, great for this use case)
// 168 = Ibn Kathir (more detailed, also good)

// Translation IDs:
// 131 = Saheeh International (default)
// 203 = The Clear Quran (Dr. Mustafa Khattab)
```

### `src/api/quran.js` — implement these functions:

```js
export async function fetchAllSurahs()
// Returns: array of { id, nameSimple, nameArabic, versesCount, revelationPlace }

export async function fetchSurahVerses(surahNumber)
// Returns: array of { verseNumber, verseKey, arabicText, translationText }
// verseKey = "2:255" format

export async function fetchTafseer(verseKey)
// Returns: { verseKey, text } — plain text tafseer
// Strip any HTML tags from the response
```

Add error handling and loading states for all fetch calls.
Cache fetched surahs and verses in memory (simple JS Map) to avoid redundant API calls.

---

## Zustand Store — `src/store/useQuranStore.js`

```js
{
  // Navigation
  currentSurah: null,       // { id, nameSimple, nameArabic, versesCount }
  currentAyahIndex: 0,      // index within the loaded verses array
  verses: [],               // all verses of current surah

  // Current verse
  targetText: "",           // English translation text to type
  arabicText: "",           // Arabic text (display only)
  verseKey: "",             // e.g. "1:1"

  // Session stats
  sessionStats: [],         // array of { verseKey, wpm, accuracy } per completed ayah

  // UI
  theme: "dark",            // "dark" | "light"
  isLoading: false,
  error: null,

  // Actions
  loadSurah(surahNumber),
  goToNextAyah(),
  goToPrevAyah(),
  goToAyah(index),
  setTheme(theme),
}
```

---

## Typing Engine — `src/hooks/useTypingEngine.js`

This is the **core** of the app. Build it carefully.

### State it manages:
```js
{
  typed: "",           // full string the user has typed so far
  charStatuses: [],    // array of 'correct' | 'incorrect' | 'pending' per character
  currentIndex: 0,     // current cursor position in targetText
  startTime: null,     // timestamp of first keypress
  endTime: null,
  isComplete: false,
  wpm: 0,
  accuracy: 0,
}
```

### Behavior rules:
- Accept `targetText` as input param
- Reset all state whenever `targetText` changes
- On each keypress:
  - If `isComplete`, ignore all input
  - Set `startTime` on first keypress
  - If correct character → mark as `'correct'`, advance `currentIndex`
  - If wrong character → mark as `'incorrect'`, advance `currentIndex` (user must backspace)
  - If `Backspace` → remove last typed char, revert its status to `'pending'`, decrement `currentIndex`
  - If `currentIndex === targetText.length` → set `isComplete = true`, calculate final WPM and accuracy
- **WPM formula:** `(correctChars / 5) / (elapsedSeconds / 60)`
- **Accuracy formula:** `(correctChars / totalTyped) * 100`
- Expose a `reset()` function to restart the current ayah

### Returns:
```js
{ typed, charStatuses, currentIndex, isComplete, wpm, accuracy, reset }
```

---

## Text Normalizer — `src/utils/textNormalizer.js`

```js
export function normalizeText(text) {
  // 1. Trim leading/trailing whitespace
  // 2. Collapse multiple spaces into one
  // 3. Remove any non-typeable characters (zero-width spaces, etc.)
  // 4. Normalize smart quotes to straight quotes: " " → " and ' ' → '
  // 5. Return cleaned string
}
```

Apply `normalizeText` to every `translationText` before storing it as `targetText`.

---

## Tafseer Hook — `src/hooks/useTafseer.js`

```js
export function useTafseer() {
  // State: { content, isLoading, error, verseKey }
  // Method: fetchForVerse(verseKey) — fetches if not already cached
  // Cache results in a module-level Map to avoid re-fetching
  // Returns: { tafseer, isLoading, fetchForVerse }
}
```

---

## Pages

### `src/pages/Home.jsx`
- Full-screen centered layout
- App name + short tagline: *"Type the words of Allah. Understand every one."*
- `<SurahPicker />` below the tagline
- On surah selection → navigate to `/surah/:id`
- Dark background by default

### `src/pages/TypingPage.jsx`
- Loads surah data on mount via `useQuranStore`
- Shows loading spinner while fetching
- Renders:
  - `<Navbar />` — surah name, ayah progress (e.g. "Al-Baqarah — Ayah 3 / 286"), back button
  - `<AyahDisplay />` — Arabic text + verse number, read-only
  - `<TypingArea />` — the main typing zone
  - `<ResultsBar />` — shown only when `isComplete === true`

---

## Components

### `<SurahPicker />`
- Searchable list/grid of all 114 surahs
- Each item shows: Arabic name, English name, verse count, Meccan/Medinan badge
- On click → load that surah and navigate to typing page
- Include a search input to filter by name or number

### `<AyahDisplay />`
- Shows Arabic text of current ayah in `Amiri` font, right-aligned, large (text-3xl+)
- Shows surah:ayah reference below in muted text
- Shows English translation below Arabic in smaller, muted italic text (for reference — this is NOT the typing area)
- Has a subtle separator between this and the typing area below

### `<TypingArea />`
- Renders the `targetText` character by character
- Each character is a `<span>` with class based on its status:
  - `pending` → muted/dim color
  - `correct` → white or accent color
  - `incorrect` → red with subtle background
  - `cursor` → the current position gets a blinking cursor `|` before it
- Has a hidden `<input>` that captures all keystrokes (focused on mount, re-focused on click)
- Shows a subtle "Click to start typing" hint if the input loses focus
- Word-wrap friendly — characters flow naturally

### `<TafseerTooltip />`
- Wraps the `<AyahDisplay />` Arabic text and translation
- On hover (desktop) or tap (mobile) anywhere on the ayah display area → fetch and show tafseer
- Tooltip appears as a floating card below/beside the ayah
- Shows: tafseer text with a label "Tafseer — Al-Jalalayn"
- Has a close button (×)
- Max width 480px, scrollable if long
- Loading spinner while fetching
- Does NOT interrupt the typing area below

### `<ResultsBar />`
- Shown after completing an ayah (slides up with animation)
- Displays: WPM, Accuracy %, ✓ Ayah complete
- Two buttons: **"Next Ayah →"** and **"Retry ↺"**
- Subtle, doesn't take up full screen — bar at the bottom

### `<ThemeToggle />`
- Sun/Moon icon toggle
- Switches between dark and light theme
- Persists to localStorage

### `<Navbar />`
- Left: back arrow → returns to Home
- Center: Surah name in English + Ayah progress
- Right: `<ThemeToggle />`
- Minimal, slim, non-intrusive

---

## Styling & Design System

Apply these design principles throughout:

**Dark theme (default):**
```
Background:     #0f0f0f
Surface:        #1a1a1a
Border:         #2a2a2a
Text primary:   #e8e8e8
Text muted:     #6b6b6b
Accent:         #c9a96e  (warm gold — evokes Islamic aesthetics)
Correct:        #4ade80  (green)
Incorrect:      #f87171  (red)
Cursor:         #c9a96e  (gold blinking cursor)
```

**Light theme:**
```
Background:     #fafaf8
Surface:        #ffffff
Border:         #e5e5e5
Text primary:   #1a1a1a
Text muted:     #9a9a9a
Accent:         #8b6914
Correct:        #16a34a
Incorrect:      #dc2626
```

**Typography:**
- UI text: `Inter`, system font stack fallback
- Arabic text: `Amiri`, serif fallback
- Typing area font: `JetBrains Mono` or `Fira Code` — monospace for clean character rendering

**Motion:**
- Subtle fade-ins for page transitions
- Smooth color transitions on character status changes (100ms)
- ResultsBar slides up with a spring animation
- No flashy or distracting animations

**Layout:**
- Max content width: 780px, centered
- Generous vertical padding
- Mobile-first responsive

---

## Routing — `src/App.jsx`

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/surah/:surahId" element={<TypingPage />} />
  <Route path="/surah/:surahId/ayah/:ayahIndex" element={<TypingPage />} />
</Routes>
```

Deep-link support: navigating to `/surah/2/ayah/255` should load Al-Baqarah and jump to Ayat al-Kursi (verse 255).

---

## Keyboard Shortcuts

| Key         | Action                        |
|-------------|-------------------------------|
| `Tab`       | Retry current ayah            |
| `Enter`     | Next ayah (when complete)     |
| `Escape`    | Return to surah picker        |
| `Ctrl+T`    | Toggle tafseer panel          |

---

## Error States

Handle and display gracefully:
- API fetch failure → "Could not load this surah. Please check your connection and try again." with retry button
- Empty translation → skip that verse and auto-advance
- Last ayah of surah → ResultsBar shows "Surah Complete 🎉" with option to pick a new surah

---

## Performance Requirements

- Fetch all surah verses **once** per surah and cache in Zustand store — no re-fetching on ayah change
- Tafseer fetched **lazily** on hover, cached in `useTafseer` module-level Map
- Do not fetch tafseer on page load
- Typing input must have **zero perceptible lag** — no debouncing on keystrokes
- Surah list (114 items) should render without virtualization (small enough)

---

## What NOT to Build

- ❌ No user accounts or authentication
- ❌ No leaderboards or social features
- ❌ No countdown timers or time pressure
- ❌ No notifications or streaks
- ❌ No ads or external tracking scripts
- ❌ No audio recitation (keep scope clean)
- ❌ No mobile keyboard pop-up issues — handle gracefully but don't build a custom keyboard

---

## Build Order (follow this sequence)

1. **Scaffold** — Vite + React + Tailwind + Zustand + React Router setup
2. **`src/api/quran.js`** — all API functions, test each one with console.log
3. **`useQuranStore.js`** — full store with actions
4. **`useTypingEngine.js`** — full typing logic, test with a hardcoded string
5. **`textNormalizer.js`** — utility, apply to all translations
6. **`Home.jsx` + `SurahPicker.jsx`** — browseable surah list, routing
7. **`TypingPage.jsx` + `AyahDisplay.jsx`** — layout and Arabic display
8. **`TypingArea.jsx`** — wire up typing engine, render character spans
9. **`TafseerTooltip.jsx` + `useTafseer.js`** — hover/tap tafseer
10. **`ResultsBar.jsx`** — post-ayah stats and navigation
11. **`ThemeToggle.jsx`** — dark/light mode with localStorage persistence
12. **Polish** — transitions, keyboard shortcuts, error states, mobile responsiveness
13. **Final check** — test on mobile viewport, test all error states, verify API caching

---

## Final Notes for Claude Code

- Write **clean, well-commented code** — this project may be open-sourced
- Prefer **functional components and hooks** throughout — no class components
- Keep components **single-responsibility** — if a component does two things, split it
- Use **semantic HTML** where possible (`<main>`, `<nav>`, `<section>`, `<article>`)
- All user-facing strings should be in **English**
- The app must work on **Chrome, Firefox, Safari** and on **iOS Safari / Android Chrome**
- After scaffolding, run `npm run dev` and confirm the dev server starts before proceeding

---

*This prompt was generated as part of a product planning session. Build with intention — this app is meant to help people connect with the Quran deeply.*
