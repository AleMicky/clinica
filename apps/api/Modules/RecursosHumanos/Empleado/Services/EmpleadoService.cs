using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Services;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using EmpleadoEntity =
    Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using PersonaEntity =
    Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Services;

public sealed class EmpleadoService(
    AppDbContext dbContext,
    AsignacionEmpleadoService asignacionEmpleadoService
)
{
    public async Task<PagedResult<EmpleadoResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
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

    public async Task<EmpleadoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
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

    public async Task<EmpleadoResponse> CrearAsync(
        CreateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarPersonaAsync(
            request.PersonaId,
            excludeId: null,
            cancellationToken);

        await ValidarCodigoAsync(
            request.CodigoEmpleado,
            excludeId: null,
            cancellationToken);

        var empleado = EmpleadoMapper.ToEntity(request);
        empleado.CodigoEmpleado = request.CodigoEmpleado.TrimUpperOrNull();
        empleado.Activo = true;

        await dbContext.Empleados.AddAsync(
            empleado,
            cancellationToken);

        await dbContext.SaveChangesAsync(
            cancellationToken);

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
        await ValidarCodigoAsync(request.CodigoEmpleado, id, cancellationToken);
        EmpleadoMapper.UpdateEntity(request, empleado);

        empleado.CodigoEmpleado = request.CodigoEmpleado.TrimUpperOrNull();
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

        await dbContext.SaveChangesAsync(
            cancellationToken);
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

    private async Task ValidarCodigoAsync(
        string? codigo,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var codigoNormalizado = codigo.TrimUpperOrNull();

        if (codigoNormalizado is null)
        {
            return;
        }

        var query = dbContext.Empleados
            .AsNoTracking()
            .Where(x =>
                x.CodigoEmpleado == codigoNormalizado);

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        var existe = await query.AnyAsync(cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un empleado con el código '{codigoNormalizado}'.");
        }
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