using System.Linq.Expressions;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.TiposArea;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class TipoAreaService(RecursosHumanosDbContext context)
    : SimpleCatalogService<TipoArea, TipoAreaResponse, CreateTipoAreaRequest, UpdateTipoAreaRequest>(context),
      ITipoAreaService
{
    protected override DbSet<TipoArea> Set => context.TiposArea;

    protected override string NotFoundMessage => "Tipo de área no encontrado.";

    protected override Expression<Func<TipoArea, TipoAreaResponse>> ProjectToResponse =>
        x => new TipoAreaResponse(
            x.Id,
            x.Codigo,
            x.Nombre,
            x.Descripcion ?? string.Empty,
            x.Orden);

    protected override TipoAreaResponse MapToResponse(TipoArea entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty,
            entity.Orden);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateTipoAreaRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateTipoAreaRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    public override async Task<PagedResult<TipoAreaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public override async Task<TipoAreaResponse> CreateAsync(
        CreateTipoAreaRequest request,
        CancellationToken cancellationToken = default)
    {
        var (codigo, nombre, descripcion) = NormalizeFields(ReadCreate(request));
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new TipoArea();
        ApplyFields(entity, codigo, nombre, descripcion);
        entity.Orden = request.Orden;

        Set.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<TipoAreaResponse> UpdateAsync(
        Guid id,
        UpdateTipoAreaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Set.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        var (codigo, nombre, descripcion) = NormalizeFields(ReadUpdate(request));
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        ApplyFields(entity, codigo, nombre, descripcion);
        entity.Orden = request.Orden;
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }
}
