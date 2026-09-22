using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Medico.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using MedicoEntity = Clinica.Api.Modules.RecursosHumanos.Medico.Entity.Medico;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using MedicoEspecialidadEntity = Clinica.Api.Modules.RecursosHumanos.Medico.Entity.MedicoEspecialidad;
using EspecialidadEntity = Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity.Especialidad;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Services;

public sealed class MedicoService(AppDbContext dbContext)
{
    public async Task<PagedResult<MedicoResponse>> ListarAsync(
        int? empleadoId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (empleadoId.HasValue)
            query = query.Where(x => x.EmpleadoId == empleadoId.Value);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.MatriculaProfesional.Contains(normalizedSearch) ||
                (x.RegistroMinisterioSalud != null &&
                 x.RegistroMinisterioSalud.Contains(normalizedSearch)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.MatriculaProfesional)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<MedicoResponse>(
            entities.Select(MapToResponse).ToList(),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<MedicoResponse> ObtenerAsync(
        int medicoId,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == medicoId && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("Medico", medicoId);

        return MapToResponse(entity);
    }

    public async Task<MedicoResponse> CrearAsync(
        CreateMedicoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);

        var matricula = NormalizarMatricula(request.MatriculaProfesional);

        var existe = await dbContext.Set<MedicoEntity>().AnyAsync(
            x => x.MatriculaProfesional == matricula,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un médico con la matrícula profesional '{matricula}'.");
        }

        var entity = MedicoMapper.ToEntity(request);
        entity.EmpleadoId = request.EmpleadoId;
        entity.MatriculaProfesional = matricula;
        entity.RegistroMinisterioSalud = Limpiar(request.RegistroMinisterioSalud);
        entity.Activo = true;

        if (request.Especialidades is { Count: > 0 })
        {
            var distinctEspecialidadIds = request.Especialidades.Select(e => e.EspecialidadId).Distinct().ToList();
            var validEspecialidades = await dbContext.Set<EspecialidadEntity>()
                .Where(e => distinctEspecialidadIds.Contains(e.Id) && e.Activo)
                .Select(e => e.Id)
                .ToListAsync(cancellationToken);

            var seen = new HashSet<int>();
            foreach (var item in request.Especialidades)
            {
                if (!validEspecialidades.Contains(item.EspecialidadId) || !seen.Add(item.EspecialidadId))
                    continue;

                entity.Especialidades.Add(new MedicoEspecialidadEntity
                {
                    EspecialidadId = item.EspecialidadId,
                    EsPrincipal = item.EsPrincipal,
                    Activo = true
                });
            }
        }

        await dbContext.Set<MedicoEntity>().AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        await LoadRelationsAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<MedicoResponse> ActualizarAsync(
        int medicoId,
        UpdateMedicoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);

        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == medicoId && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("Medico", medicoId);

        var matricula = NormalizarMatricula(request.MatriculaProfesional);

        var existe = await dbContext.Set<MedicoEntity>().AnyAsync(
            x => x.Id != medicoId &&
                 x.MatriculaProfesional == matricula,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otro médico con la matrícula profesional '{matricula}'.");
        }

        entity.EmpleadoId = request.EmpleadoId;
        entity.MatriculaProfesional = matricula;
        entity.RegistroMinisterioSalud = Limpiar(request.RegistroMinisterioSalud);

        if (request.Especialidades is not null)
        {
            var distinctItems = request.Especialidades
                .GroupBy(e => e.EspecialidadId)
                .Select(g => g.First())
                .ToList();

            var requestedIds = distinctItems.Select(x => x.EspecialidadId).ToList();

            var validEspecialidadIds = await dbContext.Set<EspecialidadEntity>()
                .Where(e => requestedIds.Contains(e.Id) && e.Activo)
                .Select(e => e.Id)
                .ToListAsync(cancellationToken);

            var existingItems = await dbContext.Set<MedicoEspecialidadEntity>()
                .Where(x => x.MedicoId == medicoId)
                .ToListAsync(cancellationToken);

            var existingMap = existingItems.ToDictionary(x => x.EspecialidadId);

            foreach (var existing in existingItems)
            {
                if (!requestedIds.Contains(existing.EspecialidadId))
                {
                    existing.Activo = false;
                }
            }

            foreach (var item in distinctItems)
            {
                if (!validEspecialidadIds.Contains(item.EspecialidadId))
                    continue;

                if (existingMap.TryGetValue(item.EspecialidadId, out var existing))
                {
                    existing.Activo = true;
                    existing.EsPrincipal = item.EsPrincipal;
                }
                else
                {
                    dbContext.Set<MedicoEspecialidadEntity>().Add(new MedicoEspecialidadEntity
                    {
                        MedicoId = medicoId,
                        EspecialidadId = item.EspecialidadId,
                        EsPrincipal = item.EsPrincipal,
                        Activo = true
                    });
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        await LoadRelationsAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task EliminarAsync(
        int medicoId,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<MedicoEntity>()
            .FirstOrDefaultAsync(
                x => x.Id == medicoId && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("Medico", medicoId);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<MedicoEntity> BuildQuery()
    {
        return dbContext.Set<MedicoEntity>()
            .Include(x => x.Empleado)
                .ThenInclude(e => e.Persona)
            .Include(x => x.Especialidades.Where(e => e.Activo))
                .ThenInclude(e => e.Especialidad);
    }

    private async Task EnsureEmpleadoExistsAsync(
        int empleadoId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Set<EmpleadoEntity>()
            .AnyAsync(
                x => x.Id == empleadoId && x.Activo,
                cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(EmpleadoEntity), empleadoId);
    }

    private async Task LoadRelationsAsync(
        MedicoEntity entity,
        CancellationToken cancellationToken)
    {
        if (entity.Empleado is null)
        {
            await dbContext.Entry(entity)
                .Reference(x => x.Empleado)
                .LoadAsync(cancellationToken);
        }

        if (entity.Empleado?.Persona is null && entity.Empleado is not null)
        {
            await dbContext.Entry(entity.Empleado)
                .Reference(x => x.Persona)
                .LoadAsync(cancellationToken);
        }

        await dbContext.Entry(entity)
            .Collection(x => x.Especialidades)
            .Query()
            .Where(e => e.Activo)
            .Include(e => e.Especialidad)
            .LoadAsync(cancellationToken);
    }

    private static MedicoResponse MapToResponse(MedicoEntity entity)
    {
        return new MedicoResponse
        {
            Id = entity.Id,
            EmpleadoId = entity.EmpleadoId,
            Empleado = MapEmpleadoInfo(entity.Empleado),
            MatriculaProfesional = entity.MatriculaProfesional,
            RegistroMinisterioSalud = entity.RegistroMinisterioSalud,
            Especialidades = entity.Especialidades
                .Where(e => e.Activo)
                .Select(e => new MedicoEspecialidadResponse
                {
                    Id = e.Id,
                    MedicoId = e.MedicoId,
                    EspecialidadId = e.EspecialidadId,
                    Especialidad = e.Especialidad != null
                        ? new EspecialidadInfo
                        {
                            Id = e.Especialidad.Id,
                            Codigo = e.Especialidad.Codigo,
                            Nombre = e.Especialidad.Nombre
                        }
                        : null,
                    EsPrincipal = e.EsPrincipal,
                    Activo = e.Activo,
                    FechaCreacion = e.FechaCreacion,
                    FechaModificacion = e.FechaModificacion,
                    CreadoPor = e.CreadoPor,
                    ModificadoPor = e.ModificadoPor
                })
                .ToList(),
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static EmpleadoInfo? MapEmpleadoInfo(EmpleadoEntity? empleado)
    {
        if (empleado is null)
            return null;

        var nombreCompleto = string.Join(" ",
            new[]
            {
                empleado.Persona?.Nombres,
                empleado.Persona?.ApellidoPaterno,
                empleado.Persona?.ApellidoMaterno
            }.Where(x => !string.IsNullOrWhiteSpace(x)));

        return new EmpleadoInfo
        {
            Id = empleado.Id,
            CodigoEmpleado = empleado.CodigoEmpleado,
            NombreCompleto = nombreCompleto,
            Persona = MapPersonaInfo(empleado.Persona)
        };
    }

    private static PersonaInfo? MapPersonaInfo(
        Clinica.Api.Modules.Seguridad.Personas.Entity.Persona? persona)
    {
        if (persona is null)
            return null;

        return new PersonaInfo
        {
            Id = persona.Id,
            Nombres = persona.Nombres,
            ApellidoPaterno = persona.ApellidoPaterno,
            ApellidoMaterno = persona.ApellidoMaterno
        };
    }

    private static string NormalizarMatricula(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}