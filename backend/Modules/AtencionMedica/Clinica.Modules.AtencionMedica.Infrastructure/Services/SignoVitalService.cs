using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.SignosVitales;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class SignoVitalService(AtencionMedicaDbContext context) : ISignoVitalService
{
    public Task<PagedResult<SignoVitalResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new SignoVitalPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<SignoVitalResponse>> GetPagedAsync(
        SignoVitalPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.SignosVitales.AsNoTracking();

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaRegistro)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<SignoVitalResponse>(items, total, page, pageSize);
    }

    public async Task<SignoVitalResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.SignosVitales.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<SignoVitalResponse> CreateAsync(
        CreateSignoVitalRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);

        var entity = MapToEntity(new SignoVital(), request);
        context.SignosVitales.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<SignoVitalResponse> UpdateAsync(
        Guid id,
        UpdateSignoVitalRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.SignosVitales.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Signo vital no encontrado.");

        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);
        MapToEntity(entity, request);

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.SignosVitales.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Signo vital no encontrado.");

        context.SignosVitales.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAtencionExistsAsync(Guid atencionId, CancellationToken cancellationToken)
    {
        if (!await context.Atenciones.AnyAsync(x => x.Id == atencionId, cancellationToken))
            throw new BusinessException("La atención no existe.");
    }

    private static SignoVital MapToEntity(SignoVital entity, CreateSignoVitalRequest request)
    {
        entity.AtencionId = request.AtencionId;
        entity.Temperatura = request.Temperatura;
        entity.FrecuenciaCardiaca = request.FrecuenciaCardiaca;
        entity.FrecuenciaRespiratoria = request.FrecuenciaRespiratoria;
        entity.PresionSistolica = request.PresionSistolica;
        entity.PresionDiastolica = request.PresionDiastolica;
        entity.SaturacionOxigeno = request.SaturacionOxigeno;
        entity.GlucemiaCapilar = request.GlucemiaCapilar;
        entity.Peso = request.Peso;
        entity.Talla = request.Talla;
        entity.Imc = request.Imc ?? ComputeImc(request.Peso, request.Talla);
        entity.Glasgow = request.Glasgow;
        entity.FechaRegistro = request.FechaRegistro ?? DateTime.UtcNow;
        return entity;
    }

    private static SignoVital MapToEntity(SignoVital entity, UpdateSignoVitalRequest request)
    {
        entity.AtencionId = request.AtencionId;
        entity.Temperatura = request.Temperatura;
        entity.FrecuenciaCardiaca = request.FrecuenciaCardiaca;
        entity.FrecuenciaRespiratoria = request.FrecuenciaRespiratoria;
        entity.PresionSistolica = request.PresionSistolica;
        entity.PresionDiastolica = request.PresionDiastolica;
        entity.SaturacionOxigeno = request.SaturacionOxigeno;
        entity.GlucemiaCapilar = request.GlucemiaCapilar;
        entity.Peso = request.Peso;
        entity.Talla = request.Talla;
        entity.Imc = request.Imc ?? ComputeImc(request.Peso, request.Talla);
        entity.Glasgow = request.Glasgow;
        entity.FechaRegistro = request.FechaRegistro ?? entity.FechaRegistro;
        return entity;
    }

    private static decimal? ComputeImc(decimal? peso, decimal? talla)
    {
        if (peso is null or <= 0 || talla is null or <= 0)
            return null;

        var tallaMetros = talla.Value / 100m;
        return Math.Round(peso.Value / (tallaMetros * tallaMetros), 2);
    }

    private static SignoVitalResponse ToResponse(SignoVital entity) =>
        new(
            entity.Id,
            entity.AtencionId,
            entity.Temperatura,
            entity.FrecuenciaCardiaca,
            entity.FrecuenciaRespiratoria,
            entity.PresionSistolica,
            entity.PresionDiastolica,
            entity.SaturacionOxigeno,
            entity.GlucemiaCapilar,
            entity.Peso,
            entity.Talla,
            entity.Imc,
            entity.Glasgow,
            entity.FechaRegistro);
}
