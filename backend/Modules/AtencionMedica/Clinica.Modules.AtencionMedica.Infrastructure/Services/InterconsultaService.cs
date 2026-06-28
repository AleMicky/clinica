using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Interconsultas;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class InterconsultaService(AtencionMedicaDbContext context) : IInterconsultaService
{
    public Task<PagedResult<InterconsultaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new InterconsultaPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<InterconsultaResponse>> GetPagedAsync(
        InterconsultaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Interconsultas.AsNoTracking();

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaSolicitud)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<InterconsultaResponse>(items, total, page, pageSize);
    }

    public async Task<InterconsultaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.Interconsultas.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<InterconsultaResponse> CreateAsync(
        CreateInterconsultaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);
        await EnsureMedicoExistsAsync(request.MedicoId, cancellationToken);

        var entity = new Interconsulta
        {
            AtencionId = request.AtencionId,
            EspecialidadId = request.EspecialidadId,
            MedicoId = request.MedicoId,
            Motivo = request.Motivo.Trim(),
            Respuesta = NormalizeOptional(request.Respuesta),
            FechaSolicitud = request.FechaSolicitud ?? DateTime.UtcNow,
            FechaRespuesta = request.FechaRespuesta
        };

        context.Interconsultas.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<InterconsultaResponse> UpdateAsync(
        Guid id,
        UpdateInterconsultaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Interconsultas.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Interconsulta no encontrada.");

        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);
        await EnsureMedicoExistsAsync(request.MedicoId, cancellationToken);

        entity.AtencionId = request.AtencionId;
        entity.EspecialidadId = request.EspecialidadId;
        entity.MedicoId = request.MedicoId;
        entity.Motivo = request.Motivo.Trim();
        entity.Respuesta = NormalizeOptional(request.Respuesta);
        entity.FechaSolicitud = request.FechaSolicitud ?? entity.FechaSolicitud;
        entity.FechaRespuesta = request.FechaRespuesta;

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Interconsultas.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Interconsulta no encontrada.");

        context.Interconsultas.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAtencionExistsAsync(Guid atencionId, CancellationToken cancellationToken)
    {
        if (!await context.Atenciones.AnyAsync(x => x.Id == atencionId, cancellationToken))
            throw new BusinessException("La atención no existe.");
    }

    private async Task EnsureEspecialidadExistsAsync(Guid especialidadId, CancellationToken cancellationToken)
    {
        if (!await context.Set<Especialidad>().AnyAsync(x => x.Id == especialidadId, cancellationToken))
            throw new BusinessException("La especialidad no existe.");
    }

    private async Task EnsureMedicoExistsAsync(Guid? medicoId, CancellationToken cancellationToken)
    {
        if (medicoId is null || medicoId == Guid.Empty)
            return;

        if (!await context.Set<Medico>().AnyAsync(x => x.Id == medicoId.Value, cancellationToken))
            throw new BusinessException("El médico no existe.");
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static InterconsultaResponse ToResponse(Interconsulta entity) =>
        new(
            entity.Id,
            entity.AtencionId,
            entity.EspecialidadId,
            entity.MedicoId,
            entity.Motivo,
            entity.Respuesta,
            entity.FechaSolicitud,
            entity.FechaRespuesta);
}
