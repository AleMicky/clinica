using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.ResultadosEstudio;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class ResultadoEstudioService(AtencionMedicaDbContext context) : IResultadoEstudioService
{
    public Task<PagedResult<ResultadoEstudioResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new ResultadoEstudioPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<ResultadoEstudioResponse>> GetPagedAsync(
        ResultadoEstudioPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.ResultadosEstudio.AsNoTracking();

        if (request.EstudioId is { } estudioId && estudioId != Guid.Empty)
            query = query.Where(x => x.EstudioId == estudioId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaResultado)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<ResultadoEstudioResponse>(items, total, page, pageSize);
    }

    public async Task<ResultadoEstudioResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.ResultadosEstudio.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<ResultadoEstudioResponse> CreateAsync(
        CreateResultadoEstudioRequest request,
        CancellationToken cancellationToken = default)
    {
        var estudio = await context.Estudios
            .FirstOrDefaultAsync(x => x.Id == request.EstudioId, cancellationToken)
            ?? throw new BusinessException("El estudio no existe.");

        if (await context.ResultadosEstudio.AnyAsync(x => x.EstudioId == request.EstudioId, cancellationToken))
            throw new BusinessException("El estudio ya tiene un resultado registrado.");

        var entity = new ResultadoEstudio
        {
            EstudioId = request.EstudioId,
            ResultadoTexto = request.ResultadoTexto.Trim(),
            ArchivoUrl = NormalizeOptional(request.ArchivoUrl),
            FechaResultado = request.FechaResultado ?? DateTime.UtcNow,
            RegistradoPorId = request.RegistradoPorId,
            Observaciones = NormalizeOptional(request.Observaciones)
        };

        context.ResultadosEstudio.Add(entity);
        estudio.Estado = "COMPLETADO";

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<ResultadoEstudioResponse> UpdateAsync(
        Guid id,
        UpdateResultadoEstudioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ResultadosEstudio.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Resultado de estudio no encontrado.");

        if (!await context.Estudios.AnyAsync(x => x.Id == request.EstudioId, cancellationToken))
            throw new BusinessException("El estudio no existe.");

        if (await context.ResultadosEstudio.AnyAsync(
                x => x.EstudioId == request.EstudioId && x.Id != id,
                cancellationToken))
            throw new BusinessException("El estudio ya tiene un resultado registrado.");

        entity.EstudioId = request.EstudioId;
        entity.ResultadoTexto = request.ResultadoTexto.Trim();
        entity.ArchivoUrl = NormalizeOptional(request.ArchivoUrl);
        entity.FechaResultado = request.FechaResultado ?? entity.FechaResultado;
        entity.RegistradoPorId = request.RegistradoPorId;
        entity.Observaciones = NormalizeOptional(request.Observaciones);

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.ResultadosEstudio.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Resultado de estudio no encontrado.");

        context.ResultadosEstudio.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static ResultadoEstudioResponse ToResponse(ResultadoEstudio entity) =>
        new(
            entity.Id,
            entity.EstudioId,
            entity.ResultadoTexto,
            entity.ArchivoUrl,
            entity.FechaResultado,
            entity.RegistradoPorId,
            entity.Observaciones);
}
