using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class AtencionFormularioRespuestaService(AtencionMedicaDbContext context)
    : IAtencionFormularioRespuestaService
{
    public Task<PagedResult<AtencionFormularioRespuestaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new AtencionFormularioRespuestaPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<AtencionFormularioRespuestaResponse>> GetPagedAsync(
        AtencionFormularioRespuestaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.AtencionFormularioRespuestas.AsNoTracking();

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.FormularioCampoId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<AtencionFormularioRespuestaResponse>(items, total, page, pageSize);
    }

    public async Task<AtencionFormularioRespuestaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.AtencionFormularioRespuestas
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AtencionFormularioRespuestaResponse> CreateAsync(
        CreateAtencionFormularioRespuestaRequest request,
        CancellationToken cancellationToken = default)
    {
        var atencion = await context.Atenciones
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.AtencionId, cancellationToken);

        if (atencion is null)
            throw new BusinessException("La atención no existe.");

        await EnsureCampoBelongsToFormularioAsync(
            request.FormularioCampoId,
            atencion.FormularioClinicoId,
            cancellationToken);

        await EnsureRespuestaIsUniqueAsync(
            request.AtencionId,
            request.FormularioCampoId,
            null,
            cancellationToken);

        var entity = new AtencionFormularioRespuesta
        {
            AtencionId = request.AtencionId,
            FormularioCampoId = request.FormularioCampoId,
            ValorTexto = NormalizeOptional(request.ValorTexto),
            ValorNumero = request.ValorNumero,
            ValorFecha = request.ValorFecha,
            ValorBooleano = request.ValorBooleano,
            ValorJson = NormalizeOptional(request.ValorJson)
        };

        context.AtencionFormularioRespuestas.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<AtencionFormularioRespuestaResponse> UpdateAsync(
        Guid id,
        UpdateAtencionFormularioRespuestaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.AtencionFormularioRespuestas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Respuesta de formulario no encontrada.");

        var atencion = await context.Atenciones
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.AtencionId, cancellationToken);

        if (atencion is null)
            throw new BusinessException("La atención no existe.");

        await EnsureCampoBelongsToFormularioAsync(
            request.FormularioCampoId,
            atencion.FormularioClinicoId,
            cancellationToken);

        await EnsureRespuestaIsUniqueAsync(
            request.AtencionId,
            request.FormularioCampoId,
            id,
            cancellationToken);

        entity.AtencionId = request.AtencionId;
        entity.FormularioCampoId = request.FormularioCampoId;
        entity.ValorTexto = NormalizeOptional(request.ValorTexto);
        entity.ValorNumero = request.ValorNumero;
        entity.ValorFecha = request.ValorFecha;
        entity.ValorBooleano = request.ValorBooleano;
        entity.ValorJson = NormalizeOptional(request.ValorJson);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.AtencionFormularioRespuestas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Respuesta de formulario no encontrada.");

        context.AtencionFormularioRespuestas.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCampoBelongsToFormularioAsync(
        Guid formularioCampoId,
        Guid formularioClinicoId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormularioCampos
            .AnyAsync(
                x => x.Id == formularioCampoId &&
                     x.FormularioSeccion.FormularioClinicoId == formularioClinicoId,
                cancellationToken);

        if (!exists)
            throw new BusinessException("El campo no pertenece al formulario de la atención.");
    }

    private async Task EnsureRespuestaIsUniqueAsync(
        Guid atencionId,
        Guid formularioCampoId,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.AtencionFormularioRespuestas.AnyAsync(
            x => x.AtencionId == atencionId &&
                 x.FormularioCampoId == formularioCampoId &&
                 (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("Ya existe una respuesta para este campo en la atención.");
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static AtencionFormularioRespuestaResponse ToResponse(AtencionFormularioRespuesta entity) =>
        new(
            entity.Id,
            entity.AtencionId,
            entity.FormularioCampoId,
            entity.ValorTexto,
            entity.ValorNumero,
            entity.ValorFecha,
            entity.ValorBooleano,
            entity.ValorJson);
}
