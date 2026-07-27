using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cajas;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class CajaFisicaService(CajaDbContext context) : ICajaFisicaService
{
    public async Task<PagedResult<CajaResponse>> GetPagedAsync(
        CajaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Cajas.AsNoTracking();

        if (request.Activo.HasValue)
            query = query.Where(x => x.Activo == request.Activo.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Codigo.Contains(search) || x.Nombre.Contains(search));
        }

        return await query
            .OrderBy(x => x.Codigo)
            .Select(x => new CajaResponse(
                x.Id, x.Codigo, x.Nombre, x.Descripcion, x.Activo, x.CreatedAt, x.UpdatedAt))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<CajaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Cajas.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<CajaResponse> CreateAsync(CreateCajaRequest request, CancellationToken cancellationToken = default)
    {
        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var exists = await context.Cajas.AnyAsync(x => x.Codigo == codigo, cancellationToken);
        if (exists)
            throw new BusinessException($"Ya existe una caja con código {codigo}.");

        var entity = new CajaFisica
        {
            Id = Guid.NewGuid(),
            Codigo = codigo,
            Nombre = request.Nombre.Trim(),
            Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim(),
            Activo = request.Activo,
            CreatedAt = DateTime.UtcNow,
        };

        context.Cajas.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<CajaResponse> UpdateAsync(Guid id, UpdateCajaRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await context.Cajas.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Caja no encontrada.");

        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim();
        entity.Activo = request.Activo;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task ChangeStatusAsync(Guid id, ChangeCajaStatusRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await context.Cajas.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Caja no encontrada.");

        if (!request.Activo)
        {
            var tieneTurnoAbierto = await context.TurnosCaja.AnyAsync(
                x => x.CajaId == id && x.Estado == TurnoCajaEstados.Abierto,
                cancellationToken);
            if (tieneTurnoAbierto)
                throw new BusinessException("No se puede desactivar una caja con turno abierto.");
        }

        entity.Activo = request.Activo;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }

    private static CajaResponse Map(CajaFisica x) => new(
        x.Id, x.Codigo, x.Nombre, x.Descripcion, x.Activo, x.CreatedAt, x.UpdatedAt);
}
