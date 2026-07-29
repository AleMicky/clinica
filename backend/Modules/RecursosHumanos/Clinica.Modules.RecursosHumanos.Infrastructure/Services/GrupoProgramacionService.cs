using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.GrupoProgramacion;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class GrupoProgramacionService(RecursosHumanosDbContext context) : IGrupoProgramacionService
{
    public Task<PagedResult<GrupoProgramacionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new GrupoProgramacionPagedRequest { Page = request.Page, PageSize = request.PageSize },
            cancellationToken);
    }

    public async Task<PagedResult<GrupoProgramacionResponse>> GetPagedAsync(
        GrupoProgramacionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(includeTracking: false);

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.AreaId == areaId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(search) ||
                x.Nombre.Contains(search) ||
                (x.Descripcion != null && x.Descripcion.Contains(search)) ||
                x.Area.Nombre.Contains(search));
        }

        var paged = await query
            .OrderBy(x => x.Nombre)
            .ToPagedResultAsync(request, cancellationToken);

        var nombres = await LoadEmpleadoNombresAsync(
            paged.Items.SelectMany(x => x.Empleados.Select(e => e.EmpleadoId)).Distinct().ToList(),
            cancellationToken);

        var responses = paged.Items
            .Select(x => ToResponse(x, nombres))
            .ToList();

        return new PagedResult<GrupoProgramacionResponse>(
            responses,
            paged.TotalRecords,
            paged.Page,
            paged.PageSize);
    }

    public async Task<GrupoProgramacionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery(includeTracking: false)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            return null;

        var nombres = await LoadEmpleadoNombresAsync(
            entity.Empleados.Select(e => e.EmpleadoId).ToList(),
            cancellationToken);

        return ToResponse(entity, nombres);
    }

    public async Task<GrupoProgramacionResponse> CreateAsync(
        CreateGrupoProgramacionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAreaExistsAsync(request.AreaId, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new GrupoProgramacion
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Descripcion = StringNormalize.Optional(request.Descripcion),
            AreaId = request.AreaId
        };

        context.GrupoProgramacion.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<GrupoProgramacionResponse> UpdateAsync(
        Guid id,
        UpdateGrupoProgramacionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAreaExistsAsync(request.AreaId, cancellationToken);

        var entity = await context.GrupoProgramacion
            .GetRequiredAsync(id, "Grupo de programación no encontrado.", cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);
        entity.AreaId = request.AreaId;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.GrupoProgramacion
            .Include(x => x.Empleados)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Grupo de programación no encontrado.");

        var enUso = await context.Programacion
            .AnyAsync(x => x.GrupoProgramacionId == id, cancellationToken);

        if (enUso)
            throw new BusinessException("No se puede eliminar un grupo con programaciones asociadas.");

        context.GrupoProgramacionEmpleado.RemoveRange(entity.Empleados);
        context.GrupoProgramacion.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<GrupoProgramacionResponse> SetEmpleadosAsync(
        Guid id,
        SetGrupoProgramacionEmpleadosRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.GrupoProgramacion
            .Include(x => x.Empleados)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Grupo de programación no encontrado.");

        var empleadoIds = request.EmpleadoIds
            .Where(x => x != Guid.Empty)
            .Distinct()
            .ToList();

        if (empleadoIds.Count > 0)
        {
            var existentes = await context.Empleados
                .AsNoTracking()
                .Where(x => empleadoIds.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            var faltantes = empleadoIds.Except(existentes).ToList();
            if (faltantes.Count > 0)
                throw new BusinessException("Uno o más empleados no existen.");
        }

        var actuales = entity.Empleados.Select(x => x.EmpleadoId).ToHashSet();
        var deseados = empleadoIds.ToHashSet();

        var aEliminar = entity.Empleados
            .Where(x => !deseados.Contains(x.EmpleadoId))
            .ToList();

        if (aEliminar.Count > 0)
            context.GrupoProgramacionEmpleado.RemoveRange(aEliminar);

        foreach (var empleadoId in deseados.Except(actuales))
        {
            context.GrupoProgramacionEmpleado.Add(new GrupoProgramacionEmpleado
            {
                GrupoProgramacionId = id,
                EmpleadoId = empleadoId
            });
        }

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(id, cancellationToken))!;
    }

    private IQueryable<GrupoProgramacion> BuildQuery(bool includeTracking)
    {
        IQueryable<GrupoProgramacion> query = context.GrupoProgramacion
            .Include(x => x.Area)
            .Include(x => x.Empleados)
            .ThenInclude(x => x.Empleado);

        return includeTracking ? query : query.AsNoTracking();
    }

    private async Task EnsureAreaExistsAsync(Guid areaId, CancellationToken cancellationToken)
    {
        if (!await context.Areas.AnyAsync(x => x.Id == areaId, cancellationToken))
            throw new BusinessException("El área no existe.");
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.GrupoProgramacion.AnyAsync(
            x => x.Codigo == codigo && (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El código de grupo ya existe.");
    }

    private async Task<Dictionary<Guid, string>> LoadEmpleadoNombresAsync(
        IReadOnlyList<Guid> empleadoIds,
        CancellationToken cancellationToken)
    {
        if (empleadoIds.Count == 0)
            return [];

        return await (
            from empleado in context.Empleados.AsNoTracking()
            join persona in context.Set<Persona>().AsNoTracking()
                on empleado.PersonaId equals persona.Id
            where empleadoIds.Contains(empleado.Id)
            select new
            {
                empleado.Id,
                Nombre = persona.Nombres + " " + persona.ApellidoPaterno + " " + persona.ApellidoMaterno
            }
        ).ToDictionaryAsync(x => x.Id, x => x.Nombre.Trim(), cancellationToken);
    }

    private static GrupoProgramacionResponse ToResponse(
        GrupoProgramacion entity,
        IReadOnlyDictionary<Guid, string> nombres)
    {
        var empleados = entity.Empleados
            .OrderBy(x => x.Empleado.CodigoEmpleado)
            .Select(x => new GrupoProgramacionEmpleadoResponse(
                x.Id,
                x.EmpleadoId,
                x.Empleado.CodigoEmpleado,
                nombres.GetValueOrDefault(x.EmpleadoId, string.Empty)))
            .ToList();

        return new GrupoProgramacionResponse(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion,
            entity.AreaId,
            entity.Area.Codigo,
            entity.Area.Nombre,
            empleados);
    }
}
