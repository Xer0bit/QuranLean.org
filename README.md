<div align="center">

# QuranLearn.org

**Type · Reflect · Understand**

A free, open-source [Monkeytype](https://monkeytype.com)-style typing trainer for the Quran.
Read each ayah in Arabic, type its English translation, and learn the meaning as you go —
with Ibn Kathir's tafseer one hover away.

`ق`

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-c9a96e)

</div>

---

## ✨ Features

- **Typing engine** — live per-character feedback (green = correct, red = wrong), WPM & accuracy, backspace, `Tab` to retry.
- **All 114 surahs** — Arabic (Uthmani), Saheeh International translation, and Ibn Kathir tafseer, fetched in one batched call per surah and cached.
- **Tafseer on hover** — read the classical commentary for any ayah without leaving the page.
- **Keyboard-first navigation** — `Enter` to advance to the next ayah, `Esc` to return to the surah list.
- **Skip & jump** — step between ayahs or type an ayah number to jump directly.
- **Resume where you left off** — your last position is saved automatically (locally for guests, server-side once you sign in) and surfaced as a **Continue** card on the home screen.
- **Accounts** — email/password and Google OAuth sign-in to sync progress across devices.
- **Admin panel** — manage users and inspect typing sessions at `/admin`.
- **Light & dark themes** with a warm-gold accent.

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 3, Zustand, React Router 7 |
| Backend | FastAPI, SQLAlchemy 2, SQLite |
| Auth | JWT (python-jose), bcrypt (passlib), Google OAuth |
| Quran data | [Quran.com / QuranCDN API v4](https://api-docs.quran.com) |

## 📂 Project Structure

```
qurantype/
├── quran-type/            # React + Vite frontend
│   ├── src/
│   │   ├── api/quran.js          # QuranCDN API client (verses + translation + tafseer)
│   │   ├── components/           # Logo, TypingArea, AyahNavigator, TafseerTooltip, ...
│   │   ├── hooks/useTypingEngine.js
│   │   ├── pages/                # Home, TypingPage, AuthCallback
│   │   ├── store/                # Zustand stores (quran + auth)
│   │   └── utils/                # textNormalizer, lastSession
│   └── vite.config.js     # dev proxy → backend on :8000
└── server/                # FastAPI backend
    ├── main.py            # app entry, CORS, admin seed
    ├── database.py        # SQLAlchemy models: User, TypingSession, Progress
    ├── auth.py            # JWT + bcrypt helpers, auth dependencies
    ├── routes/            # auth, progress, admin
    ├── static/admin.html  # standalone admin SPA
    └── requirements.txt
```

## 🚀 Quick Start

> Full step-by-step instructions (including Google OAuth) are in **[SETUP.md](SETUP.md)**.

You'll need **Node 18+** and **Python 3.10+**.

### 1. Backend

```bash
cd server
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pip install "bcrypt==4.0.1"          # passlib needs bcrypt 4.x, not 5.x
cp .env.example .env                 # then edit SECRET_KEY etc.
uvicorn main:app --reload --port 8000
```

API runs at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd quran-type
npm install
npm run dev
```

App runs at `http://localhost:5173` (Vite proxies `/auth`, `/api`, `/admin` to the backend).

### 3. Sign in to the admin panel

A default admin is seeded on first run:

| | |
|---|---|
| URL | `http://localhost:8000/admin` |
| Email | `admin@tarteel.type` |
| Password | `admin123` |

> ⚠️ Change these immediately for any non-local deployment.

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register with email/password |
| `POST` | `/auth/login` | Log in, returns JWT |
| `GET`  | `/auth/me` | Current user (Bearer token) |
| `GET`  | `/auth/google` | Start Google OAuth flow |
| `GET`  | `/auth/google/callback` | OAuth redirect target |
| `POST` | `/api/session` | Save a completed typing session |
| `GET`  | `/api/progress` | Per-surah progress |
| `GET`  | `/api/stats` | Aggregate stats (WPM, accuracy, totals) |
| `GET`  | `/admin/stats` | Admin dashboard metrics |
| `GET/PATCH/DELETE` | `/admin/users/{id}` | Manage users |
| `GET`  | `/admin/sessions` | Inspect typing sessions |

## 🏗️ Production Build

```bash
cd quran-type
npm run build         # outputs static assets to dist/
npm run preview       # preview the production build locally
```

Serve `dist/` from any static host and point it at your deployed FastAPI backend
(set `VITE_API_URL` at build time, and `FRONTEND_URL` on the server for CORS).

## 🤝 Contributing

This is a free community project — issues and PRs are welcome. Please keep the
codebase consistent with the existing style (no formatter config is enforced;
match the surrounding code).

## 🙏 Credits

- Quran text, translation & tafseer: [Quran.com / QuranCDN](https://quran.com)
- Translation: Saheeh International · Tafseer: Ibn Kathir
- Built and maintained by **[xer0bit](https://github.com/xer0bit)**

## 📜 License

[MIT](LICENSE) — free to use, modify, and share. Made for the sake of learning. ❤️
