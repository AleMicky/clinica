using System.Linq.Expressions;
using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.TiposAtencion;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class TipoAtencionService(AtencionMedicaDbContext context)
    : SimpleCatalogService<TipoAtencion, TipoAtencionResponse, CreateTipoAtencionRequest, UpdateTipoAtencionRequest>(context),
      ITipoAtencionService
{
    protected override DbSet<TipoAtencion> Set => context.TiposAtencion;

    protected override string NotFoundMessage => "Tipo de atención no encontrado.";

    protected override Expression<Func<TipoAtencion, TipoAtencionResponse>> ProjectToResponse =>
        x => new TipoAtencionResponse(
            x.Id,
            x.Codigo,
            x.Nombre,
            x.Descripcion ?? string.Empty,
            x.Color,
            x.Icono,
            x.PrecioBase);

    protected override TipoAtencionResponse MapToResponse(TipoAtencion entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty,
            entity.Color,
            entity.Icono,
            entity.PrecioBase);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateTipoAtencionRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateTipoAtencionRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    public override async Task<TipoAtencionResponse> CreateAsync(
        CreateTipoAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        var (codigo, nombre, descripcion) = NormalizeFields(ReadCreate(request));
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new TipoAtencion();
        ApplyFields(entity, codigo, nombre, descripcion);
        ApplyVisualFields(entity, request.Color, request.Icono);
        entity.PrecioBase = request.PrecioBase;

        Set.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<TipoAtencionResponse> UpdateAsync(
        Guid id,
        UpdateTipoAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Set.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        var (codigo, nombre, descripcion) = NormalizeFields(ReadUpdate(request));
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        ApplyFields(entity, codigo, nombre, descripcion);
        ApplyVisualFields(entity, request.Color, request.Icono);
        entity.PrecioBase = request.PrecioBase;
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    protected override async Task OnBeforeDeleteAsync(
        TipoAtencion entity,
        CancellationToken cancellationToken)
    {
        var usadoEnAtenciones = await context.Atenciones
            .AnyAsync(x => x.TipoAtencionId == entity.Id, cancellationToken);

        if (usadoEnAtenciones)
            throw new BusinessException(
                "No se puede eliminar el tipo de atención porque tiene atenciones asociadas.");

        var usadoEnFormularios = await context.FormulariosClinicos
            .AnyAsync(x => x.TipoAtencionId == entity.Id, cancellationToken);

        if (usadoEnFormularios)
            throw new BusinessException(
                "No se puede eliminar el tipo de atención porque tiene formularios clínicos asociados.");
    }

    private static void ApplyVisualFields(TipoAtencion entity, string color, string? icono)
    {
        entity.Color = StringNormalize.Required(color);
        entity.Icono = StringNormalize.Optional(icono);
    }
}
