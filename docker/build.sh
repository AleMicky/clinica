#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/docker/.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Falta docker/.env. Copia docker/.env.example y configura los valores:"
  echo "  cp docker/.env.example docker/.env"
  exit 1
fi

cd "${ROOT_DIR}"

docker compose -f docker/docker-compose.prod.yml --env-file docker/.env build "$@"

echo ""
echo "Imágenes listas: clinica-api:latest, clinica-frontend:latest"
echo "Para levantar el stack:"
echo "  docker compose -f docker/docker-compose.prod.yml --env-file docker/.env up -d"
