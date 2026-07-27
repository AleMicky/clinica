using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Catalogos;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class MetodoPagoCatalogService(CajaDbContext context) : IMetodoPagoCatalogService
{
    public async Task<IReadOnlyList<MetodoPagoResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.MetodosPago.AsNoTracking()
            .Where(x => x.Activo)
            .OrderBy(x => x.Nombre)
            .Select(x => new MetodoPagoResponse(
                x.Id, x.Codigo, x.Nombre, x.RequiereReferencia, x.EsEfectivo, x.Activo))
            .ToListAsync(cancellationToken);
    }
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
