#!/usr/bin/env bash
set -e

echo "============================================="
echo "🚀 Iniciando despliegue de Clínica en VPS"
echo "============================================="

# 1. Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró el archivo .env. Creando uno basado en .env.prod.example..."
    cp .env.prod.example .env
    echo "📌 POR FAVOR EDITA EL ARCHIVO .env CON TUS CREDENCIALES ANTES DE CONTINUAR."
fi

# 2. Construir y levantar servicios con Compose de producción
echo "📦 Construyendo y levantando contenedores en segundo plano..."
docker compose -f compose.prod.yml up -d --build

# 3. Mostrar estado
echo ""
echo "✅ Despliegue completado con éxito."
echo "============================================="
echo "📊 Estado de los contenedores:"
docker compose -f compose.prod.yml ps
echo "============================================="
