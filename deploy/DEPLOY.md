# Deployment — quranlearn.org

Architecture:

```
quranlearn.org           →  Vercel (React build of quran-type/)
api.quranlearn.org       →  your server: nginx (443, TLS) → uvicorn (127.0.0.1:8000) → FastAPI + SQLite
```

The frontend talks to the API at `https://api.quranlearn.org` (set in
`quran-type/.env.production`). The server's `request.base_url` resolves to the
public HTTPS origin via uvicorn `--proxy-headers`, so Google OAuth callbacks
self-configure.

---

## A. Frontend (Vercel) — fixes the refresh 404

The `404: NOT_FOUND` on refresh happens because Vercel had no SPA fallback: a
hard refresh on `/surah/2` looked for a file that doesn't exist. Fixed by
[`quran-type/vercel.json`](../quran-type/vercel.json), which rewrites every
non-asset path to `index.html` so React Router handles it.

**Vercel project settings (do this once):**

| Setting | Value |
|---|---|
| Root Directory | `quran-type` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

`VITE_API_URL` is already baked in via `quran-type/.env.production`. (You can
also set it in Vercel → Settings → Environment Variables to override.)

Redeploy after merging, then refresh any deep link — no more 404.

---

## B. DNS

Point an **A record** for `api` at your server's public IP:

```
api.quranlearn.org   A   <server-public-ip>
```

(`quranlearn.org` / `www` stay pointed at Vercel per Vercel's domain setup.)

---

## C. Server (api.quranlearn.org) — one-time setup

SSH in with the key (`ignored/quran.pem`):

```bash
chmod 600 ignored/quran.pem
ssh -i ignored/quran.pem ubuntu@<server-public-ip>
```

### 1. System packages

```bash
sudo apt update
sudo apt install -y python3-venv nginx certbot python3-certbot-nginx git
```

### 2. Get the code + install deps

```bash
git clone https://github.com/Xer0bit/LeanQuran.org.git ~/LeanQuran.org
cd ~/LeanQuran.org/server
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/pip install "bcrypt==4.0.1"
```

### 3. Backend env

```bash
cp .env.example .env
nano .env
```

Set for production:

```ini
SECRET_KEY=<python3 -c "import secrets; print(secrets.token_urlsafe(48))">
FRONTEND_URL=https://quranlearn.org
GOOGLE_CLIENT_ID=...        # optional
GOOGLE_CLIENT_SECRET=...    # optional
```

### 4. systemd service

```bash
sudo cp ~/LeanQuran.org/deploy/quranlearn-api.service /etc/systemd/system/
# edit User / WorkingDirectory / paths inside if your user isn't "ubuntu"
sudo systemctl daemon-reload
sudo systemctl enable --now quranlearn-api
sudo systemctl status quranlearn-api          # should be "active (running)"
curl -s http://127.0.0.1:8000/health          # {"status":"ok"}
```

**Passwordless restart for CI** — so the GitHub Actions deploy can restart the
service without an interactive sudo password, allow just that one command:

```bash
echo "${USER} ALL=(ALL) NOPASSWD: /bin/systemctl restart quranlearn-api" \
  | sudo tee /etc/sudoers.d/quranlearn-api
sudo chmod 440 /etc/sudoers.d/quranlearn-api
```

### 5. nginx + TLS

```bash
sudo cp ~/LeanQuran.org/deploy/nginx-api.quranlearn.org.conf \
        /etc/nginx/sites-available/api.quranlearn.org
sudo ln -s /etc/nginx/sites-available/api.quranlearn.org /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.quranlearn.org    # issues + auto-renews TLS
```

Verify:

```bash
curl -s https://api.quranlearn.org/health      # {"status":"ok"}
```

### 6. Google OAuth redirect URI (if using Google sign-in)

In Google Cloud Console → your OAuth client → Authorized redirect URIs, add:

```
https://api.quranlearn.org/auth/google/callback
```

---

## D. Continuous deployment (GitHub Actions)

After the one-time setup above, every push to `main` that touches `server/**`
auto-deploys via [`.github/workflows/deploy-api.yml`](../.github/workflows/deploy-api.yml):
it SSHes in, pulls `main`, reinstalls deps, restarts the service, and smoke-tests
`/health`. (The frontend deploys independently via Vercel on push.)

**Add these repository secrets** (GitHub → Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `SERVER_HOST` | server public IP or hostname |
| `SERVER_USER` | SSH user (e.g. `ubuntu`) |
| `SSH_PRIVATE_KEY` | full contents of `ignored/quran.pem` |
| `SERVER_PORT` | *(optional)* SSH port, defaults to `22` |
| `REMOTE_DIR` | *(optional)* checkout path, defaults to `/home/<user>/LeanQuran.org` |

To paste the key contents:

```bash
cat ignored/quran.pem        # copy everything incl. the BEGIN/END lines
```

You can also trigger a deploy manually from the **Actions** tab → *Deploy API* →
*Run workflow*.

### Manual fallback (no CI)

```bash
SERVER_HOST=<server-public-ip> ./deploy/deploy.sh
```

---

## E. Admin panel in production

`https://api.quranlearn.org/admin` — default seeded login is
`admin@tarteel.type` / `admin123`. **Change it immediately** (edit the seed in
`server/main.py` or update the row in the DB).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Refresh still 404s on Vercel | Confirm Root Directory = `quran-type` and `vercel.json` is deployed; redeploy |
| Frontend calls go to quranlearn.org and 404 | `VITE_API_URL` not baked in — confirm `.env.production` committed, rebuild |
| CORS error in console | Set `FRONTEND_URL=https://quranlearn.org` in server `.env`, restart service |
| Google login redirects to `http://` / fails | Service must run with `--proxy-headers` (it does in the unit); add the prod redirect URI in Google Console |
| `bcrypt` error on start | `./venv/bin/pip install "bcrypt==4.0.1"` |
| 502 from nginx | uvicorn not running — `sudo systemctl status quranlearn-api`, `journalctl -u quranlearn-api -f` |
