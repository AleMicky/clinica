using System.Linq.Expressions;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Areas;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class AreaService(RecursosHumanosDbContext context)
    : SimpleCatalogService<Area, AreaResponse, CreateAreaRequest, UpdateAreaRequest>(context),
      IAreaService
{
    protected override DbSet<Area> Set => context.Areas;

    protected override string NotFoundMessage => "Área no encontrada.";

    protected override Expression<Func<Area, AreaResponse>> ProjectToResponse =>
        x => new AreaResponse(
            x.Id,
            x.Codigo,
            x.Nombre,
            x.Descripcion ?? string.Empty,
            x.TipoAreaId,
            x.TipoArea.Nombre,
            x.AreaPadreId,
            x.AreaPadre != null ? x.AreaPadre.Nombre : null,
            x.ResponsableEmpleadoId);

    protected override AreaResponse MapToResponse(Area entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty,
            entity.TipoAreaId,
            entity.TipoArea?.Nombre ?? string.Empty,
            entity.AreaPadreId,
            entity.AreaPadre?.Nombre,
            entity.ResponsableEmpleadoId);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateAreaRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateAreaRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    public override async Task<PagedResult<AreaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .OrderBy(x => x.TipoArea.Orden)
            .ThenBy(x => x.Nombre)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public override async Task<AreaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public override async Task<AreaResponse> CreateAsync(
        CreateAreaRequest request,
        CancellationToken cancellationToken = default)
    {
        var (codigo, nombre, descripcion) = NormalizeFields(ReadCreate(request));
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);
        await EnsureRelationsAsync(
            request.TipoAreaId,
            request.AreaPadreId,
            request.ResponsableEmpleadoId,
            currentId: null,
            cancellationToken);

        var entity = new Area();
        ApplyFields(entity, codigo, nombre, descripcion);
        ApplyRelations(entity, request.TipoAreaId, request.AreaPadreId, request.ResponsableEmpleadoId);

        Set.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(entity.Id, cancellationToken);
    }

    public override async Task<AreaResponse> UpdateAsync(
        Guid id,
        UpdateAreaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Set.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        var (codigo, nombre, descripcion) = NormalizeFields(ReadUpdate(request));
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);
        await EnsureRelationsAsync(
            request.TipoAreaId,
            request.AreaPadreId,
            request.ResponsableEmpleadoId,
            currentId: id,
            cancellationToken);

        ApplyFields(entity, codigo, nombre, descripcion);
        ApplyRelations(entity, request.TipoAreaId, request.AreaPadreId, request.ResponsableEmpleadoId);
        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(entity.Id, cancellationToken);
    }

    protected override async Task OnBeforeDeleteAsync(
        Area entity,
        CancellationToken cancellationToken)
    {
        var hasSubAreas = await Set.AnyAsync(x => x.AreaPadreId == entity.Id, cancellationToken);
        if (hasSubAreas)
            throw new BusinessException("No se puede eliminar el área porque tiene subáreas.");

        var hasEmpleados = await context.Empleados.AnyAsync(x => x.AreaId == entity.Id, cancellationToken);
        if (hasEmpleados)
            throw new BusinessException("No se puede eliminar el área porque tiene empleados asignados.");
    }

    private static void ApplyRelations(
        Area entity,
        Guid tipoAreaId,
        Guid? areaPadreId,
        Guid? responsableEmpleadoId)
    {
        entity.TipoAreaId = tipoAreaId;
        entity.AreaPadreId = areaPadreId;
        entity.ResponsableEmpleadoId = responsableEmpleadoId;
    }

    private async Task EnsureRelationsAsync(
        Guid tipoAreaId,
        Guid? areaPadreId,
        Guid? responsableEmpleadoId,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        if (!await context.TiposArea.AnyAsync(x => x.Id == tipoAreaId, cancellationToken))
            throw new BusinessException("El tipo de área no existe.");

        if (areaPadreId is { } padreId)
        {
            if (currentId.HasValue && padreId == currentId.Value)
                throw new BusinessException("Un área no puede ser padre de sí misma.");

            var padreExists = await Set.AnyAsync(x => x.Id == padreId, cancellationToken);
            if (!padreExists)
                throw new BusinessException("El área padre no existe.");

            if (currentId.HasValue && await WouldCreateCycleAsync(currentId.Value, padreId, cancellationToken))
                throw new BusinessException("El área padre seleccionada genera una referencia circular.");
        }

        if (responsableEmpleadoId is { } empleadoId)
        {
            var empleadoExists = await context.Empleados.AnyAsync(x => x.Id == empleadoId, cancellationToken);
            if (!empleadoExists)
                throw new BusinessException("El empleado responsable no existe.");
        }
    }

    private async Task<bool> WouldCreateCycleAsync(
        Guid areaId,
        Guid proposedParentId,
        CancellationToken cancellationToken)
    {
        var currentParentId = (Guid?)proposedParentId;

        while (currentParentId.HasValue)
        {
            if (currentParentId.Value == areaId)
                return true;

            currentParentId = await Set
                .AsNoTracking()
                .Where(x => x.Id == currentParentId.Value)
                .Select(x => x.AreaPadreId)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return false;
    }

    private async Task<AreaResponse> GetRequiredResponseAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await GetByIdAsync(id, cancellationToken);
        return response ?? throw new NotFoundException(NotFoundMessage);
    }
}
