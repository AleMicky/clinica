# Sistema de Gestión Clínica (HIS / ERP)

Monorepo del sistema integral de gestión hospitalaria y clínica, compuesto por una API modular en **.NET 10** y una aplicación web en **Next.js 16**.

## 📁 Estructura del Monorepo

```text
├── apps/
│   ├── api/                 # Backend ASP.NET Core (.NET 10, EF Core, SQL Server)
│   │   ├── Data/            # DbContext, configuraciones EF Core y Seeds
│   │   ├── Migrations/      # Migraciones Code-First de base de datos
│   │   ├── Modules/         # Módulos de dominio (Vertical Slices)
│   │   └── Shared/          # Infraestructura transversal (CRUD, Paginación, JWT, Excel/PDF)
│   └── web/                 # Frontend Next.js 16 (React 19, Tailwind v4, TanStack Query)
│       └── src/
│           ├── app/         # App Router (rutas agrupadas en auth y dashboard)
│           ├── components/  # Componentes UI (shadcn), layout y compartidos
│           ├── lib/         # Clientes HTTP, SignalR, React Query y utilidades
│           ├── modules/     # Módulos de dominio simétricos al backend
│           └── providers/   # Providers de autenticación, tema y notificaciones
├── compose.yml              # Entorno Docker de desarrollo
├── compose.prod.yml         # Entorno Docker de producción
├── deploy.sh                # Script de despliegue
└── clinica.sln              # Solución de Visual Studio
```

## 🚀 Requisitos Previos

- **Docker** y **Docker Compose** (para SQL Server 2022)
- **.NET 10 SDK**
- **Bun** (v1.3+) o **Node.js** (v20+)

## 🛠️ Puesta en Marcha (Desarrollo)

### 1. Base de Datos (SQL Server)

1. Copia el archivo de variables de entorno en la raíz:
   ```bash
   cp .env.example .env
   ```
2. Asegúrate de que `SQLSERVER_PASSWORD` en `.env` coincida con la contraseña configurada en `apps/api/appsettings.Development.json`.
3. Levanta el contenedor de SQL Server:
   ```bash
   docker compose up -d sqlserver
   ```

### 2. Backend (`apps/api`)

```bash
cd apps/api
dotnet ef database update
dotnet run
```
- **API Base URL**: `http://localhost:5011/api/v1`
- **Documentación Scalar UI**: `http://localhost:5011/scalar/v1`

### 3. Frontend (`apps/web`)

```bash
cd apps/web
bun install
bun dev
```
- **Web App**: `http://localhost:3000`

## 📦 Módulos del Dominio

| Módulo | Descripción |
| :--- | :--- |
| **Recepción** | Admisión de pacientes, directorio y fichas clínicas |
| **Servicios** | Catálogo de prestaciones, tarifarios y convenios/seguros |
| **Quirófano** | Programación de cirugías, equipo médico y gasto quirúrgico |
| **Farmacia** | Dispensación de medicamentos y control de recetas |
| **Almacenes** | Inventario, lotes/partidas, kardex, transferencias, ajustes y bajas |
| **Compras** | Proveedores, solicitudes, cotizaciones, órdenes y recepciones |
| **Ventas** | Punto de venta, facturación, distribución de pagadores y reportes |
| **Cajas** | Turnos de caja, cobros, devoluciones, movimientos y arqueos |
| **Recursos Humanos** | Empleados, médicos, especialidades, áreas y cargos |
| **Parámetros** | Catálogos maestros, monedas, tipos de cambio, bancos y métodos de pago |
| **Seguridad** | Usuarios, roles, menús dinámicos y autenticación JWT |
| **Notificaciones** | Alertas y avisos en tiempo real mediante SignalR |

