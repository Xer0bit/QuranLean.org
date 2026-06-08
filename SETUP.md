# Setup Guide — QuranLearn.org

This walks you through running QuranLearn locally from a fresh clone, plus
optional Google OAuth and deployment notes.

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 18 or newer | `node -v` |
| npm | 9 or newer | `npm -v` |
| Python | 3.10 or newer | `python3 --version` |
| pip | latest | `pip --version` |

No external database is required — the backend uses SQLite (a single file,
`server/tarteel_type.db`, created automatically).

---

## 1. Clone

```bash
git clone https://github.com/xer0bit/quranlearn.git
cd quranlearn
```

The repo has two apps side by side:

- `server/` — FastAPI backend (auth, progress, admin)
- `quran-type/` — React frontend

You'll run them in **two terminals**.

---

## 2. Backend (FastAPI)

### 2.1 Create a virtual environment

```bash
cd server
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 2.2 Install dependencies

```bash
pip install -r requirements.txt
pip install "bcrypt==4.0.1"
```

> **Why pin bcrypt?** `passlib` (used for password hashing) doesn't yet support
> bcrypt 5.x — its backend detection throws on startup. `bcrypt==4.0.1` is the
> last fully compatible release. If you ever see a `password cannot be longer
> than 72 bytes` or `module 'bcrypt' has no attribute '__about__'` error, this
> is the fix.

### 2.3 Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```ini
# A long random string — used to sign JWTs. Generate one with:
#   python3 -c "import secrets; print(secrets.token_urlsafe(48))"
SECRET_KEY=replace-me

# Leave the Google values as-is unless you set up OAuth (section 5).
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend origin allowed by CORS.
FRONTEND_URL=http://localhost:5173
```

### 2.4 Run

```bash
uvicorn main:app --reload --port 8000
```

- API: <http://localhost:8000>
- Interactive docs (Swagger): <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>

On first launch the backend creates the database and seeds a default admin
(see section 4).

---

## 3. Frontend (React + Vite)

In a **second terminal**:

```bash
cd quran-type
npm install
npm run dev
```

Open <http://localhost:5173>.

Vite's dev server proxies `/auth`, `/api`, and `/admin` to the backend on
`:8000` (see `quran-type/vite.config.js`), so the frontend uses relative URLs
and you don't need any CORS configuration during development.

> If port 5173 is taken, Vite will pick 5174 — that origin is already allowed
> by the backend's CORS list.

---

## 4. Admin Panel

A default admin account is created automatically on first backend startup:

| Field | Value |
|---|---|
| URL | <http://localhost:8000/admin> |
| Email | `admin@tarteel.type` |
| Password | `admin123` |

From the panel you can view aggregate stats, list/edit/delete users, and inspect
individual typing sessions.

> 🔐 **Change the default credentials before deploying anywhere public.** Either
> edit the seed block in `server/main.py` or update the user via the API/DB.

---

## 5. Google OAuth (optional)

Skip this if you only want email/password sign-in.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (type: *Web application*).
3. Add an **Authorized redirect URI**:
   ```
   http://localhost:8000/auth/google/callback
   ```
4. Copy the **Client ID** and **Client Secret** into `server/.env`:
   ```ini
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxxxxx
   ```
5. Restart the backend. The **Sign in with Google** button will now work.

For production, add your live callback URL (e.g.
`https://api.yourdomain.com/auth/google/callback`) to the same OAuth client.

---

## 6. Production Build

### Frontend

```bash
cd quran-type
# Point the app at your deployed API (omit to use same-origin / proxy):
VITE_API_URL=https://api.yourdomain.com npm run build
npm run preview        # optional: smoke-test the build at http://localhost:4173
```

Deploy the contents of `quran-type/dist/` to any static host (Netlify, Vercel,
Cloudflare Pages, Nginx, …).

### Backend

```bash
cd server
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
# Or behind a process manager / gunicorn with uvicorn workers:
#   gunicorn main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

Set on the server:

- `SECRET_KEY` — strong random value
- `FRONTEND_URL` — your deployed frontend origin (for CORS)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — if using OAuth

> SQLite is fine for small/medium traffic. For higher concurrency, point
> SQLAlchemy at PostgreSQL by changing the connection string in
> `server/database.py`.

---

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| Backend crashes on start with a `bcrypt` error | `pip install "bcrypt==4.0.1"` (section 2.2) |
| `401 / Not authenticated` everywhere | Expected when logged out; sign in or it's a missing/expired token |
| Frontend loads but no surahs | Backend down, or no internet (Quran data is fetched live from QuranCDN) |
| Tafseer/translation empty | QuranCDN API hiccup — refresh; data is cached per surah after first load |
| CORS errors in console | Make sure `FRONTEND_URL` in `.env` matches your frontend origin |
| Vite uses port 5174 | Normal if 5173 is busy; that origin is allowed |

---

## 8. Useful Commands

```bash
# Frontend
npm run dev          # dev server with HMR
npm run build        # production build → dist/
npm run preview      # serve the production build
npm run lint         # eslint

# Backend (with venv active)
uvicorn main:app --reload --port 8000     # dev with auto-reload
```

---

Questions or issues? Open one on the [GitHub repo](https://github.com/xer0bit). ❤️
