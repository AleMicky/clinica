# Clinica

Sistema de clínica en .NET 10 con arquitectura de **Monolito Modular**, **Clean Architecture ligera** y **DDD ligero**.

## Estructura

```
Clinica/
├── backend/          # Solución .NET
├── frontend/         # React (opcional, separado)
├── docker/           # Infraestructura local
└── docs/             # Documentación
```

## Requisitos

- .NET 10 SDK
- Docker (para SQL Server local)
- JetBrains Rider (recomendado)

## Inicio rápido

### 1. SQL Server

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Backend

```bash
cd backend
dotnet restore Clinica.sln
dotnet build Clinica.sln
dotnet run --project Clinica.Api
```

La API expone Swagger en desarrollo: `https://localhost:7xxx/swagger`

## Módulos

| Módulo     | Responsabilidad base                          |
|------------|-----------------------------------------------|
| Seguridad  | Autenticación, autorización, usuarios, roles  |
| Parametros | Configuración y catálogos del sistema         |
| Workflow   | Flujos de trabajo y estados de procesos       |

Cada módulo contiene las capas: **Domain**, **Application**, **Infrastructure**, **Presentation**.

## Referencias entre capas

```
Domain         → SharedKernel
Application    → Domain + SharedKernel
Infrastructure → Application + Domain + SharedKernel
Presentation   → Application + SharedKernel
Api            → Infrastructure + Presentation (por módulo)
```

## Próximos pasos

- Definir entidades de dominio por módulo
- Configurar DbContext y migraciones EF Core
- Implementar casos de uso y endpoints de negocio
- Integrar frontend React
