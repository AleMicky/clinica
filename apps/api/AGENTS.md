# Clinica API — notas para agentes

Web API en .NET 10 ASP.NET Core. El monorepo está un nivel arriba (`../`, raíz del repo), con este servicio en `apps/api` y un frontend Next.js en `apps/web` (la web tiene su propio `AGENTS.md`). Este archivo cubre solo la API.

## Ejecución / dev

- SQL Server corre en un contenedor Docker, no local. Desde la raíz del repo: `docker compose up -d sqlserver` (usa `.env` para `SQLSERVER_PORT` + `SQLSERVER_PASSWORD`; primero copia `.env.example` a `.env`).
- La cadena de conexión dev y el secreto JWT están en `appsettings.Development.json` (commiteados). La contraseña `sa` ahí **debe coincidir** con `SQLSERVER_PASSWORD` del `.env` en la raíz del repo, o el arranque y el seeding fallan.
- `dotnet run` sirve http://localhost:5011 (https://localhost:7057 en el perfil `https`). Solo dev: doc OpenAPI en `/openapi/v1.json`, UI Scalar en `/scalar/v1` (el prefijo de rutas es `/api/v1`, ver `Shared/Constants/ApiRoutes.cs`).
- En cada arranque `Program.cs` ejecuta `IdentitySeed.SeedAsync` y `CatalogoSeedAsync` (`Data/Seed/`). El seeding es idempotente, pero depende de que existan las tablas — primero corre migraciones/`db update` en un contenedor nuevo.

## EF / migraciones

- Code-first EF Core, provider SQL Server. `AppDbContext` (`Data/AppDbContext.cs`) es un `IdentityDbContext<Usuario, Rol, int>`; las tablas de Identity se renombran al español (`Usuarios`, `Roles`, `UsuariosRoles`, etc.).
- Las migraciones viven en `Migrations/` del nivel superior (namespace `Clinica.Api.Migrations`). La carpeta `Data/Migrations/` está vacía — no pongas migraciones ahí. Créalas con `dotnet ef migrations add <Nombre>` desde `apps/api` (el paquete `EntityFrameworkCore.Design` está configurado para el CLI).
- `AppDbContext.OnModelCreating` llama a `ApplyConfigurationsFromAssembly` — las configs de `Data/Configurations/` y `Shared/Persistence/` se aplican automáticamente. Agrega los `IEntityTypeConfiguration<>` de nuevas entidades ahí; no edites el model snapshot a mano.
- Un `AuditSaveChangesInterceptor` (registrado como scoped, adjuntado en `AddDbContext`) setea las columnas de auditoría en entidades que derivan de `Shared/Abstractions/AuditableEntity.cs`. No setees `CreatedAt`/`UpdatedAt` manualmente en el código de servicios.

## Convenciones de arquitectura

- Modular por área de feature. Cada módulo vive en `Modules/<Area>/<Feature>/` con la misma estructura: `Entity/`, `Dtos/`, `Services/`, `Endpoints/`, opcionalmente `Mappers/`. Conecta los módulos nuevos en `Modules/ModuleExtensions.cs` (`AddModules` + `MapModules`) — no hay autodescubrimiento.
- Todos los endpoints se agrupan bajo `/api/v1` (ver `ApiRoutes.Prefix`); los métodos de extensión `Map*Endpoints` por módulo añaden las subrutas.
- Los servicios transversales (problem details, `GlobalExceptionHandler`, `ICurrentUserService`, interceptor de auditoría) viven en `Shared/` y se registran vía `Shared/Extensions/SharedExtensions.cs` (`AddShared` / `UseShared`). `UseShared` debe correr antes de añadir el middleware de auth/migraciones — respeta el orden actual de `Program.cs`.
- El mapeo DTO ↔ entidad usa **Riok.Mapperly** (`[Mapper] static partial class`), generado al compilar. Edita las declaraciones partial, no los cuerpos generados.
- Hay helpers genéricos de CRUD + paginación en `Shared/Crud/` y `Shared/Pagination/` — prefierelos a reimplementar por feature.

## Comandos

- Build / typecheck: `dotnet build` (el proyecto es `Clinica.Api.csproj`; no hay archivo de solución).
- Run: `dotnet run` (desde `apps/api`).
- Aplicar migraciones a la BD dev: `dotnet ef database update`.
- No hay proyecto de tests en este repo todavía.