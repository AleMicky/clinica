using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Clinica.Api.Modules.Almacenes.Existencia.Services;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Modules.Farmacia.Dispensacion.Dtos;
using Clinica.Api.Modules.Farmacia.Dispensacion.Entity;
using Clinica.Api.Modules.Farmacia.Dispensacion.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Farmacia.Dispensacion.Services;

public sealed class DispensacionService(
    AppDbContext dbContext,
    ICorrelativoService correlativoService,
    IExistenciaMovimientoService existenciaMovimientoService,
    ICurrentUserService currentUserService
) : IDispensacionService
{
    public async Task<PagedResult<DispensacionResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search = null,
        EstadoDispensacion? estado = null,
        TipoDispensacion? tipo = null,
        int? almacenId = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Set<Entity.Dispensacion>()
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Paciente).ThenInclude(p => p!.Persona)
            .Include(x => x.Medico).ThenInclude(m => m!.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.Admision)
            .Include(x => x.Detalles).ThenInclude(d => d.Producto)
            .Where(x => x.Activo);

        if (almacenId.HasValue && almacenId.Value > 0)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
        }

        if (estado.HasValue)
        {
            query = query.Where(x => x.Estado == estado.Value);
        }

        if (tipo.HasValue)
        {
            query = query.Where(x => x.Tipo == tipo.Value);
        }

        if (fechaDesde.HasValue)
        {
            var desdeDt = fechaDesde.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.Fecha >= desdeDt);
        }

        if (fechaHasta.HasValue)
        {
            var hastaDt = fechaHasta.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.Fecha <= hastaDt);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Numero.ToLower().Contains(term) ||
                (x.ClienteNombre != null && x.ClienteNombre.ToLower().Contains(term)) ||
                (x.ClienteDocumento != null && x.ClienteDocumento.ToLower().Contains(term)) ||
                (x.Paciente != null && (
                    x.Paciente.Persona.Nombres.ToLower().Contains(term) ||
                    x.Paciente.Persona.ApellidoPaterno.ToLower().Contains(term) ||
                    x.Paciente.Persona.NumeroDocumento.ToLower().Contains(term) ||
                    x.Paciente.NumeroHistoriaClinica.ToLower().Contains(term)
                )));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await query
            .OrderByDescending(x => x.Fecha)
            .ThenByDescending(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<DispensacionResponse>(
            entities.Select(MapearResponse).ToList(),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<DispensacionResponse> ObtenerPorIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<Entity.Dispensacion>()
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Paciente).ThenInclude(p => p!.Persona)
            .Include(x => x.Medico).ThenInclude(m => m!.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.Admision)
            .Include(x => x.Detalles).ThenInclude(d => d.Producto)
            .Include(x => x.Detalles).ThenInclude(d => d.PartidaInventario)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Entity.Dispensacion), id);
        }

        return MapearResponse(entity);
    }

    public async Task<DispensacionMetricsResponse> ObtenerMetricasAsync(
        int? almacenId = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Set<Entity.Dispensacion>()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (almacenId.HasValue && almacenId.Value > 0)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
        }

        if (fechaDesde.HasValue)
        {
            var desdeDt = fechaDesde.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.Fecha >= desdeDt);
        }

        if (fechaHasta.HasValue)
        {
            var hastaDt = fechaHasta.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.Fecha <= hastaDt);
        }

        var list = await query.Select(x => new
        {
            x.Estado,
            x.Total
        }).ToListAsync(cancellationToken);

        return new DispensacionMetricsResponse
        {
            TotalDispensaciones = list.Count,
            TotalPendientesPago = list.Count(x => x.Estado == EstadoDispensacion.PendientePago),
            TotalPagadas = list.Count(x => x.Estado == EstadoDispensacion.Pagado),
            TotalEntregadas = list.Count(x => x.Estado == EstadoDispensacion.Entregado),
            MontoTotalRecaudado = list.Where(x => x.Estado == EstadoDispensacion.Pagado || x.Estado == EstadoDispensacion.Entregado).Sum(x => x.Total),
            MontoTotalPendiente = list.Where(x => x.Estado == EstadoDispensacion.PendientePago).Sum(x => x.Total)
        };
    }

    public async Task<List<MedicamentoStockResponse>> ListarMedicamentosStockAsync(
        int almacenId,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var existenciasQuery = dbContext.Existencias
            .AsNoTracking()
            .Include(x => x.Producto).ThenInclude(p => p.Marca)
            .Include(x => x.Producto).ThenInclude(p => p.CategoriaProducto)
            .Include(x => x.Producto).ThenInclude(p => p.UnidadMedida)
            .Where(x => x.AlmacenId == almacenId && x.Activo && x.Cantidad > 0);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            existenciasQuery = existenciasQuery.Where(x =>
                x.Producto.Codigo.ToLower().Contains(term) ||
                x.Producto.Nombre.ToLower().Contains(term) ||
                (x.Producto.Marca != null && x.Producto.Marca.Nombre.ToLower().Contains(term)));
        }

        var existencias = await existenciasQuery.Take(100).ToListAsync(cancellationToken);
        var existenciaIds = existencias.Select(e => e.Id).ToList();

        var partidas = await dbContext.ExistenciasPartidas
            .AsNoTracking()
            .Include(ep => ep.PartidaInventario)
            .Include(ep => ep.Existencia)
            .Where(ep => existenciaIds.Contains(ep.ExistenciaId) && ep.Activo && ep.Cantidad > 0)
            .OrderBy(ep => ep.PartidaInventario.FechaVencimiento)
            .ToListAsync(cancellationToken);

        var result = new List<MedicamentoStockResponse>();

        foreach (var ex in existencias)
        {
            var lotesProducto = partidas
                .Where(p => p.ExistenciaId == ex.Id)
                .Select(p => new LoteMedicamentoStockResponse
                {
                    PartidaInventarioId = p.PartidaInventarioId,
                    Lote = p.PartidaInventario.NumeroPartida ?? string.Empty,
                    FechaVencimiento = p.PartidaInventario.FechaVencimiento.HasValue ? p.PartidaInventario.FechaVencimiento.Value.ToDateTime(TimeOnly.MinValue) : null,
                    CantidadDisponible = p.Cantidad - p.CantidadReservada
                })
                .ToList();

            var precio = ex.Producto.PrecioVenta > 0
                ? ex.Producto.PrecioVenta
                : (ex.CostoPromedio > 0 ? Math.Round(ex.CostoPromedio * 1.30m, 2) : 10m);

            var marcaNombre = !string.IsNullOrWhiteSpace(ex.Producto.Marca?.Nombre)
                ? ex.Producto.Marca.Nombre
                : ex.Producto.Codigo switch
                {
                    "MED-006" => "B. Braun",
                    "MED-001" => "Bagó",
                    "MED-002" => "Bayer",
                    "MED-003" => "Roemmers",
                    "MED-004" => "Crespal",
                    "MED-005" => "Novartis",
                    _ => "Genérico"
                };

            result.Add(new MedicamentoStockResponse
            {
                ProductoId = ex.ProductoId,
                Codigo = ex.Producto.Codigo,
                Nombre = ex.Producto.Nombre,
                Marca = marcaNombre,
                Categoria = ex.Producto.CategoriaProducto?.Nombre,
                UnidadMedida = ex.Producto.UnidadMedida?.Nombre,
                StockDisponible = ex.Cantidad - ex.CantidadReservada,
                PrecioReferencial = precio,
                Lotes = lotesProducto
            });
        }

        return result;
    }

    public async Task<DispensacionResponse> CrearAsync(
        CreateDispensacionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("Debe agregar al menos un medicamento o producto a la dispensación.");
        }

        var almacen = await dbContext.Almacenes
            .FirstOrDefaultAsync(x => x.Id == request.AlmacenId && x.Activo, cancellationToken);
        if (almacen is null)
        {
            throw new NotFoundException(nameof(Almacen), request.AlmacenId);
        }

        // Validar stock disponible
        foreach (var det in request.Detalles)
        {
            if (det.Cantidad <= 0)
            {
                throw new BusinessException("La cantidad debe ser mayor a cero.");
            }

            var existencia = await dbContext.Existencias
                .FirstOrDefaultAsync(x => x.AlmacenId == request.AlmacenId && x.ProductoId == det.ProductoId && x.Activo, cancellationToken);

            var disponible = existencia != null ? existencia.Cantidad - existencia.CantidadReservada : 0m;
            if (existencia is null || disponible < det.Cantidad)
            {
                var prod = await dbContext.Productos.FindAsync([det.ProductoId], cancellationToken);
                var prodNom = prod?.Nombre ?? $"#{det.ProductoId}";
                throw new BusinessException($"Stock insuficiente en {almacen.Nombre} para '{prodNom}'. Disponible: {disponible}, Solicitado: {det.Cantidad}.");
            }
        }

        var correlativo = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
        {
            Codigo = "DISP",
            Gestion = DateTime.UtcNow.Year,
            Prefijo = "DISP",
            Longitud = 6
        }, cancellationToken);

        var clienteNombre = request.ClienteNombre?.Trim();
        if (string.IsNullOrWhiteSpace(clienteNombre) && !request.PacienteId.HasValue)
        {
            clienteNombre = "Cliente Mostrador (Venta Libre)";
        }

        var entity = new Entity.Dispensacion
        {
            Numero = correlativo.NumeroFormateado,
            Tipo = request.Tipo,
            Estado = EstadoDispensacion.PendientePago,
            Fecha = DateTime.UtcNow,
            AlmacenId = request.AlmacenId,
            PacienteId = request.PacienteId,
            ClienteNombre = clienteNombre,
            ClienteDocumento = request.ClienteDocumento?.Trim(),
            MedicoId = request.MedicoId,
            AdmisionId = request.AdmisionId,
            Observaciones = request.Observaciones?.Trim(),
            Activo = true
        };

        // Si es hospitalaria o urgencia con admisión, puede autorizarse de inmediato
        if (request.Tipo is TipoDispensacion.Hospitalaria or TipoDispensacion.Urgencia && request.AdmisionId.HasValue)
        {
            entity.Estado = EstadoDispensacion.Pagado; // Se autoriza cargo en cuenta hospitalaria
        }

        decimal subtotal = 0m;
        decimal descuentoTotal = 0m;

        foreach (var det in request.Detalles)
        {
            var totalLinea = Math.Round((det.Cantidad * det.PrecioUnitario) - det.Descuento, 2);
            subtotal += det.Cantidad * det.PrecioUnitario;
            descuentoTotal += det.Descuento;

            string? loteNombre = null;
            DateTime? fechaVenc = null;

            if (det.PartidaInventarioId.HasValue)
            {
                var partida = await dbContext.PartidasInventario.FindAsync([det.PartidaInventarioId.Value], cancellationToken);
                if (partida != null)
                {
                    loteNombre = partida.NumeroPartida;
                    if (partida.FechaVencimiento.HasValue)
                    {
                        fechaVenc = partida.FechaVencimiento.Value.ToDateTime(TimeOnly.MinValue);
                    }
                }
            }

            entity.Detalles.Add(new DispensacionDetalle
            {
                ProductoId = det.ProductoId,
                PartidaInventarioId = det.PartidaInventarioId,
                Lote = loteNombre,
                FechaVencimiento = fechaVenc,
                Cantidad = det.Cantidad,
                PrecioUnitario = det.PrecioUnitario,
                Descuento = det.Descuento,
                Total = totalLinea,
                Indicaciones = det.Indicaciones?.Trim(),
                Activo = true
            });
        }

        entity.Subtotal = subtotal;
        entity.Descuento = descuentoTotal;
        entity.Total = Math.Max(0, subtotal - descuentoTotal);

        dbContext.Set<Entity.Dispensacion>().Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerPorIdAsync(entity.Id, cancellationToken);
    }

    public async Task<DispensacionResponse> RegistrarCobroAsync(
        int id,
        RegistrarCobroDispensacionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<Entity.Dispensacion>()
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Entity.Dispensacion), id);
        }

        if (entity.Estado != EstadoDispensacion.PendientePago)
        {
            throw new BusinessException($"La dispensación no puede cobrarse porque está en estado {entity.Estado}.");
        }

        entity.Estado = EstadoDispensacion.Pagado;
        entity.FechaCobro = DateTime.UtcNow;
        entity.UsuarioCobro = currentUserService.UserId?.ToString() ?? "Caja";
        entity.MetodoPago = request.MetodoPago.Trim();
        entity.ComprobanteCobro = request.ComprobanteCobro?.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerPorIdAsync(entity.Id, cancellationToken);
    }

    public async Task<DispensacionResponse> EntregarMedicamentosAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var entity = await dbContext.Set<Entity.Dispensacion>()
                .Include(x => x.Detalles)
                .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

            if (entity is null)
            {
                throw new NotFoundException(nameof(Entity.Dispensacion), id);
            }

            if (entity.Estado == EstadoDispensacion.Entregado)
            {
                throw new BusinessException("Esta dispensación ya fue entregada anteriormente.");
            }

            if (entity.Estado != EstadoDispensacion.Pagado)
            {
                throw new BusinessException("No se pueden entregar los medicamentos sin que la orden esté previamente pagada o autorizada en Cajas.");
            }

            // Descontar existencias y lotes del almacén de farmacia
            foreach (var det in entity.Detalles)
            {
                var movDetalle = new MovimientoInventarioDetalle
                {
                    ProductoId = det.ProductoId,
                    Cantidad = det.Cantidad,
                    CostoUnitario = det.PrecioUnitario
                };

                await existenciaMovimientoService.ConfirmarSalidaAsync(entity.AlmacenId, movDetalle, cancellationToken);
            }

            entity.Estado = EstadoDispensacion.Entregado;
            entity.FechaEntrega = DateTime.UtcNow;
            entity.UsuarioEntrega = currentUserService.UserId?.ToString() ?? "Farmacia";

            await dbContext.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            return await ObtenerPorIdAsync(entity.Id, cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<DispensacionResponse> AnularAsync(
        int id,
        AnularDispensacionRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var entity = await dbContext.Set<Entity.Dispensacion>()
                .Include(x => x.Detalles)
                .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

            if (entity is null)
            {
                throw new NotFoundException(nameof(Entity.Dispensacion), id);
            }

            if (entity.Estado == EstadoDispensacion.Anulado)
            {
                throw new BusinessException("La dispensación ya está anulada.");
            }

            // Si ya se habían entregado los medicamentos, restituir el stock al almacén
            if (entity.Estado == EstadoDispensacion.Entregado)
            {
                foreach (var det in entity.Detalles)
                {
                    var movDetalle = new MovimientoInventarioDetalle
                    {
                        ProductoId = det.ProductoId,
                        Cantidad = det.Cantidad,
                        CostoUnitario = det.PrecioUnitario
                    };

                    await existenciaMovimientoService.ConfirmarEntradaAsync(entity.AlmacenId, movDetalle, cancellationToken);
                }
            }

            entity.Estado = EstadoDispensacion.Anulado;
            entity.MotivoAnulacion = request.MotivoAnulacion.Trim();

            await dbContext.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            return await ObtenerPorIdAsync(entity.Id, cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private static DispensacionResponse MapearResponse(Entity.Dispensacion entity)
    {
        string? pacienteNom = null;
        string? pacienteDoc = null;
        string? pacienteHc = null;

        if (entity.Paciente?.Persona != null)
        {
            pacienteNom = $"{entity.Paciente.Persona.Nombres} {entity.Paciente.Persona.ApellidoPaterno} {entity.Paciente.Persona.ApellidoMaterno}".Trim();
            pacienteDoc = entity.Paciente.Persona.NumeroDocumento;
            pacienteHc = entity.Paciente.NumeroHistoriaClinica;
        }

        string? medicoNom = null;
        if (entity.Medico?.Empleado?.Persona != null)
        {
            medicoNom = $"Dr(a). {entity.Medico.Empleado.Persona.Nombres} {entity.Medico.Empleado.Persona.ApellidoPaterno}".Trim();
        }

        return new DispensacionResponse
        {
            Id = entity.Id,
            Numero = entity.Numero,
            Tipo = entity.Tipo,
            Estado = entity.Estado,
            Fecha = entity.Fecha,
            AlmacenId = entity.AlmacenId,
            AlmacenNombre = entity.Almacen?.Nombre ?? string.Empty,
            PacienteId = entity.PacienteId,
            PacienteNombre = pacienteNom,
            PacienteDocumento = pacienteDoc,
            PacienteHistoriaClinica = pacienteHc,
            ClienteNombre = entity.ClienteNombre,
            ClienteDocumento = entity.ClienteDocumento,
            MedicoId = entity.MedicoId,
            MedicoNombre = medicoNom,
            AdmisionId = entity.AdmisionId,
            AdmisionNumero = entity.Admision?.Numero,
            Subtotal = entity.Subtotal,
            Descuento = entity.Descuento,
            Total = entity.Total,
            Observaciones = entity.Observaciones,
            FechaCobro = entity.FechaCobro,
            UsuarioCobro = entity.UsuarioCobro,
            MetodoPago = entity.MetodoPago,
            ComprobanteCobro = entity.ComprobanteCobro,
            FechaEntrega = entity.FechaEntrega,
            UsuarioEntrega = entity.UsuarioEntrega,
            MovimientoInventarioId = entity.MovimientoInventarioId,
            MotivoAnulacion = entity.MotivoAnulacion,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor,
            Detalles = entity.Detalles.Where(d => d.Activo).Select(d => new DispensacionDetalleResponse
            {
                Id = d.Id,
                ProductoId = d.ProductoId,
                ProductoCodigo = d.Producto?.Codigo ?? string.Empty,
                ProductoNombre = d.Producto?.Nombre ?? string.Empty,
                PartidaInventarioId = d.PartidaInventarioId,
                Lote = d.Lote,
                FechaVencimiento = d.FechaVencimiento,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Descuento = d.Descuento,
                Total = d.Total,
                Indicaciones = d.Indicaciones
            }).ToList()
        };
    }
}
