using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;
using AtencionEntity = Clinica.Modules.AtencionMedica.Domain.Entities.Atencion;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class AtencionService(AtencionMedicaDbContext context) : IAtencionService
{
    public Task<PagedResult<AtencionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new AtencionPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<AtencionResponse>> GetPagedAsync(
        AtencionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Atenciones.AsNoTracking();

        if (request.PacienteId is { } pacienteId && pacienteId != Guid.Empty)
            query = query.Where(x => x.PacienteId == pacienteId);

        if (request.TipoAtencionId is { } tipoAtencionId && tipoAtencionId != Guid.Empty)
            query = query.Where(x => x.TipoAtencionId == tipoAtencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaAtencion)
            .ThenBy(x => x.NumeroTramite)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<AtencionResponse>(items, total, page, pageSize);
    }

    public async Task<AtencionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Atenciones
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AtencionResponse> CreateAsync(
        CreateAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        await EnsureTipoAtencionExistsAsync(request.TipoAtencionId, cancellationToken);
        await EnsureFormularioClinicoMatchesTipoAsync(
            request.FormularioClinicoId,
            request.TipoAtencionId,
            cancellationToken);

        var numeroTramite = Normalize(request.NumeroTramite);
        await EnsureNumeroTramiteIsUniqueAsync(numeroTramite, null, cancellationToken);

        var entity = new AtencionEntity
        {
            NumeroTramite = numeroTramite,
            PacienteId = request.PacienteId,
            TipoAtencionId = request.TipoAtencionId,
            FormularioClinicoId = request.FormularioClinicoId,
            FechaAtencion = request.FechaAtencion,
            Estado = Normalize(request.Estado),
            Observaciones = NormalizeOptional(request.Observaciones)
        };

        context.Atenciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<AtencionResponse> UpdateAsync(
        Guid id,
        UpdateAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Atenciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Atención no encontrada.");

        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        await EnsureTipoAtencionExistsAsync(request.TipoAtencionId, cancellationToken);
        await EnsureFormularioClinicoMatchesTipoAsync(
            request.FormularioClinicoId,
            request.TipoAtencionId,
            cancellationToken);

        var numeroTramite = Normalize(request.NumeroTramite);
        await EnsureNumeroTramiteIsUniqueAsync(numeroTramite, id, cancellationToken);

        entity.NumeroTramite = numeroTramite;
        entity.PacienteId = request.PacienteId;
        entity.TipoAtencionId = request.TipoAtencionId;
        entity.FormularioClinicoId = request.FormularioClinicoId;
        entity.FechaAtencion = request.FechaAtencion;
        entity.Estado = Normalize(request.Estado);
        entity.Observaciones = NormalizeOptional(request.Observaciones);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Atenciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Atención no encontrada.");

        context.Atenciones.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsurePacienteExistsAsync(
        Guid pacienteId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<Paciente>()
            .AnyAsync(x => x.Id == pacienteId, cancellationToken);

        if (!exists)
            throw new BusinessException("El paciente no existe.");
    }

    private async Task EnsureTipoAtencionExistsAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        var exists = await context.TiposAtencion
            .AnyAsync(x => x.Id == tipoAtencionId, cancellationToken);

        if (!exists)
            throw new BusinessException("El tipo de atención no existe.");
    }

    private async Task EnsureFormularioClinicoMatchesTipoAsync(
        Guid formularioClinicoId,
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        var formulario = await context.FormulariosClinicos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == formularioClinicoId, cancellationToken);

        if (formulario is null)
            throw new BusinessException("El formulario clínico no existe.");

        if (formulario.TipoAtencionId != tipoAtencionId)
            throw new BusinessException("El formulario no corresponde al tipo de atención.");
    }

    private async Task EnsureNumeroTramiteIsUniqueAsync(
        string numeroTramite,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Atenciones.AnyAsync(
            x => x.NumeroTramite == numeroTramite &&
                 (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El número de trámite ya existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static AtencionResponse ToResponse(AtencionEntity entity) =>
        new(
            entity.Id,
            entity.NumeroTramite,
            entity.PacienteId,
            entity.TipoAtencionId,
            entity.FormularioClinicoId,
            entity.FechaAtencion,
            entity.Estado,
            entity.Observaciones);
}
