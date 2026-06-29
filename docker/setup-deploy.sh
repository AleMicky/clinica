#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEY_FILE="${HOME}/.ssh/github_deploy"
PUB_KEY_FILE="${KEY_FILE}.pub"
REPO="AleMicky/clinica"

VPS_HOST="${VPS_HOST:-157.173.99.216}"
VPS_USER="${VPS_USER:-root}"
VPS_APP_PATH="${VPS_APP_PATH:-/root/clinica}"
SSH_PORT="${VPS_PORT:-22}"

red() { printf '\033[0;31m%s\033[0m\n' "$*"; }
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }

if [[ ! -f "${PUB_KEY_FILE}" || ! -f "${KEY_FILE}" ]]; then
  red "No se encontró ~/.ssh/github_deploy. Genera la clave primero:"
  echo "  ssh-keygen -t ed25519 -C github-deploy -f ~/.ssh/github_deploy -N \"\""
  exit 1
fi

echo "=== Configuración deploy automático Clinica ==="
echo "VPS: ${VPS_USER}@${VPS_HOST}:${SSH_PORT}"
echo "Ruta app: ${VPS_APP_PATH}"
echo ""

read -r -p "Usuario SSH del VPS [${VPS_USER}]: " input_user
VPS_USER="${input_user:-$VPS_USER}"

read -r -p "Ruta absoluta en el VPS [${VPS_APP_PATH}]: " input_path
VPS_APP_PATH="${input_path:-$VPS_APP_PATH}"

SSH_OPTS=(-i "${KEY_FILE}" -p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new)

echo ""
yellow ">> Paso 1/4: Copiar clave pública al VPS (pedirá contraseña SSH una vez)"
ssh-copy-id -i "${PUB_KEY_FILE}" -p "${SSH_PORT}" "${VPS_USER}@${VPS_HOST}"

echo ""
yellow ">> Paso 2/4: Probar conexión con la clave de deploy"
ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" "echo 'Conexión OK como' \$(whoami)"

echo ""
yellow ">> Paso 3/4: Preparar carpeta y .env en el VPS"
ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" bash -s <<EOF
set -euo pipefail
mkdir -p "${VPS_APP_PATH}/docker"
if [[ ! -f "${VPS_APP_PATH}/docker/.env" ]]; then
  echo "Crea docker/.env en el VPS en el primer deploy o manualmente."
fi
EOF

if [[ -f "${ROOT_DIR}/docker/.env" ]]; then
  read -r -p "¿Subir docker/.env local al VPS? [s/N]: " upload_env
  if [[ "${upload_env,,}" == "s" ]]; then
    scp -P "${SSH_PORT}" -i "${KEY_FILE}" "${ROOT_DIR}/docker/.env" "${VPS_USER}@${VPS_HOST}:${VPS_APP_PATH}/docker/.env"
    green "docker/.env subido al VPS."
  fi
else
  yellow "No hay docker/.env local. Créalo en el VPS antes del primer deploy."
fi

echo ""
yellow ">> Paso 4/4: Configurar secrets en GitHub"
if ! command -v gh >/dev/null 2>&1; then
  red "Instala GitHub CLI: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  yellow "Inicia sesión en GitHub (se abrirá el navegador)..."
  gh auth login -h github.com -p https -w -s repo,workflow,admin:repo_hook
fi

gh secret set VPS_HOST --body "${VPS_HOST}" --repo "${REPO}"
gh secret set VPS_USER --body "${VPS_USER}" --repo "${REPO}"
gh secret set VPS_SSH_KEY < "${KEY_FILE}" --repo "${REPO}"
gh secret set VPS_PORT --body "${SSH_PORT}" --repo "${REPO}"
gh secret set VPS_APP_PATH --body "${VPS_APP_PATH}" --repo "${REPO}"

echo ""
green "=== Listo ==="
echo "Secrets configurados en ${REPO}"
echo ""
echo "Si no subiste .env, conéctate al VPS y créalo:"
echo "  ssh -i ~/.ssh/github_deploy ${VPS_USER}@${VPS_HOST}"
echo "  nano ${VPS_APP_PATH}/docker/.env"
echo ""
echo "Haz push a main o ejecuta el workflow en GitHub Actions."
