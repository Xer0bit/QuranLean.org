#!/usr/bin/env bash
# Deploy / update the QuranLearn API on the server over SSH.
#
# Usage:
#   SERVER_HOST=1.2.3.4 ./deploy/deploy.sh
#   # or set SERVER_HOST + SSH_USER + REMOTE_DIR below.
#
# Requires the SSH key at ignored/quran.pem (chmod 600).

set -euo pipefail

SSH_USER="${SSH_USER:-ubuntu}"
SERVER_HOST="${SERVER_HOST:?Set SERVER_HOST=<ip-or-hostname> (the box behind api.quranlearn.org)}"
REMOTE_DIR="${REMOTE_DIR:-/home/${SSH_USER}/LeanQuran.org}"
REPO_URL="${REPO_URL:-https://github.com/Xer0bit/LeanQuran.org.git}"
BRANCH="${BRANCH:-main}"

KEY="$(cd "$(dirname "$0")/.." && pwd)/ignored/quran.pem"
chmod 600 "$KEY" 2>/dev/null || true

SSH="ssh -i $KEY -o StrictHostKeyChecking=accept-new ${SSH_USER}@${SERVER_HOST}"

echo "==> Deploying to ${SSH_USER}@${SERVER_HOST}:${REMOTE_DIR}"

$SSH bash -s <<REMOTE
set -euo pipefail

# 1. Clone or update the repo
if [ ! -d "${REMOTE_DIR}/.git" ]; then
  git clone "${REPO_URL}" "${REMOTE_DIR}"
fi
cd "${REMOTE_DIR}"
git fetch origin "${BRANCH}"
git reset --hard "origin/${BRANCH}"

# 2. Backend deps
cd "${REMOTE_DIR}/server"
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

# 3. Ensure .env exists (do NOT overwrite an existing one)
if [ ! -f .env ]; then
  echo "!! ${REMOTE_DIR}/server/.env is missing — create it from .env.example before the service will work."
fi

# 4. Restart the service (must be installed once — see DEPLOY.md)
if systemctl list-unit-files | grep -q quranlearn-api.service; then
  sudo systemctl restart quranlearn-api
  sleep 2
  sudo systemctl --no-pager status quranlearn-api | head -n 6
else
  echo "!! quranlearn-api.service not installed yet. See DEPLOY.md step 3."
fi
REMOTE

echo "==> Done. Smoke test:"
echo "    curl -s https://api.quranlearn.org/health"
