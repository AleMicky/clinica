using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Clinica.Api.Modules.Almacenes.Existencia.Services;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Modules.Cajas.Cobro.Enums;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Farmacia.Dispensacion.Dtos;
using Clinica.Api.Modules.Farmacia.Dispensacion.Entity;
using Clinica.Api.Modules.Farmacia.Dispensacion.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Enums;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Modules.Servicios.CategoriaServicio.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Modules.Ventas.Venta.Enums;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Farmacia.Dispensacion.Services;

public sealed class DispensacionService(
    AppDbContext dbContext,
    ICorrelativoService correlativoService,
    IExistenciaMovimientoService existenciaMovimientoService,
    IMovimientoInventarioService movimientoInventarioService,
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
            .Include(x => x.MovimientoInventario)
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
            .Include(x => x.MovimientoInventario)
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
            .Include(x => x.Producto)
                .ThenInclude(p => p.Marca)
            .Include(x => x.Producto)
                .ThenInclude(p => p.CategoriaProducto)
            .Include(x => x.Producto)
                .ThenInclude(p => p.UnidadMedida)
            .Where(x => x.AlmacenId == almacenId && x.Activo && x.Cantidad > 0);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var pattern = $"%{term}%";
            existenciasQuery = existenciasQuery.Where(x =>
                EF.Functions.Like(x.Producto.Nombre ?? string.Empty, pattern) ||
                EF.Functions.Like(x.Producto.Codigo ?? string.Empty, pattern) ||
                EF.Functions.Like(x.Producto.Marca != null ? x.Producto.Marca.Nombre ?? string.Empty : string.Empty, pattern) ||
                EF.Functions.Like(x.Producto.CategoriaProducto != null ? x.Producto.CategoriaProducto.Nombre ?? string.Empty : string.Empty, pattern));
        }

        var existencias = await existenciasQuery
            .OrderBy(x => x.Producto.Nombre)
            .ToListAsync(cancellationToken);

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
                    CantidadFisica = p.Cantidad,
                    CantidadReservada = p.CantidadReservada,
                    CantidadDisponible = Math.Max(0m, p.Cantidad - p.CantidadReservada)
                })
                .ToList();

            var precio = ex.Producto.PrecioVenta > 0
                ? ex.Producto.PrecioVenta
                : (ex.CostoPromedio > 0 ? Math.Round(ex.CostoPromedio * 1.30m, 2) : 0m);

            result.Add(new MedicamentoStockResponse
            {
                ProductoId = ex.ProductoId,
                Codigo = ex.Producto.Codigo ?? string.Empty,
                Nombre = ex.Producto.Nombre ?? string.Empty,
                Marca = ex.Producto.Marca?.Nombre ?? string.Empty,
                Categoria = ex.Producto.CategoriaProducto?.Nombre,
                UnidadMedida = ex.Producto.UnidadMedida?.Nombre,
                StockFisico = ex.Cantidad,
                StockReservado = ex.CantidadReservada,
                StockDisponible = Math.Max(0m, ex.Cantidad - ex.CantidadReservada),
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

        var ownsTransaction = dbContext.Database.CurrentTransaction is null;
        await using var tx = ownsTransaction
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
        try
        {
            var almacen = await dbContext.Almacenes
                .FirstOrDefaultAsync(x => x.Id == request.AlmacenId && x.Activo, cancellationToken);
            if (almacen is null)
            {
                throw new NotFoundException(nameof(Almacen), request.AlmacenId);
            }

            // Validar stock disponible por producto (agrupando por producto y lote) y reservar existencias
            var agrupadoPorProducto = request.Detalles
                .GroupBy(d => d.ProductoId)
                .Select(g => new { ProductoId = g.Key, CantidadTotal = g.Sum(x => x.Cantidad) })
                .ToList();

            foreach (var grupo in agrupadoPorProducto)
            {
                if (grupo.CantidadTotal <= 0)
                {
                    throw new BusinessException("La cantidad debe ser mayor a cero.");
                }

                var existencia = await dbContext.Existencias
                    .FirstOrDefaultAsync(x => x.AlmacenId == request.AlmacenId && x.ProductoId == grupo.ProductoId && x.Activo, cancellationToken);

                var disponible = existencia != null ? existencia.Cantidad - existencia.CantidadReservada : 0m;
                if (existencia is null || disponible < grupo.CantidadTotal)
                {
                    var prod = await dbContext.Productos.FindAsync([grupo.ProductoId], cancellationToken);
                    var prodNom = prod?.Nombre ?? $"#{grupo.ProductoId}";
                    throw new BusinessException($"Stock insuficiente en {almacen.Nombre} para '{prodNom}'. Disponible: {disponible}, Solicitado: {grupo.CantidadTotal}.");
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
                Fecha = request.Fecha.HasValue ? request.Fecha.Value.ToUniversalTime() : DateTime.UtcNow,
                AlmacenId = request.AlmacenId,
                PacienteId = request.PacienteId,
                ClienteNombre = clienteNombre,
                ClienteDocumento = request.ClienteDocumento?.Trim(),
                MedicoId = request.MedicoId,
                AdmisionId = request.AdmisionId,
                Observaciones = request.Observaciones?.Trim(),
                Activo = true
            };

            // Si es hospitalaria o urgencia con admisión, puede autorizarse de inmediato con cargo a la admisión
            if (request.Tipo is TipoDispensacion.Hospitalaria or TipoDispensacion.Urgencia && request.AdmisionId.HasValue)
            {
                entity.Estado = EstadoDispensacion.Pagado;
            }

            decimal subtotal = 0m;
            decimal descuentoTotal = 0m;

            foreach (var det in request.Detalles)
            {
                if (det.Cantidad <= 0)
                {
                    throw new BusinessException("La cantidad de cada ítem debe ser mayor a cero.");
                }

                var totalLinea = Math.Round((det.Cantidad * det.PrecioUnitario) - det.Descuento, 2);
                subtotal += det.Cantidad * det.PrecioUnitario;
                descuentoTotal += det.Descuento;

                string? loteNombre = null;
                DateTime? fechaVenc = null;

                var existencia = await dbContext.Existencias
                    .FirstAsync(x => x.AlmacenId == request.AlmacenId && x.ProductoId == det.ProductoId && x.Activo, cancellationToken);

                // Reservar en Existencia general
                existencia.CantidadReservada += det.Cantidad;

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

                    var existenciaPartida = await dbContext.ExistenciasPartidas
                        .FirstOrDefaultAsync(
                            ep => ep.ExistenciaId == existencia.Id &&
                                  ep.PartidaInventarioId == det.PartidaInventarioId.Value &&
                                  ep.Activo,
                            cancellationToken);

                    if (existenciaPartida != null)
                    {
                        var dispLote = existenciaPartida.Cantidad - existenciaPartida.CantidadReservada;
                        if (dispLote < det.Cantidad)
                        {
                            throw new BusinessException($"El lote '{loteNombre ?? det.PartidaInventarioId.Value.ToString()}' solo tiene {dispLote} unidades disponibles.");
                        }

                        existenciaPartida.CantidadReservada += det.Cantidad;
                    }
                }
                else
                {
                    // Reservar por FEFO en ExistenciasPartidas si no se eligió lote específico
                    var partidasDisponibles = await dbContext.ExistenciasPartidas
                        .Include(ep => ep.PartidaInventario)
                        .Where(ep => ep.ExistenciaId == existencia.Id && ep.Activo && ep.Cantidad > ep.CantidadReservada)
                        .OrderBy(ep => ep.PartidaInventario.FechaVencimiento ?? DateOnly.MaxValue)
                        .ThenBy(ep => ep.Id)
                        .ToListAsync(cancellationToken);

                    decimal porReservar = det.Cantidad;
                    foreach (var ep in partidasDisponibles)
                    {
                        if (porReservar <= 0m) break;
                        var dispEp = ep.Cantidad - ep.CantidadReservada;
                        if (dispEp <= 0m) continue;

                        var reservaEp = Math.Min(porReservar, dispEp);
                        ep.CantidadReservada += reservaEp;
                        porReservar -= reservaEp;

                        if (loteNombre is null)
                        {
                            loteNombre = ep.PartidaInventario.NumeroPartida;
                            if (ep.PartidaInventario.FechaVencimiento.HasValue)
                            {
                                fechaVenc = ep.PartidaInventario.FechaVencimiento.Value.ToDateTime(TimeOnly.MinValue);
                            }
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

            // Integración con Cobranza / Admisión
            if (entity.Estado == EstadoDispensacion.PendientePago && entity.Total > 0)
            {
                await GenerarCobroPendienteEnCajaAsync(entity, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            else if (entity.AdmisionId.HasValue && entity.Total > 0)
            {
                await AgregarCargoHospitalarioEnAdmisionAsync(entity, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            if (tx is not null)
            {
                await tx.CommitAsync(cancellationToken);
            }

            return await ObtenerPorIdAsync(entity.Id, cancellationToken);
        }
        catch
        {
            if (tx is not null)
            {
                await tx.RollbackAsync(cancellationToken);
            }
            throw;
        }
    }

    public async Task<DispensacionResponse> RegistrarCobroAsync(
        int id,
        RegistrarCobroDispensacionRequest request,
        CancellationToken cancellationToken = default)
    {
        var ownsTransaction = dbContext.Database.CurrentTransaction is null;
        await using var tx = ownsTransaction
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
        try
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

            var metodoPagoTexto = string.IsNullOrWhiteSpace(request.MetodoPago)
                ? "Efectivo"
                : request.MetodoPago.Trim();

            var comprobante = request.ComprobanteCobro?.Trim();

            // Integrar con Cobros y MovimientosCaja del Turno de Caja activo
            var comprobanteGenerado = await ProcesarCobroEnCajaAsync(
                entity,
                metodoPagoTexto,
                comprobante,
                cancellationToken);

            if (string.IsNullOrWhiteSpace(comprobante))
            {
                comprobante = comprobanteGenerado;
            }

            if (string.IsNullOrWhiteSpace(comprobante))
            {
                var corrRecibo = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
                {
                    Codigo = "REC",
                    Gestion = DateTime.UtcNow.Year,
                    Prefijo = "REC",
                    Longitud = 6
                }, cancellationToken);
                comprobante = corrRecibo.NumeroFormateado;
            }

            entity.Estado = EstadoDispensacion.Pagado;
            entity.FechaCobro = DateTime.UtcNow;
            entity.UsuarioCobro = currentUserService.UserName ?? currentUserService.UserId?.ToString() ?? "Caja";
            entity.MetodoPago = metodoPagoTexto;
            entity.ComprobanteCobro = comprobante;

            await dbContext.SaveChangesAsync(cancellationToken);
            if (tx is not null)
            {
                await tx.CommitAsync(cancellationToken);
            }

            return await ObtenerPorIdAsync(entity.Id, cancellationToken);
        }
        catch
        {
            if (tx is not null)
            {
                await tx.RollbackAsync(cancellationToken);
            }
            throw;
        }
    }

    public async Task<DispensacionResponse> EntregarMedicamentosAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var ownsTransaction = dbContext.Database.CurrentTransaction is null;
        await using var tx = ownsTransaction
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
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

            var detallesActivos = entity.Detalles.Where(d => d.Activo).ToList();
            if (detallesActivos.Count == 0)
            {
                throw new BusinessException("La dispensación no tiene detalles activos para entregar.");
            }

            // 1. Liberar la reserva previa de existencias y lotes antes de ejecutar el movimiento de salida
            await LiberarReservaStockDispensacionAsync(entity.AlmacenId, detallesActivos, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            // 2. Asegurar que exista el TipoMovimientoInventario correspondiente
            var codigoTipoMov = entity.Tipo == TipoDispensacion.VentaAmbulatoria
                ? "DESPACHO_VENTA"
                : "DISPENSACION_PACIENTE";

            await AsegurarTipoMovimientoInventarioAsync(codigoTipoMov, NaturalezaMovimiento.Salida, cancellationToken);

            // 3. Generar y confirmar el Movimiento de Inventario oficial (actualiza Existencias, ExistenciasPartidas y Kárdex)
            var detallesMovimiento = detallesActivos.Select(det => new MovimientoInventarioDetalleRequest
            {
                ProductoId = det.ProductoId,
                Cantidad = det.Cantidad,
                CostoUnitario = det.PrecioUnitario,
                PartidaInventarioId = det.PartidaInventarioId
            }).ToList();

            var requestIntegracion = new MovimientoInventarioIntegracionRequest
            {
                TipoMovimiento = codigoTipoMov,
                AlmacenId = entity.AlmacenId,
                Fecha = DateTime.UtcNow,
                TipoReferencia = "DISPENSACION",
                ReferenciaId = entity.Id,
                Observacion = $"Entrega de medicamentos - Dispensación {entity.Numero} ({entity.ClienteNombre ?? "Paciente"})",
                Detalles = detallesMovimiento
            };

            var movimientoCreado = await movimientoInventarioService.CrearIntegracionAsync(
                requestIntegracion,
                confirmar: true,
                cancellationToken);

            entity.MovimientoInventarioId = movimientoCreado.Id;
            entity.Estado = EstadoDispensacion.Entregado;
            entity.FechaEntrega = DateTime.UtcNow;
            entity.UsuarioEntrega = currentUserService.UserName ?? currentUserService.UserId?.ToString() ?? "Farmacia";

            await dbContext.SaveChangesAsync(cancellationToken);
            if (tx is not null)
            {
                await tx.CommitAsync(cancellationToken);
            }

            return await ObtenerPorIdAsync(entity.Id, cancellationToken);
        }
        catch
        {
            if (tx is not null)
            {
                await tx.RollbackAsync(cancellationToken);
            }
            throw;
        }
    }

    public async Task<DispensacionResponse> AnularAsync(
        int id,
        AnularDispensacionRequest request,
        CancellationToken cancellationToken = default)
    {
        var ownsTransaction = dbContext.Database.CurrentTransaction is null;
        await using var tx = ownsTransaction
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
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

            var motivo = request.MotivoAnulacion.Trim();
            var detallesActivos = entity.Detalles.Where(d => d.Activo).ToList();

            if (entity.Estado == EstadoDispensacion.Entregado)
            {
                // Si ya se habían entregado los medicamentos, anular el movimiento de inventario asociado
                // o restituir existencias si no tenía MovimientoInventarioId
                if (entity.MovimientoInventarioId.HasValue)
                {
                    await movimientoInventarioService.AnularAsync(
                        entity.MovimientoInventarioId.Value,
                        new AnularMovimientoInventarioRequest
                        {
                            MotivoAnulacion = $"Anulación de dispensación {entity.Numero}: {motivo}"
                        },
                        cancellationToken);
                }
                else
                {
                    await RestituirStockDirectoAsync(entity.AlmacenId, detallesActivos, cancellationToken);
                }
            }
            else if (entity.Estado is EstadoDispensacion.PendientePago or EstadoDispensacion.Pagado)
            {
                // Si aún no fue entregada físicamente, liberar el stock que estaba reservado
                await LiberarReservaStockDispensacionAsync(entity.AlmacenId, detallesActivos, cancellationToken);
            }

            // Revertir / Anular cobro y registrar egreso por devolución en Caja si ya se había cobrado
            await RevertirCobroEnCajaAsync(entity, motivo, cancellationToken);

            entity.Estado = EstadoDispensacion.Anulado;
            entity.MotivoAnulacion = motivo;

            await dbContext.SaveChangesAsync(cancellationToken);
            if (tx is not null)
            {
                await tx.CommitAsync(cancellationToken);
            }

            return await ObtenerPorIdAsync(entity.Id, cancellationToken);
        }
        catch
        {
            if (tx is not null)
            {
                await tx.RollbackAsync(cancellationToken);
            }
            throw;
        }
    }

    // ========================================================================
    // MÉTODOS PRIVADOS DE INTEGRACIÓN CON EXISTENCIAS Y ALMACÉN
    // ========================================================================

    private async Task LiberarReservaStockDispensacionAsync(
        int almacenId,
        List<DispensacionDetalle> detalles,
        CancellationToken cancellationToken)
    {
        foreach (var det in detalles)
        {
            var existencia = await dbContext.Existencias
                .FirstOrDefaultAsync(
                    x => x.AlmacenId == almacenId && x.ProductoId == det.ProductoId && x.Activo,
                    cancellationToken);

            if (existencia is null) continue;

            existencia.CantidadReservada = Math.Max(0m, existencia.CantidadReservada - det.Cantidad);

            if (det.PartidaInventarioId.HasValue)
            {
                var ep = await dbContext.ExistenciasPartidas
                    .FirstOrDefaultAsync(
                        x => x.ExistenciaId == existencia.Id &&
                             x.PartidaInventarioId == det.PartidaInventarioId.Value &&
                             x.Activo,
                        cancellationToken);

                if (ep != null)
                {
                    ep.CantidadReservada = Math.Max(0m, ep.CantidadReservada - det.Cantidad);
                }
            }
            else
            {
                var partidasReservadas = await dbContext.ExistenciasPartidas
                    .Include(x => x.PartidaInventario)
                    .Where(x => x.ExistenciaId == existencia.Id && x.Activo && x.CantidadReservada > 0)
                    .OrderBy(x => x.PartidaInventario.FechaVencimiento ?? DateOnly.MaxValue)
                    .ThenBy(x => x.Id)
                    .ToListAsync(cancellationToken);

                decimal porLiberar = det.Cantidad;
                foreach (var ep in partidasReservadas)
                {
                    if (porLiberar <= 0m) break;
                    var liberar = Math.Min(porLiberar, ep.CantidadReservada);
                    ep.CantidadReservada = Math.Max(0m, ep.CantidadReservada - liberar);
                    porLiberar -= liberar;
                }
            }
        }
    }

    private async Task RestituirStockDirectoAsync(
        int almacenId,
        List<DispensacionDetalle> detalles,
        CancellationToken cancellationToken)
    {
        foreach (var det in detalles)
        {
            var existencia = await dbContext.Existencias
                .FirstOrDefaultAsync(
                    x => x.AlmacenId == almacenId && x.ProductoId == det.ProductoId && x.Activo,
                    cancellationToken);

            if (existencia is null) continue;

            existencia.Cantidad += det.Cantidad;

            var ep = det.PartidaInventarioId.HasValue
                ? await dbContext.ExistenciasPartidas.FirstOrDefaultAsync(
                    x => x.ExistenciaId == existencia.Id &&
                         x.PartidaInventarioId == det.PartidaInventarioId.Value &&
                         x.Activo,
                    cancellationToken)
                : null;

            ep ??= await dbContext.ExistenciasPartidas
                .FirstOrDefaultAsync(x => x.ExistenciaId == existencia.Id && x.Activo, cancellationToken);

            if (ep != null)
            {
                ep.Cantidad += det.Cantidad;
            }
        }
    }

    private async Task AsegurarTipoMovimientoInventarioAsync(
        string codigo,
        NaturalezaMovimiento naturaleza,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.TiposMovimientoInventario
            .AnyAsync(x => x.Codigo == codigo && x.Activo, cancellationToken);

        if (existe) return;

        var nombre = codigo switch
        {
            "DESPACHO_VENTA" => "Salida por Venta Directa",
            "DISPENSACION_PACIENTE" => "Dispensación a Paciente",
            "DEVOLUCION_PACIENTE" => "Devolución de Paciente",
            _ => codigo
        };

        dbContext.TiposMovimientoInventario.Add(new TipoMovimientoInventario
        {
            Codigo = codigo,
            Nombre = nombre,
            Descripcion = $"Movimiento automático de farmacia ({nombre})",
            Naturaleza = naturaleza,
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // ========================================================================
    // MÉTODOS PRIVADOS DE INTEGRACIÓN CON COBRANZA Y CAJAS
    // ========================================================================

    private async Task<TurnoCaja?> ObtenerTurnoCajaAbiertoAsync(CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId.HasValue)
        {
            var empleadoId = await dbContext.Users
                .Where(u => u.Id == userId.Value)
                .Join(
                    dbContext.Empleados,
                    u => u.PersonaId,
                    e => e.PersonaId,
                    (_, e) => e.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (empleadoId > 0)
            {
                var turnoUsuario = await dbContext.TurnosCaja
                    .Include(t => t.Empleado)
                    .FirstOrDefaultAsync(
                        t => t.EmpleadoId == empleadoId &&
                             t.Estado == EstadoTurnoCaja.Abierto &&
                             t.Activo,
                        cancellationToken);

                if (turnoUsuario != null)
                {
                    return turnoUsuario;
                }
            }
        }

        // Si el usuario actual no tiene turno propio (ej. Farmacia / Admin), usar el turno de caja abierto activo
        return await dbContext.TurnosCaja
            .Include(t => t.Empleado)
            .Where(t => t.Estado == EstadoTurnoCaja.Abierto && t.Activo)
            .OrderByDescending(t => t.FechaHoraApertura)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Cobro?> GenerarCobroPendienteEnCajaAsync(
        Entity.Dispensacion dispensacion,
        CancellationToken cancellationToken)
    {
        var turnoCaja = await ObtenerTurnoCajaAbiertoAsync(cancellationToken);
        if (turnoCaja is null)
        {
            return null;
        }

        var monedaBase = await AsegurarMonedaBaseAsync(cancellationToken);
        var servicioFarmacia = await AsegurarServicioFarmaciaAsync(cancellationToken);
        var pacienteId = await ResolverPacienteParaVentaAsync(dispensacion, cancellationToken);
        var admisionId = await ResolverAdmisionParaVentaAsync(dispensacion, pacienteId, turnoCaja.EmpleadoId, servicioFarmacia.Id, cancellationToken);

        var corrVenta = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
        {
            Codigo = "VTA",
            Gestion = DateTime.UtcNow.Year,
            Prefijo = "VTA",
            Longitud = 6
        }, cancellationToken);

        var venta = new Venta
        {
            Numero = corrVenta.NumeroFormateado,
            AdmisionId = admisionId,
            PacienteId = pacienteId,
            VendedorId = turnoCaja.EmpleadoId,
            MonedaId = monedaBase.Id,
            Fecha = DateTime.UtcNow,
            Subtotal = dispensacion.Subtotal,
            Descuento = dispensacion.Descuento,
            Total = dispensacion.Total,
            Estado = EstadoVenta.PendienteCobro,
            Activo = true
        };

        venta.Detalles.Add(new VentaDetalle
        {
            ServicioId = servicioFarmacia.Id,
            MedicoId = dispensacion.MedicoId,
            Cantidad = 1m,
            PrecioUnitario = dispensacion.Subtotal,
            Descuento = dispensacion.Descuento,
            Total = dispensacion.Total,
            MontoMedico = 0m,
            MontoClinica = dispensacion.Total,
            Activo = true
        });

        var ventaPagador = new VentaPagador
        {
            Tipo = TipoPagador.Paciente,
            Monto = dispensacion.Total,
            Estado = EstadoVentaPagador.Pendiente,
            Activo = true
        };
        venta.Pagadores.Add(ventaPagador);

        dbContext.Ventas.Add(venta);
        await dbContext.SaveChangesAsync(cancellationToken);

        var corrCobro = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
        {
            Codigo = "COB",
            Gestion = DateTime.UtcNow.Year,
            Prefijo = "COB",
            Longitud = 6
        }, cancellationToken);

        var cobro = new Cobro
        {
            Numero = corrCobro.NumeroFormateado,
            TurnoCajaId = turnoCaja.Id,
            VentaPagadorId = ventaPagador.Id,
            FechaHora = DateTime.UtcNow,
            Total = 0m,
            Estado = EstadoCobro.Registrado,
            Observacion = $"Dispensación Farmacia {dispensacion.Numero} - {dispensacion.ClienteNombre ?? "Paciente"}",
            Activo = true
        };

        dbContext.Cobros.Add(cobro);
        await dbContext.SaveChangesAsync(cancellationToken);

        dispensacion.ComprobanteCobro = cobro.Numero;
        return cobro;
    }

    private async Task<string?> ProcesarCobroEnCajaAsync(
        Entity.Dispensacion dispensacion,
        string metodoPagoNombre,
        string? comprobanteManual,
        CancellationToken cancellationToken)
    {
        var turnoCaja = await ObtenerTurnoCajaAbiertoAsync(cancellationToken);
        if (turnoCaja is null)
        {
            return comprobanteManual;
        }

        var monedaBase = await AsegurarMonedaBaseAsync(cancellationToken);
        var metodoPago = await ResolverMetodoPagoAsync(metodoPagoNombre, cancellationToken);

        // Buscar si ya tenía un Cobro pendiente creado al registrar la dispensación
        var cobro = await dbContext.Cobros
            .Include(c => c.VentaPagador)
                .ThenInclude(vp => vp.Venta)
            .Include(c => c.Detalles)
            .FirstOrDefaultAsync(
                c => c.Activo &&
                     ((dispensacion.ComprobanteCobro != null && c.Numero == dispensacion.ComprobanteCobro) ||
                      (c.Observacion != null && c.Observacion.Contains(dispensacion.Numero))),
                cancellationToken);

        if (cobro is null)
        {
            cobro = await GenerarCobroPendienteEnCajaAsync(dispensacion, cancellationToken);
            if (cobro != null)
            {
                await dbContext.Entry(cobro).Reference(c => c.VentaPagador).LoadAsync(cancellationToken);
                if (cobro.VentaPagador != null)
                {
                    await dbContext.Entry(cobro.VentaPagador).Reference(vp => vp.Venta).LoadAsync(cancellationToken);
                }
            }
        }

        var referencia = !string.IsNullOrWhiteSpace(comprobanteManual)
            ? comprobanteManual
            : (cobro?.Numero ?? dispensacion.Numero);

        if (cobro != null && cobro.Estado == EstadoCobro.Registrado)
        {
            cobro.TurnoCajaId = turnoCaja.Id;
            cobro.FechaHora = DateTime.UtcNow;
            cobro.Total = dispensacion.Total;
            cobro.Estado = EstadoCobro.Confirmado;
            cobro.Observacion = $"Cobro Farmacia {dispensacion.Numero} ({metodoPagoNombre})";

            cobro.Detalles.Add(new CobroDetalle
            {
                CobroId = cobro.Id,
                MetodoPagoId = metodoPago.Id,
                MonedaId = monedaBase.Id,
                Monto = dispensacion.Total,
                TipoCambio = 1m,
                MontoMonedaBase = dispensacion.Total,
                Referencia = referencia,
                Observacion = $"Dispensación {dispensacion.Numero}",
                Activo = true
            });

            if (cobro.VentaPagador != null)
            {
                cobro.VentaPagador.Estado = EstadoVentaPagador.Pagado;
                if (cobro.VentaPagador.Venta != null)
                {
                    cobro.VentaPagador.Venta.Estado = EstadoVenta.Pagada;
                }
            }
        }

        // Registrar Movimiento de Caja (Ingreso por Farmacia)
        var (tipoIngreso, conceptoFarmacia) = await AsegurarConceptoCajaAsync(
            tipoCodigo: "ING",
            tipoNombre: "Ingreso a Caja",
            naturaleza: "ENTRADA",
            conceptoCodigo: "ING-FAR",
            conceptoNombre: "Cobro de Farmacia / Dispensación",
            cancellationToken);

        dbContext.MovimientosCaja.Add(new MovimientoCaja
        {
            TurnoCajaId = turnoCaja.Id,
            TipoMovimientoCajaId = tipoIngreso.Id,
            ConceptoMovimientoCajaId = conceptoFarmacia.Id,
            MonedaId = monedaBase.Id,
            FechaHora = DateTime.UtcNow,
            Monto = dispensacion.Total,
            TipoCambio = 1m,
            MontoMonedaBase = dispensacion.Total,
            NaturalezaAplicada = "ENTRADA",
            Referencia = referencia,
            Observacion = $"Cobro de dispensación {dispensacion.Numero} ({metodoPagoNombre}) - {dispensacion.ClienteNombre ?? "Paciente"}",
            Activo = true
        });

        return cobro?.Numero ?? referencia;
    }

    private async Task RevertirCobroEnCajaAsync(
        Entity.Dispensacion dispensacion,
        string motivoAnulacion,
        CancellationToken cancellationToken)
    {
        var cobro = await dbContext.Cobros
            .Include(c => c.VentaPagador)
                .ThenInclude(vp => vp.Venta)
            .FirstOrDefaultAsync(
                c => c.Activo &&
                     c.Estado != EstadoCobro.Anulado &&
                     ((dispensacion.ComprobanteCobro != null && c.Numero == dispensacion.ComprobanteCobro) ||
                      (c.Observacion != null && c.Observacion.Contains(dispensacion.Numero))),
                cancellationToken);

        if (cobro != null)
        {
            cobro.Estado = EstadoCobro.Anulado;
            cobro.MotivoAnulacion = $"Anulación de dispensación {dispensacion.Numero}: {motivoAnulacion}";
            cobro.FechaHoraAnulacion = DateTime.UtcNow;

            if (cobro.VentaPagador != null)
            {
                cobro.VentaPagador.Estado = EstadoVentaPagador.Anulado;
                if (cobro.VentaPagador.Venta != null)
                {
                    cobro.VentaPagador.Venta.Estado = EstadoVenta.Anulada;
                }
            }
        }

        // Si ya se había cobrado dinero, registrar el egreso por devolución/anulación en el turno activo
        if (dispensacion.FechaCobro.HasValue && dispensacion.Total > 0)
        {
            var turnoCaja = await ObtenerTurnoCajaAbiertoAsync(cancellationToken);
            if (turnoCaja != null)
            {
                var monedaBase = await AsegurarMonedaBaseAsync(cancellationToken);
                var (tipoEgreso, conceptoDevolucion) = await AsegurarConceptoCajaAsync(
                    tipoCodigo: "EGR",
                    tipoNombre: "Egreso de Caja",
                    naturaleza: "SALIDA",
                    conceptoCodigo: "EGR-DEV",
                    conceptoNombre: "Devolución / Reembolso",
                    cancellationToken);

                dbContext.MovimientosCaja.Add(new MovimientoCaja
                {
                    TurnoCajaId = turnoCaja.Id,
                    TipoMovimientoCajaId = tipoEgreso.Id,
                    ConceptoMovimientoCajaId = conceptoDevolucion.Id,
                    MonedaId = monedaBase.Id,
                    FechaHora = DateTime.UtcNow,
                    Monto = dispensacion.Total,
                    TipoCambio = 1m,
                    MontoMonedaBase = dispensacion.Total,
                    NaturalezaAplicada = "SALIDA",
                    Referencia = dispensacion.ComprobanteCobro ?? dispensacion.Numero,
                    Observacion = $"Anulación de dispensación {dispensacion.Numero}: {motivoAnulacion}",
                    Activo = true
                });
            }
        }
    }

    private async Task AgregarCargoHospitalarioEnAdmisionAsync(
        Entity.Dispensacion dispensacion,
        CancellationToken cancellationToken)
    {
        if (!dispensacion.AdmisionId.HasValue) return;

        var admision = await dbContext.Admisiones
            .Include(a => a.Detalles)
            .FirstOrDefaultAsync(a => a.Id == dispensacion.AdmisionId.Value && a.Activo, cancellationToken);

        if (admision is null || admision.Estado == EstadoAdmision.Cancelada) return;

        var servicioFarmacia = await AsegurarServicioFarmaciaAsync(cancellationToken);

        admision.Detalles.Add(new AdmisionDetalle
        {
            AdmisionId = admision.Id,
            ServicioId = servicioFarmacia.Id,
            MedicoId = dispensacion.MedicoId,
            Cantidad = 1m,
            PrecioUnitario = dispensacion.Subtotal,
            Descuento = dispensacion.Descuento,
            Total = dispensacion.Total,
            Activo = true
        });
    }

    private async Task<Moneda> AsegurarMonedaBaseAsync(CancellationToken cancellationToken)
    {
        var moneda = await dbContext.Monedas
            .FirstOrDefaultAsync(m => m.EsBase && m.Activo, cancellationToken)
            ?? await dbContext.Monedas.FirstOrDefaultAsync(m => m.Activo, cancellationToken);

        if (moneda != null) return moneda;

        moneda = new Moneda
        {
            Codigo = "BOB",
            Nombre = "Boliviano",
            Simbolo = "Bs.",
            EsBase = true,
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };
        dbContext.Monedas.Add(moneda);
        await dbContext.SaveChangesAsync(cancellationToken);
        return moneda;
    }

    private async Task<MetodoPago> ResolverMetodoPagoAsync(
        string metodoPagoNombre,
        CancellationToken cancellationToken)
    {
        var upper = metodoPagoNombre.Trim().ToUpperInvariant();
        var codigoBuscado = upper switch
        {
            var s when s.Contains("EFECTIVO") => "EFECTIVO",
            var s when s.Contains("TARJETA") => "TARJETA",
            var s when s.Contains("QR") => "QR",
            var s when s.Contains("TRANSFERENCIA") => "TRANSFERENCIA",
            _ => "EFECTIVO"
        };

        var metodo = await dbContext.MetodosPago
            .FirstOrDefaultAsync(
                m => m.Activo &&
                     (m.Codigo.ToUpper() == codigoBuscado ||
                      m.Nombre.ToUpper().Contains(upper)),
                cancellationToken)
            ?? await dbContext.MetodosPago.FirstOrDefaultAsync(m => m.Activo, cancellationToken);

        if (metodo != null) return metodo;

        metodo = new MetodoPago
        {
            Codigo = "EFECTIVO",
            Nombre = "Efectivo",
            RequiereReferencia = false,
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };
        dbContext.MetodosPago.Add(metodo);
        await dbContext.SaveChangesAsync(cancellationToken);
        return metodo;
    }

    private async Task<(TipoMovimientoCaja Tipo, ConceptoMovimientoCaja Concepto)> AsegurarConceptoCajaAsync(
        string tipoCodigo,
        string tipoNombre,
        string naturaleza,
        string conceptoCodigo,
        string conceptoNombre,
        CancellationToken cancellationToken)
    {
        var tipo = await dbContext.TiposMovimientoCaja
            .FirstOrDefaultAsync(t => t.Codigo == tipoCodigo && t.Activo, cancellationToken);

        if (tipo is null)
        {
            tipo = new TipoMovimientoCaja
            {
                Codigo = tipoCodigo,
                Nombre = tipoNombre,
                Descripcion = tipoNombre,
                Naturaleza = naturaleza,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            dbContext.TiposMovimientoCaja.Add(tipo);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var concepto = await dbContext.ConceptosMovimientoCaja
            .FirstOrDefaultAsync(
                c => c.TipoMovimientoCajaId == tipo.Id &&
                     c.Codigo == conceptoCodigo &&
                     c.Activo,
                cancellationToken);

        if (concepto is null)
        {
            concepto = new ConceptoMovimientoCaja
            {
                TipoMovimientoCajaId = tipo.Id,
                Codigo = conceptoCodigo,
                Nombre = conceptoNombre,
                Descripcion = conceptoNombre,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            dbContext.ConceptosMovimientoCaja.Add(concepto);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return (tipo, concepto);
    }

    private async Task<Servicio> AsegurarServicioFarmaciaAsync(CancellationToken cancellationToken)
    {
        var servicio = await dbContext.Servicio
            .FirstOrDefaultAsync(
                s => s.Activo && (s.Codigo == "FAR-DISP" || s.Codigo == "HOS-159"),
                cancellationToken);

        if (servicio != null) return servicio;

        var categoria = await dbContext.CategoriaServicio
            .FirstOrDefaultAsync(c => c.Codigo == "FAR" && c.Activo, cancellationToken);

        if (categoria is null)
        {
            categoria = new CategoriaServicio
            {
                Codigo = "FAR",
                Nombre = "FARMACIA Y MEDICAMENTOS",
                Descripcion = "Dispensación y venta de medicamentos en farmacia",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            dbContext.CategoriaServicio.Add(categoria);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        servicio = new Servicio
        {
            CategoriaServicioId = categoria.Id,
            Codigo = "FAR-DISP",
            Nombre = "Dispensación de Medicamentos (Farmacia)",
            Descripcion = "Cargo por dispensación de medicamentos e insumos farmacéuticos",
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };
        dbContext.Servicio.Add(servicio);
        await dbContext.SaveChangesAsync(cancellationToken);
        return servicio;
    }

    private async Task<int> ResolverPacienteParaVentaAsync(
        Entity.Dispensacion dispensacion,
        CancellationToken cancellationToken)
    {
        if (dispensacion.PacienteId.HasValue)
        {
            return dispensacion.PacienteId.Value;
        }

        var pacienteMostrador = await dbContext.Pacientes
            .FirstOrDefaultAsync(
                p => p.NumeroHistoriaClinica == "HC-FARM-MOSTRADOR" && p.Activo,
                cancellationToken);

        if (pacienteMostrador != null)
        {
            return pacienteMostrador.Id;
        }

        var personaMostrador = await dbContext.Personas
            .FirstOrDefaultAsync(
                p => p.TipoDocumento == "CI" && p.NumeroDocumento == "99999999" && p.ComplementoDocumento == null,
                cancellationToken);

        if (personaMostrador is null)
        {
            personaMostrador = new Persona
            {
                Nombres = "Cliente Mostrador",
                ApellidoPaterno = "Farmacia",
                ApellidoMaterno = null,
                FechaNacimiento = new DateOnly(1990, 1, 1),
                TipoDocumento = "CI",
                NumeroDocumento = "99999999",
                Genero = "Otro",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            dbContext.Personas.Add(personaMostrador);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        pacienteMostrador = new Paciente
        {
            PersonaId = personaMostrador.Id,
            NumeroHistoriaClinica = "HC-FARM-MOSTRADOR",
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };
        dbContext.Pacientes.Add(pacienteMostrador);
        await dbContext.SaveChangesAsync(cancellationToken);

        return pacienteMostrador.Id;
    }

    private async Task<int> ResolverAdmisionParaVentaAsync(
        Entity.Dispensacion dispensacion,
        int pacienteId,
        int recepcionistaId,
        int servicioId,
        CancellationToken cancellationToken)
    {
        if (dispensacion.AdmisionId.HasValue)
        {
            return dispensacion.AdmisionId.Value;
        }

        var admisionExistente = await dbContext.Admisiones
            .Where(a => a.PacienteId == pacienteId && a.Activo && a.Estado != EstadoAdmision.Cancelada)
            .OrderByDescending(a => a.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (admisionExistente != null)
        {
            return admisionExistente.Id;
        }

        var corrAdm = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
        {
            Codigo = "ADM",
            Gestion = DateTime.UtcNow.Year,
            Prefijo = "ADM",
            Longitud = 6
        }, cancellationToken);

        var nuevaAdmision = new Admision
        {
            Numero = corrAdm.NumeroFormateado,
            PacienteId = pacienteId,
            RecepcionistaId = recepcionistaId,
            FechaHora = DateTime.UtcNow,
            Estado = EstadoAdmision.EnviadaVenta,
            Observacion = $"Admisión automática Farmacia ({dispensacion.Numero})",
            Activo = true,
            Detalles =
            [
                new AdmisionDetalle
                {
                    ServicioId = servicioId,
                    MedicoId = dispensacion.MedicoId,
                    Cantidad = 1m,
                    PrecioUnitario = dispensacion.Subtotal,
                    Descuento = dispensacion.Descuento,
                    Total = dispensacion.Total,
                    Activo = true
                }
            ]
        };

        dbContext.Admisiones.Add(nuevaAdmision);
        await dbContext.SaveChangesAsync(cancellationToken);
        return nuevaAdmision.Id;
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
            MovimientoInventarioNumero = entity.MovimientoInventario?.Numero,
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
