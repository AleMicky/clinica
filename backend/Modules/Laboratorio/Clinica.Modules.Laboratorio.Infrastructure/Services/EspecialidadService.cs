using System.Linq.Expressions;
using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Especialidades;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class EspecialidadService(LaboratorioDbContext context)
    : SimpleCatalogService<Especialidad, EspecialidadResponse, CreateEspecialidadRequest, UpdateEspecialidadRequest>(context),
      IEspecialidadService
{
    protected override DbSet<Especialidad> Set => context.Especialidades;

    protected override string NotFoundMessage => "Especialidad no encontrada.";

    protected override Expression<Func<Especialidad, EspecialidadResponse>> ProjectToResponse =>
        x => new EspecialidadResponse(
            x.Id,
            x.Codigo,
            x.Nombre,
            x.Descripcion ?? string.Empty,
            x.Orden);

    protected override EspecialidadResponse MapToResponse(Especialidad entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty,
            entity.Orden);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateEspecialidadRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateEspecialidadRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    public override async Task<PagedResult<EspecialidadResponse>> GetPagedAsync(
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

    public override async Task<EspecialidadResponse> CreateAsync(
        CreateEspecialidadRequest request,
        CancellationToken cancellationToken = default)
    {
        var (codigo, nombre, descripcion) = NormalizeFields(ReadCreate(request));
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Especialidad();
        ApplyFields(entity, codigo, nombre, descripcion);
        entity.Orden = request.Orden;

        Set.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<EspecialidadResponse> UpdateAsync(
        Guid id,
        UpdateEspecialidadRequest request,
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
