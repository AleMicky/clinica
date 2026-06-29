#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/docker/.env"
COMPOSE_FILE="${ROOT_DIR}/docker/docker-compose.prod.yml"
GIT_BRANCH="${DEPLOY_BRANCH:-main}"

cd "${ROOT_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Falta docker/.env. Copia docker/.env.example y configura los valores:"
  echo "  cp docker/.env.example docker/.env"
  exit 1
fi

if [[ "${SKIP_GIT_PULL:-}" != "1" ]] && git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo ">> git pull origin ${GIT_BRANCH}"
  git pull --ff-only origin "${GIT_BRANCH}"
fi

echo ">> docker compose build"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" build --pull

echo ">> docker compose up -d"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d

echo ">> limpiar imágenes huérfanas"
docker image prune -f

echo ""
echo "Deploy completado."
