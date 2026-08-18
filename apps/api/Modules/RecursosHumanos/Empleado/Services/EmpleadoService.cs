using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Mappers;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using PersonaEntity = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Services;

public sealed class EmpleadoService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService
)
{
    public async Task<PagedResult<EmpleadoResponse>> ListarAsync(PaginationRequest pagination, string? search,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Empleados
            .Include(x => x.Persona)
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                (x.CodigoEmpleado != null &&
                 x.CodigoEmpleado.Contains(term)) ||
                x.Persona.Nombres.Contains(term) ||
                x.Persona.ApellidoPaterno.Contains(term) ||
                x.Persona.NumeroDocumento.Contains(term));
        }

        var totalItems =
            await query.CountAsync(cancellationToken);

        var empleados = await query
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.ApellidoMaterno)
            .ThenBy(x => x.Persona.Nombres)
            .Skip(
                (pagination.ValidPage - 1) *
                pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<EmpleadoResponse>(
            empleados
                .Select(MapToResponse)
                .ToList(),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<EmpleadoResponse> ObtenerAsync(int id, CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .Include(x => x.Persona)
                           .AsNoTracking()
                           .FirstOrDefaultAsync(
                               x => x.Id == id && x.Activo,
                               cancellationToken)
                       ?? throw new NotFoundException(
                           "Empleado",
                           id);

        return MapToResponse(empleado);
    }

    public async Task<List<EmpleadoBaseInfo>> EmpleadoBase(CancellationToken cancellationToken = default)
    {
        return await dbContext.Empleados
            .AsNoTracking()
            .Select(x => new EmpleadoBaseInfo
            {
                Id = x.Id,
                CodigoEmpleado = x.CodigoEmpleado,
                NombreCompleto =
                    x.Persona.Nombres + " " +
                    x.Persona.ApellidoPaterno + " " +
                    x.Persona.ApellidoMaterno
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<EmpleadoBaseInfo>> EmpleadosPermitidos(CancellationToken cancellationToken = default)
    {
        var usuarioId = currentUserService.UserId;

        if (usuarioId is null)
            throw new UnauthorizedAccessException();

        var query = dbContext.Empleados
            .AsNoTracking()
            .AsQueryable();

        if (!currentUserService.IsInRole("ADMINISTRADOR"))
        {
            var personaId = await dbContext.Users
                .Where(u => u.Id == usuarioId.Value)
                .Select(u => u.PersonaId)
                .FirstOrDefaultAsync(cancellationToken);

            query = query.Where(e =>
                e.PersonaId == personaId);
        }

        return await query
            .Select(e => new EmpleadoBaseInfo
            {
                Id = e.Id,
                CodigoEmpleado = e.CodigoEmpleado,
                NombreCompleto =
                    e.Persona.Nombres + " " +
                    e.Persona.ApellidoPaterno + " " +
                    (e.Persona.ApellidoMaterno ?? "")
            })
            .ToListAsync(cancellationToken);
    }


    public async Task<EmpleadoResponse> CrearAsync(CreateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarPersonaAsync(request.PersonaId, excludeId: null, cancellationToken);
        var empleado = EmpleadoMapper.ToEntity(request);
        empleado.Activo = true;
        await dbContext.Empleados.AddAsync(empleado, cancellationToken);
        // Primer guardado para obtener el Id
        await dbContext.SaveChangesAsync(cancellationToken);
        // Generar código definitivo
        empleado.CodigoEmpleado = GenerarCodigoEmpleado(empleado.Id);
        // Guardar el código generado
        await dbContext.SaveChangesAsync(cancellationToken);
        await dbContext.Entry(empleado)
            .Reference(x => x.Persona)
            .LoadAsync(cancellationToken);

        return MapToResponse(empleado);
    }

    public async Task<EmpleadoResponse> ActualizarAsync(
        int id,
        UpdateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .Include(x => x.Persona)
                           .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken)
                       ?? throw new NotFoundException("Empleado", id);

        await ValidarPersonaAsync(request.PersonaId, id, cancellationToken);
        EmpleadoMapper.UpdateEntity(request, empleado);
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToResponse(empleado);
    }

    public async Task EliminarAsync(int id, CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .FirstOrDefaultAsync(
                               x => x.Id == id,
                               cancellationToken)
                       ?? throw new NotFoundException(
                           "Empleado",
                           id);

        dbContext.Empleados.Remove(empleado);

        await dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task InactivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .FirstOrDefaultAsync(
                               x => x.Id == id,
                               cancellationToken)
                       ?? throw new NotFoundException(
                           "Empleado",
                           id);

        if (!empleado.Activo)
        {
            return;
        }

        empleado.Activo = false;

        await dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task ActivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .FirstOrDefaultAsync(
                               x => x.Id == id,
                               cancellationToken)
                       ?? throw new NotFoundException(
                           "Empleado",
                           id);

        if (empleado.Activo)
        {
            return;
        }

        empleado.Activo = true;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarPersonaAsync(
        int personaId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var existePersona = await dbContext
            .Set<PersonaEntity>()
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.Id == personaId &&
                    x.Activo,
                cancellationToken);

        if (!existePersona)
        {
            throw new NotFoundException(
                "Persona",
                personaId);
        }

        var query = dbContext.Empleados
            .AsNoTracking()
            .Where(x => x.PersonaId == personaId);

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        var yaEsEmpleado =
            await query.AnyAsync(cancellationToken);

        if (yaEsEmpleado)
        {
            throw new ConflictException(
                $"La persona '{personaId}' ya está registrada como empleado.");
        }
    }

    private static string GenerarCodigoEmpleado(int empleadoId)
    {
        return $"CQ-{empleadoId:D5}";
    }

    private static EmpleadoResponse MapToResponse(
        EmpleadoEntity entity)
    {
        var response =
            EmpleadoMapper.ToResponse(entity);

        return response with
        {
            Persona = new PersonaInfoResponse
            {
                Id = entity.Persona.Id,
                Nombres = entity.Persona.Nombres,
                ApellidoPaterno = entity.Persona.ApellidoPaterno,
                ApellidoMaterno = entity.Persona.ApellidoMaterno,
                FechaNacimiento = entity.Persona.FechaNacimiento,
                Telefono = entity.Persona.Telefono,
                Direccion = entity.Persona.Direccion,
                TipoDocumento = entity.Persona.TipoDocumento,
                NumeroDocumento = entity.Persona.NumeroDocumento,
                ExtensionDocumento = entity.Persona.ExtensionDocumento,
                ComplementoDocumento = entity.Persona.ComplementoDocumento,
                Genero = entity.Persona.Genero,
                EstadoCivil = entity.Persona.EstadoCivil
            }
        };
    }
}