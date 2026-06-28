# Frontend React

Aplicación React desacoplada del backend Clinica.

## Requisitos

- Node.js 20+
- pnpm
- Backend API en ejecución (`http://localhost:5207`)

## Configuración

Copie las variables de entorno:

```bash
cp .env.example .env.development
```

Credenciales de prueba (seed del backend):

- Usuario: `admin`
- Contraseña: `Admin@2026!`

## Desarrollo

```bash
pnpm install
pnpm dev
```

La app estará en `http://localhost:5173`. Las peticiones a `/api` se proxyan al backend en desarrollo.

## Build

```bash
pnpm build
```
