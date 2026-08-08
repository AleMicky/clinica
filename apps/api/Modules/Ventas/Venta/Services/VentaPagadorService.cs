using Clinica.Api.Data;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Modules.Ventas.Venta.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using VentaEntity = Clinica.Api.Modules.Ventas.Venta.Entity.Venta;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Ventas.Venta.Services;

public sealed class VentaPagadorService(AppDbContext dbContext)
{
    public async Task<PagedResult<VentaPagadorResponse>> ListarAsync(
        int ventaId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureVentaExistsAsync(ventaId, cancellationToken);

        var query = dbContext.VentaPagadores
            .AsNoTracking()
            .Include(x => x.Convenio)
            .Where(x => x.VentaId == ventaId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.ConvenioId != null
                && (x.Convenio!.Codigo.Contains(normalizedSearch)
                    || x.Convenio.Nombre.Contains(normalizedSearch)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1)
                     * pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Tipo)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<VentaPagadorResponse>(
            VentaPagadorMapper.ToResponse(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<VentaPagadorResponse> ObtenerAsync(
        int ventaId,
        int pagadorId,
        CancellationToken cancellationToken = default)
    {
        await EnsureVentaExistsAsync(ventaId, cancellationToken);

        var entity = await dbContext.VentaPagadores
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.VentaId == ventaId
                     && x.Id == pagadorId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(VentaPagadorEntity), pagadorId);

        return VentaPagadorMapper.ToResponse(entity);
    }

    public async Task<VentaPagadorResponse> CrearAsync(
        int ventaId,
        CreateVentaPagadorRequest request,
        CancellationToken cancellationToken = default)
    {
        await ObtenerVentaEditableAsync(ventaId, cancellationToken);
        await ValidarYVerificarUnicidadAsync(
            ventaId,
            request.Tipo,
            request.ConvenioId,
            null,
            cancellationToken);

        var entity = VentaPagadorMapper.ToEntity(request);
        entity.VentaId = ventaId;
        entity.Activo = true;
        entity.Estado = EstadoVentaPagador.Pendiente;

        await dbContext.VentaPagadores.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return VentaPagadorMapper.ToResponse(entity);
    }

    public async Task<VentaPagadorResponse> ActualizarAsync(
        int ventaId,
        int pagadorId,
        UpdateVentaPagadorRequest request,
        CancellationToken cancellationToken = default)
    {
        await ObtenerVentaEditableAsync(ventaId, cancellationToken);

        var entity = await dbContext.VentaPagadores
            .FirstOrDefaultAsync(
                x => x.VentaId == ventaId
                     && x.Id == pagadorId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(VentaPagadorEntity), pagadorId);

        await ValidarYVerificarUnicidadAsync(
            ventaId,
            request.Tipo,
            request.ConvenioId,
            pagadorId,
            cancellationToken);

        VentaPagadorMapper.UpdateEntity(request, entity);
        entity.ConvenioId = request.ConvenioId;

        await dbContext.SaveChangesAsync(cancellationToken);

        return VentaPagadorMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int ventaId,
        int pagadorId,
        CancellationToken cancellationToken = default)
    {
        await ObtenerVentaEditableAsync(ventaId, cancellationToken);

        var entity = await dbContext.VentaPagadores
            .FirstOrDefaultAsync(
                x => x.VentaId == ventaId
                     && x.Id == pagadorId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(VentaPagadorEntity), pagadorId);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<VentaEntity> ObtenerVentaEditableAsync(
        int ventaId,
        CancellationToken cancellationToken)
    {
        var venta = await dbContext.Ventas
            .FirstOrDefaultAsync(
                x => x.Id == ventaId && x.Activo,
                cancellationToken);

        if (venta is null)
            throw new NotFoundException(nameof(VentaEntity), ventaId);

        if (venta.Estado == EstadoVenta.Anulada)
        {
            throw new ConflictException(
                "No se puede modificar una venta anulada.");
        }

        return venta;
    }

    private async Task EnsureVentaExistsAsync(
        int ventaId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Ventas
            .AnyAsync(x => x.Id == ventaId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(VentaEntity), ventaId);
    }

    private async Task ValidarYVerificarUnicidadAsync(
        int ventaId,
        TipoPagador tipo,
        int? convenioId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        if (tipo == TipoPagador.Convenio)
        {
            if (convenioId is null)
            {
                throw new ConflictException(
                    "El convenio es obligatorio para un pagador de convenio.");
            }

            var existeConvenio = await dbContext.Convenios.AnyAsync(
                x => x.Id == convenioId && x.Activo,
                cancellationToken);

            if (!existeConvenio)
                throw new NotFoundException(nameof(Convenio), convenioId.Value);

            var existePagador = await dbContext.VentaPagadores.AnyAsync(
                x => x.VentaId == ventaId
                     && x.Id != excludeId
                     && x.Tipo == TipoPagador.Convenio
                     && x.ConvenioId == convenioId
                     && x.Activo,
                cancellationToken);

            if (existePagador)
            {
                throw new ConflictException(
                    "La venta ya tiene un pagador con ese convenio.");
            }

            return;
        }

        var existePaciente = await dbContext.VentaPagadores.AnyAsync(
            x => x.VentaId == ventaId
                 && x.Id != excludeId
                 && x.Tipo == TipoPagador.Paciente
                 && x.Activo,
            cancellationToken);

        if (existePaciente)
        {
            throw new ConflictException(
                "La venta ya tiene un pagador de tipo paciente.");
        }
    }
}
