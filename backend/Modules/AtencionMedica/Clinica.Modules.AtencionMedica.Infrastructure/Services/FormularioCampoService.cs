using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormularioCampos;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class FormularioCampoService(AtencionMedicaDbContext context)
    : IFormularioCampoService
{
    public Task<PagedResult<FormularioCampoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new FormularioCampoPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<FormularioCampoResponse>> GetPagedAsync(
        FormularioCampoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.FormularioCampos.AsNoTracking();

        if (request.FormularioSeccionId is { } formularioSeccionId && formularioSeccionId != Guid.Empty)
            query = query.Where(x => x.FormularioSeccionId == formularioSeccionId);

        return await query
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Etiqueta)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<FormularioCampoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.FormularioCampos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<FormularioCampoResponse> CreateAsync(
        CreateFormularioCampoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureFormularioSeccionExistsAsync(request.FormularioSeccionId, cancellationToken);
        await EnsureTipoCampoFormularioExistsAsync(request.TipoCampoFormularioId, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(
            request.FormularioSeccionId,
            codigo,
            null,
            cancellationToken);

        var entity = new FormularioCampo
        {
            FormularioSeccionId = request.FormularioSeccionId,
            Codigo = codigo,
            Etiqueta = StringNormalize.Required(request.Etiqueta),
            TipoCampoFormularioId = request.TipoCampoFormularioId,
            EsRequerido = request.EsRequerido,
            Visible = request.Visible,
            Orden = request.Orden,
            Placeholder = StringNormalize.Optional(request.Placeholder),
            ValorDefecto = StringNormalize.Optional(request.ValorDefecto),
            OpcionesJson = StringNormalize.Optional(request.OpcionesJson),
            ValidacionesJson = StringNormalize.Optional(request.ValidacionesJson)
        };

        context.FormularioCampos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<FormularioCampoResponse> UpdateAsync(
        Guid id,
        UpdateFormularioCampoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.FormularioCampos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Campo de formulario no encontrado.");

        await EnsureFormularioSeccionExistsAsync(request.FormularioSeccionId, cancellationToken);
        await EnsureTipoCampoFormularioExistsAsync(request.TipoCampoFormularioId, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(
            request.FormularioSeccionId,
            codigo,
            id,
            cancellationToken);

        entity.FormularioSeccionId = request.FormularioSeccionId;
        entity.Codigo = codigo;
        entity.Etiqueta = StringNormalize.Required(request.Etiqueta);
        entity.TipoCampoFormularioId = request.TipoCampoFormularioId;
        entity.EsRequerido = request.EsRequerido;
        entity.Visible = request.Visible;
        entity.Orden = request.Orden;
        entity.Placeholder = StringNormalize.Optional(request.Placeholder);
        entity.ValorDefecto = StringNormalize.Optional(request.ValorDefecto);
        entity.OpcionesJson = StringNormalize.Optional(request.OpcionesJson);
        entity.ValidacionesJson = StringNormalize.Optional(request.ValidacionesJson);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.FormularioCampos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Campo de formulario no encontrado.");

        context.FormularioCampos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureFormularioSeccionExistsAsync(
        Guid formularioSeccionId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormularioSecciones
            .AnyAsync(x => x.Id == formularioSeccionId, cancellationToken);

        if (!exists)
            throw new BusinessException("La sección de formulario no existe.");
    }

    private async Task EnsureTipoCampoFormularioExistsAsync(
        Guid tipoCampoFormularioId,
        CancellationToken cancellationToken)
    {
        var exists = await context.TiposCampoFormulario
            .AnyAsync(x => x.Id == tipoCampoFormularioId, cancellationToken);

        if (!exists)
            throw new BusinessException("El tipo de campo de formulario no existe.");
    }

    private async Task EnsureCodigoIsUniqueAsync(
        Guid formularioSeccionId,
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormularioCampos.AnyAsync(
            x => x.FormularioSeccionId == formularioSeccionId &&
                 x.Codigo == codigo &&
                 (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe en esta sección.");
    }

    private static FormularioCampoResponse ToResponse(FormularioCampo entity) =>
        new(
            entity.Id,
            entity.FormularioSeccionId,
            entity.Codigo,
            entity.Etiqueta,
            entity.TipoCampoFormularioId,
            entity.EsRequerido,
            entity.Visible,
            entity.Orden,
            entity.Placeholder,
            entity.ValorDefecto,
            entity.OpcionesJson,
            entity.ValidacionesJson);
}
