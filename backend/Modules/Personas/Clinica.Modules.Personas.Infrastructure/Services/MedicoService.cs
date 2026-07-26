using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Medicos;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Personas.Infrastructure.Services;

public sealed class MedicoService(
    PersonasDbContext context
) : IMedicoService
{
    public Task<PagedResult<MedicoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new MedicoPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<MedicoResponse>> GetPagedAsync(
        MedicoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query =
            from medico in context.Medicos.AsNoTracking()
            join empleado in context.Set<Empleado>().AsNoTracking()
                on medico.EmpleadoId equals empleado.Id
            join persona in context.Personas.AsNoTracking()
                on empleado.PersonaId equals persona.Id
            select new { Medico = medico, Empleado = empleado, Persona = persona };

        if (request.EmpleadoId is { } empleadoId && empleadoId != Guid.Empty)
            query = query.Where(x => x.Medico.EmpleadoId == empleadoId);

        if (request.EspecialidadId is { } especialidadId && especialidadId != Guid.Empty)
        {
            query = query.Where(x =>
                x.Medico.Especialidades.Any(e => e.EspecialidadId == especialidadId));
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Medico.MatriculaProfesional.Contains(search) ||
                (x.Medico.RegistroColegioMedico != null &&
                 x.Medico.RegistroColegioMedico.Contains(search)) ||
                x.Empleado.CodigoEmpleado.Contains(search) ||
                x.Persona.Nombres.Contains(search) ||
                x.Persona.ApellidoPaterno.Contains(search) ||
                x.Persona.ApellidoMaterno.Contains(search) ||
                x.Medico.Especialidades.Any(e => e.Especialidad.Nombre.Contains(search)));
        }

        var paged = await query
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.Nombres)
            .Select(x => new MedicoListItem(
                x.Medico.Id,
                x.Empleado.CodigoEmpleado,
                x.Persona.Nombres,
                x.Persona.ApellidoPaterno,
                x.Persona.ApellidoMaterno))
            .ToPagedResultAsync(request, cancellationToken);

        var medicos = await LoadMedicosByIdsAsync(
            paged.Items.Select(x => x.Id).ToList(),
            cancellationToken);

        var responses = paged.Items
            .Select(item =>
            {
                var medico = medicos[item.Id];
                return ToResponse(
                    medico,
                    item.EmpleadoCodigo,
                    NombreCompleto(item.Nombres, item.ApellidoPaterno, item.ApellidoMaterno));
            })
            .ToList();

        return new PagedResult<MedicoResponse>(
            responses,
            paged.TotalRecords,
            paged.Page,
            paged.PageSize);
    }

    public async Task<MedicoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var row = await (
            from medico in context.Medicos.AsNoTracking()
            join empleado in context.Set<Empleado>().AsNoTracking()
                on medico.EmpleadoId equals empleado.Id
            join persona in context.Personas.AsNoTracking()
                on empleado.PersonaId equals persona.Id
            where medico.Id == id
            select new { Medico = medico, Empleado = empleado, Persona = persona }
        ).FirstOrDefaultAsync(cancellationToken);

        if (row is null)
            return null;

        var medicoEntity = await context.Medicos
            .AsNoTracking()
            .Include(x => x.Especialidades)
            .ThenInclude(x => x.Especialidad)
            .FirstAsync(x => x.Id == id, cancellationToken);

        return ToResponse(
            medicoEntity,
            row.Empleado.CodigoEmpleado,
            PersonaNaming.NombreCompleto(row.Persona));
    }

    public async Task<MedicoResponse> CreateAsync(
        CreateMedicoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);
        await EnsureEmpleadoNotMedicoAsync(request.EmpleadoId, null, cancellationToken);
        await EnsureEspecialidadesExistAsync(request.EspecialidadIds, cancellationToken);

        var matricula = StringNormalize.Required(request.MatriculaProfesional);
        await EnsureMatriculaIsUniqueAsync(matricula, null, cancellationToken);

        var entity = new Medico
        {
            EmpleadoId = request.EmpleadoId,
            MatriculaProfesional = matricula,
            RegistroColegioMedico = StringNormalize.Optional(request.RegistroColegioMedico),
            Especialidades = BuildEspecialidades(
                request.EspecialidadIds,
                request.EspecialidadPrincipalId)
        };

        context.Medicos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<MedicoResponse> UpdateAsync(
        Guid id,
        UpdateMedicoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Medicos
            .Include(x => x.Especialidades)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Médico no encontrado.");

        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);
        await EnsureEmpleadoNotMedicoAsync(request.EmpleadoId, id, cancellationToken);
        await EnsureEspecialidadesExistAsync(request.EspecialidadIds, cancellationToken);

        var matricula = StringNormalize.Required(request.MatriculaProfesional);
        await EnsureMatriculaIsUniqueAsync(matricula, id, cancellationToken);

        entity.EmpleadoId = request.EmpleadoId;
        entity.MatriculaProfesional = matricula;
        entity.RegistroColegioMedico = StringNormalize.Optional(request.RegistroColegioMedico);
        SyncEspecialidades(entity, request.EspecialidadIds, request.EspecialidadPrincipalId);

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Medicos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Médico no encontrado.");

        context.Medicos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureEmpleadoExistsAsync(
        Guid empleadoId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<Empleado>()
            .AnyAsync(x => x.Id == empleadoId, cancellationToken);

        if (!exists)
            throw new BusinessException("El empleado no existe.");
    }

    private async Task EnsureEmpleadoNotMedicoAsync(
        Guid empleadoId,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Medicos
            .AnyAsync(x =>
                    x.EmpleadoId == empleadoId &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El empleado ya está registrado como médico.");
    }

    private async Task EnsureEspecialidadesExistAsync(
        IReadOnlyList<Guid> especialidadIds,
        CancellationToken cancellationToken)
    {
        var distinctIds = especialidadIds.Distinct().ToList();

        if (distinctIds.Count != especialidadIds.Count)
            throw new BusinessException("No se permiten especialidades duplicadas.");

        var count = await context.Set<Especialidad>()
            .CountAsync(x => distinctIds.Contains(x.Id), cancellationToken);

        if (count != distinctIds.Count)
            throw new BusinessException("Una o más especialidades no existen.");
    }

    private async Task EnsureMatriculaIsUniqueAsync(
        string matricula,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Medicos
            .AnyAsync(x =>
                    x.MatriculaProfesional == matricula &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("La matrícula profesional ya existe.");
    }

    private async Task<Dictionary<Guid, Medico>> LoadMedicosByIdsAsync(
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
            return [];

        return await context.Medicos
            .AsNoTracking()
            .Include(x => x.Especialidades)
            .ThenInclude(x => x.Especialidad)
            .Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    private static List<MedicoEspecialidad> BuildEspecialidades(
        IReadOnlyList<Guid> especialidadIds,
        Guid especialidadPrincipalId)
    {
        return especialidadIds
            .Distinct()
            .Select(especialidadId => new MedicoEspecialidad
            {
                EspecialidadId = especialidadId,
                EsPrincipal = especialidadId == especialidadPrincipalId
            })
            .ToList();
    }

    private static void SyncEspecialidades(
        Medico entity,
        IReadOnlyList<Guid> especialidadIds,
        Guid especialidadPrincipalId)
    {
        var distinctIds = especialidadIds.Distinct().ToHashSet();

        var toRemove = entity.Especialidades
            .Where(x => !distinctIds.Contains(x.EspecialidadId))
            .ToList();

        foreach (var item in toRemove)
            entity.Especialidades.Remove(item);

        foreach (var especialidadId in distinctIds)
        {
            var existing = entity.Especialidades
                .FirstOrDefault(x => x.EspecialidadId == especialidadId);

            if (existing is null)
            {
                entity.Especialidades.Add(new MedicoEspecialidad
                {
                    EspecialidadId = especialidadId,
                    EsPrincipal = especialidadId == especialidadPrincipalId
                });
            }
            else
            {
                existing.EsPrincipal = especialidadId == especialidadPrincipalId;
            }
        }
    }

    private static MedicoResponse ToResponse(
        Medico entity,
        string empleadoCodigo,
        string personaNombreCompleto)
    {
        var especialidades = entity.Especialidades
            .OrderByDescending(x => x.EsPrincipal)
            .ThenBy(x => x.Especialidad.Nombre)
            .Select(x => new MedicoEspecialidadResponse(
                x.EspecialidadId,
                x.Especialidad.Nombre,
                x.EsPrincipal))
            .ToList();

        var principal = especialidades.FirstOrDefault(x => x.EsPrincipal)
            ?? especialidades.FirstOrDefault();

        return new MedicoResponse(
            entity.Id,
            entity.EmpleadoId,
            empleadoCodigo,
            personaNombreCompleto,
            especialidades,
            principal?.EspecialidadId ?? Guid.Empty,
            principal?.EspecialidadNombre ?? string.Empty,
            entity.MatriculaProfesional,
            entity.RegistroColegioMedico);
    }

    private static string NombreCompleto(
        string nombres,
        string apellidoPaterno,
        string apellidoMaterno) =>
        $"{nombres} {apellidoPaterno} {apellidoMaterno}".Trim();

    private sealed record MedicoListItem(
        Guid Id,
        string EmpleadoCodigo,
        string Nombres,
        string ApellidoPaterno,
        string ApellidoMaterno);
}
