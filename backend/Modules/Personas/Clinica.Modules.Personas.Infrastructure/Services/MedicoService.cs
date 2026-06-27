using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Medicos;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
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
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Medicos
            .AsNoTracking()
            .Include(x => x.Empleado)
            .ThenInclude(x => x.Persona)
            .Include(x => x.Especialidad)
            .AsQueryable();

        if (request.EmpleadoId is { } empleadoId && empleadoId != Guid.Empty)
            query = query.Where(x => x.EmpleadoId == empleadoId);

        if (request.EspecialidadId is { } especialidadId && especialidadId != Guid.Empty)
            query = query.Where(x => x.EspecialidadId == especialidadId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.MatriculaProfesional.Contains(search) ||
                (x.RegistroColegioMedico != null && x.RegistroColegioMedico.Contains(search)) ||
                x.Empleado.CodigoEmpleado.Contains(search) ||
                x.Empleado.Persona.Nombres.Contains(search) ||
                x.Empleado.Persona.ApellidoPaterno.Contains(search) ||
                x.Empleado.Persona.ApellidoMaterno.Contains(search) ||
                x.Especialidad.Nombre.Contains(search));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Empleado.Persona.ApellidoPaterno)
            .ThenBy(x => x.Empleado.Persona.Nombres)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<MedicoResponse>(items, total, page, pageSize);
    }

    public async Task<MedicoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Medicos
            .AsNoTracking()
            .Include(x => x.Empleado)
            .ThenInclude(x => x.Persona)
            .Include(x => x.Especialidad)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<MedicoResponse> CreateAsync(
        CreateMedicoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);
        await EnsureEmpleadoNotMedicoAsync(request.EmpleadoId, null, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);

        var matricula = Normalize(request.MatriculaProfesional);
        await EnsureMatriculaIsUniqueAsync(matricula, null, cancellationToken);

        var entity = new Medico
        {
            EmpleadoId = request.EmpleadoId,
            EspecialidadId = request.EspecialidadId,
            MatriculaProfesional = matricula,
            RegistroColegioMedico = NormalizeOptional(request.RegistroColegioMedico)
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
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Médico no encontrado.");

        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);
        await EnsureEmpleadoNotMedicoAsync(request.EmpleadoId, id, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);

        var matricula = Normalize(request.MatriculaProfesional);
        await EnsureMatriculaIsUniqueAsync(matricula, id, cancellationToken);

        entity.EmpleadoId = request.EmpleadoId;
        entity.EspecialidadId = request.EspecialidadId;
        entity.MatriculaProfesional = matricula;
        entity.RegistroColegioMedico = NormalizeOptional(request.RegistroColegioMedico);

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
        var exists = await context.Empleados
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

    private async Task EnsureEspecialidadExistsAsync(
        Guid especialidadId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<Especialidad>()
            .AnyAsync(x => x.Id == especialidadId, cancellationToken);

        if (!exists)
            throw new BusinessException("La especialidad no existe.");
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

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static MedicoResponse ToResponse(Medico entity)
    {
        return new MedicoResponse(
            entity.Id,
            entity.EmpleadoId,
            entity.Empleado.CodigoEmpleado,
            PersonaNaming.NombreCompleto(entity.Empleado.Persona),
            entity.EspecialidadId,
            entity.Especialidad.Nombre,
            entity.MatriculaProfesional,
            entity.RegistroColegioMedico);
    }
}
