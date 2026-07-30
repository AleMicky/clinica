using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Catalogos;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class MetodoPagoCatalogService(CajaDbContext context) : IMetodoPagoCatalogService
{
    public async Task<IReadOnlyList<MetodoPagoResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.MetodosPago.AsNoTracking()
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.Nombre)
            .Select(x => new MetodoPagoResponse(
                x.Id, x.Codigo, x.Nombre, x.RequiereReferencia, x.EsEfectivo))
            .ToListAsync(cancellationToken);
    }

    public async Task<MetodoPagoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.MetodosPago.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<MetodoPagoResponse> CreateAsync(
        CreateMetodoPagoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var exists = await context.MetodosPago.AnyAsync(
            x => x.Codigo == codigo && !x.IsDeleted,
            cancellationToken);
        if (exists)
            throw new BusinessException($"Ya existe un método de pago con código {codigo}.");

        var entity = new MetodoPago
        {
            Id = Guid.NewGuid(),
            Codigo = codigo,
            Nombre = request.Nombre.Trim(),
            RequiereReferencia = request.RequiereReferencia,
            EsEfectivo = request.EsEfectivo,
            CreatedAt = DateTime.UtcNow,
        };

        context.MetodosPago.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<MetodoPagoResponse> UpdateAsync(
        Guid id,
        UpdateMetodoPagoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.MetodosPago.FirstOrDefaultAsync(
                x => x.Id == id && !x.IsDeleted,
                cancellationToken)
            ?? throw new NotFoundException("Método de pago no encontrado.");

        entity.Nombre = request.Nombre.Trim();
        entity.RequiereReferencia = request.RequiereReferencia;
        entity.EsEfectivo = request.EsEfectivo;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.MetodosPago.FirstOrDefaultAsync(
                x => x.Id == id && !x.IsDeleted,
                cancellationToken)
            ?? throw new NotFoundException("Método de pago no encontrado.");

        var enUso = await context.PagosDetalle.AnyAsync(x => x.MetodoPagoId == id, cancellationToken)
            || await context.MovimientosCaja.AnyAsync(x => x.MetodoPagoId == id, cancellationToken);

        if (enUso)
            throw new BusinessException(
                "No se puede eliminar el método de pago porque ya fue usado en cobros o movimientos.");

        context.MetodosPago.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static MetodoPagoResponse Map(MetodoPago x) => new(
        x.Id, x.Codigo, x.Nombre, x.RequiereReferencia, x.EsEfectivo);
}

public sealed class ConceptoCajaCatalogService(CajaDbContext context) : IConceptoCajaCatalogService
{
    public async Task<IReadOnlyList<ConceptoCajaResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.ConceptosCaja.AsNoTracking()
            .Where(x => x.Activo)
            .OrderBy(x => x.Nombre)
            .Select(x => new ConceptoCajaResponse(
                x.Id, x.Codigo, x.Nombre, x.TipoMovimiento, x.Activo))
            .ToListAsync(cancellationToken);
    }
}
