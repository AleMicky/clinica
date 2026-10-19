using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Existencia.Services;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Quirofano.Cirugia.Dtos;
using Clinica.Api.Modules.Quirofano.Cirugia.Entity;
using Clinica.Api.Modules.Quirofano.Cirugia.Enums;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Quirofano.Cirugia.Services;

public sealed class CirugiaService(
    AppDbContext dbContext,
    ICorrelativoService correlativoService,
    IExistenciaMovimientoService existenciaMovimientoService) : ICirugiaService
{
    public async Task<PagedResult<CirugiaResponse>> ListarAsync(
        EstadoCirugia? estado = null,
        TipoCirugia? tipo = null,
        int? cirujanoId = null,
        string? sala = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        string? search = null,
        PaginationRequest? pagination = null,
        CancellationToken cancellationToken = default)
    {
        var pageReq = pagination ?? new PaginationRequest();
        var query = dbContext.Set<Entity.Cirugia>()
            .AsNoTracking()
            .Include(x => x.Paciente).ThenInclude(p => p.Persona)
            .Include(x => x.CirujanoPrincipal).ThenInclude(m => m.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.CirujanoPrincipal).ThenInclude(m => m.Especialidades).ThenInclude(me => me.Especialidad)
            .Include(x => x.Anestesiologo).ThenInclude(m => m!.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.PrimerAyudante).ThenInclude(m => m!.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.Admision)
            .Include(x => x.Almacen)
            .Include(x => x.GastosMateriales).ThenInclude(g => g.Producto)
            .Include(x => x.GastosMateriales).ThenInclude(g => g.PartidaInventario)
            .Where(x => x.Activo);

        if (estado.HasValue)
        {
            query = query.Where(x => x.Estado == estado.Value);
        }

        if (tipo.HasValue)
        {
            query = query.Where(x => x.Tipo == tipo.Value);
        }

        if (cirujanoId.HasValue && cirujanoId.Value > 0)
        {
            query = query.Where(x => x.CirujanoPrincipalId == cirujanoId.Value);
        }

        if (!string.IsNullOrWhiteSpace(sala))
        {
            query = query.Where(x => x.SalaOperaciones.ToLower().Contains(sala.Trim().ToLower()));
        }

        if (fechaDesde.HasValue)
        {
            var desdeDt = fechaDesde.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.FechaProgramada >= desdeDt);
        }

        if (fechaHasta.HasValue)
        {
            var hastaDt = fechaHasta.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.FechaProgramada <= hastaDt);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Numero.ToLower().Contains(term) ||
                x.ProcedimientoQuirurgico.ToLower().Contains(term) ||
                x.SalaOperaciones.ToLower().Contains(term) ||
                (x.Paciente != null && (
                    x.Paciente.Persona.Nombres.ToLower().Contains(term) ||
                    x.Paciente.Persona.ApellidoPaterno.ToLower().Contains(term) ||
                    x.Paciente.Persona.NumeroDocumento.ToLower().Contains(term) ||
                    x.Paciente.NumeroHistoriaClinica.ToLower().Contains(term)
                )) ||
                (x.CirujanoPrincipal != null && (
                    x.CirujanoPrincipal.Empleado.Persona.Nombres.ToLower().Contains(term) ||
                    x.CirujanoPrincipal.Empleado.Persona.ApellidoPaterno.ToLower().Contains(term)
                )));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var offset = (pageReq.ValidPage - 1) * pageReq.ValidPageSize;

        var entities = await query
            .OrderByDescending(x => x.FechaProgramada)
            .ThenByDescending(x => x.Id)
            .Skip(offset)
            .Take(pageReq.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<CirugiaResponse>(
            entities.Select(MapearResponse).ToList(),
            pageReq.ValidPage,
            pageReq.ValidPageSize,
            totalItems);
    }

    public async Task<CirugiaResponse> ObtenerPorIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<Entity.Cirugia>()
            .AsNoTracking()
            .Include(x => x.Paciente).ThenInclude(p => p.Persona)
            .Include(x => x.CirujanoPrincipal).ThenInclude(m => m.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.CirujanoPrincipal).ThenInclude(m => m.Especialidades).ThenInclude(me => me.Especialidad)
            .Include(x => x.Anestesiologo).ThenInclude(m => m!.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.PrimerAyudante).ThenInclude(m => m!.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.Admision)
            .Include(x => x.Almacen)
            .Include(x => x.GastosMateriales).ThenInclude(g => g.Producto)
            .Include(x => x.GastosMateriales).ThenInclude(g => g.PartidaInventario)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Entity.Cirugia), id);
        }

        return MapearResponse(entity);
    }

    public async Task<CirugiaMetricsResponse> ObtenerMetricasAsync(
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Set<Entity.Cirugia>()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (fechaDesde.HasValue)
        {
            var desdeDt = fechaDesde.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.FechaProgramada >= desdeDt);
        }

        if (fechaHasta.HasValue)
        {
            var hastaDt = fechaHasta.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.FechaProgramada <= hastaDt);
        }

        var list = await query.Select(x => new
        {
            x.Estado,
            TotalMateriales = x.GastosMateriales.Sum(g => g.Cantidad * g.PrecioUnitario)
        }).ToListAsync(cancellationToken);

        return new CirugiaMetricsResponse
        {
            TotalCirugias = list.Count,
            TotalProgramadas = list.Count(x => x.Estado == EstadoCirugia.Programada || x.Estado == EstadoCirugia.EnPreparacion),
            TotalEnCurso = list.Count(x => x.Estado == EstadoCirugia.EnCurso),
            TotalFinalizadas = list.Count(x => x.Estado == EstadoCirugia.Finalizada || x.Estado == EstadoCirugia.Recuperacion),
            TotalCanceladas = list.Count(x => x.Estado == EstadoCirugia.Cancelada),
            MontoTotalMaterialesConsumidos = list.Sum(x => x.TotalMateriales)
        };
    }

    public async Task<List<MaterialQuirofanoStockResponse>> ListarMaterialesStockAsync(
        int? almacenId = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        int targetAlmacenId;
        if (almacenId.HasValue && almacenId.Value > 0)
        {
            targetAlmacenId = almacenId.Value;
        }
        else
        {
            var almQui = await dbContext.Almacenes
                .FirstOrDefaultAsync(a => a.Codigo == "ALM-QUI" && a.Activo, cancellationToken);
            targetAlmacenId = almQui?.Id ?? 1;
        }

        var existenciasQuery = dbContext.Existencias
            .AsNoTracking()
            .Include(x => x.Producto).ThenInclude(p => p.CategoriaProducto)
            .Include(x => x.Producto).ThenInclude(p => p.UnidadMedida)
            .Where(x => x.AlmacenId == targetAlmacenId && x.Activo && x.Cantidad > 0);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            existenciasQuery = existenciasQuery.Where(x =>
                x.Producto.Codigo.ToLower().Contains(term) ||
                x.Producto.Nombre.ToLower().Contains(term));
        }

        var existencias = await existenciasQuery.Take(120).ToListAsync(cancellationToken);
        var existenciaIds = existencias.Select(e => e.Id).ToList();

        var partidas = await dbContext.ExistenciasPartidas
            .AsNoTracking()
            .Include(ep => ep.PartidaInventario)
            .Where(ep => existenciaIds.Contains(ep.ExistenciaId) && ep.Activo && ep.Cantidad > 0)
            .OrderBy(ep => ep.PartidaInventario.FechaVencimiento)
            .ToListAsync(cancellationToken);

        var result = new List<MaterialQuirofanoStockResponse>();

        foreach (var ex in existencias)
        {
            var lotesProducto = partidas
                .Where(p => p.ExistenciaId == ex.Id)
                .Select(p => new LoteMaterialStockResponse
                {
                    PartidaInventarioId = p.PartidaInventarioId,
                    Lote = p.PartidaInventario.NumeroPartida ?? string.Empty,
                    FechaVencimiento = p.PartidaInventario.FechaVencimiento.HasValue ? p.PartidaInventario.FechaVencimiento.Value.ToDateTime(TimeOnly.MinValue) : null,
                    CantidadDisponible = p.Cantidad - p.CantidadReservada
                })
                .ToList();

            var precio = ex.Producto.PrecioVenta > 0
                ? ex.Producto.PrecioVenta
                : (ex.CostoPromedio > 0 ? Math.Round(ex.CostoPromedio * 1.30m, 2) : 25m);

            result.Add(new MaterialQuirofanoStockResponse
            {
                ProductoId = ex.ProductoId,
                Codigo = ex.Producto.Codigo,
                Nombre = ex.Producto.Nombre,
                Categoria = ex.Producto.CategoriaProducto?.Nombre,
                UnidadMedida = ex.Producto.UnidadMedida?.Nombre,
                StockDisponible = ex.Cantidad - ex.CantidadReservada,
                CostoReferencial = ex.CostoPromedio,
                PrecioReferencial = precio,
                Lotes = lotesProducto
            });
        }

        return result;
    }

    public async Task<CirugiaResponse> CrearAsync(
        CreateCirugiaRequest request,
        CancellationToken cancellationToken = default)
    {
        var paciente = await dbContext.Pacientes
            .FirstOrDefaultAsync(p => p.Id == request.PacienteId && p.Activo, cancellationToken);
        if (paciente is null)
        {
            throw new NotFoundException(nameof(paciente), request.PacienteId);
        }

        var cirujano = await dbContext.Medicos
            .FirstOrDefaultAsync(m => m.Id == request.CirujanoPrincipalId && m.Activo, cancellationToken);
        if (cirujano is null)
        {
            throw new NotFoundException(nameof(cirujano), request.CirujanoPrincipalId);
        }

        // Determinar almacén de quirófano
        int targetAlmacenId = request.AlmacenId ?? 0;
        if (targetAlmacenId <= 0)
        {
            var almQui = await dbContext.Almacenes
                .FirstOrDefaultAsync(a => a.Codigo == "ALM-QUI" && a.Activo, cancellationToken);
            targetAlmacenId = almQui?.Id ?? 1;
        }

        var correlativo = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
        {
            Codigo = "CIR",
            Gestion = DateTime.UtcNow.Year,
            Prefijo = "CIR",
            Longitud = 6
        }, cancellationToken);

        var entity = new Entity.Cirugia
        {
            Numero = correlativo.NumeroFormateado,
            Tipo = request.Tipo,
            Estado = EstadoCirugia.Programada,
            TipoAnestesia = request.TipoAnestesia,
            AdmisionId = request.AdmisionId,
            PacienteId = request.PacienteId,
            CirujanoPrincipalId = request.CirujanoPrincipalId,
            AnestesiologoId = request.AnestesiologoId,
            PrimerAyudanteId = request.PrimerAyudanteId,
            Instrumentista = request.Instrumentista?.Trim(),
            Circulante = request.Circulante?.Trim(),
            SalaOperaciones = request.SalaOperaciones.Trim(),
            ProcedimientoQuirurgico = request.ProcedimientoQuirurgico.Trim(),
            DiagnosticoPreOperatorio = request.DiagnosticoPreOperatorio?.Trim(),
            FechaProgramada = request.FechaProgramada,
            AlmacenId = targetAlmacenId,
            Observaciones = request.Observaciones?.Trim(),
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        foreach (var gasto in request.GastosMaterialesIniciales)
        {
            if (gasto.Cantidad <= 0) continue;

            var prod = await dbContext.Productos.FindAsync([gasto.ProductoId], cancellationToken);
            var costo = prod?.PrecioVenta ?? 0;
            var precio = gasto.PrecioUnitario ?? costo;

            entity.GastosMateriales.Add(new CirugiaGastoMaterial
            {
                ProductoId = gasto.ProductoId,
                PartidaInventarioId = gasto.PartidaInventarioId,
                Cantidad = gasto.Cantidad,
                CostoUnitario = costo,
                PrecioUnitario = precio,
                MomentoQuirurgico = gasto.MomentoQuirurgico?.Trim() ?? "Programación",
                Observaciones = gasto.Observaciones?.Trim(),
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            });
        }

        dbContext.Set<Entity.Cirugia>().Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerPorIdAsync(entity.Id, cancellationToken);
    }

    public async Task<CirugiaResponse> ActualizarAsync(
        int id,
        UpdateCirugiaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<Entity.Cirugia>()
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Entity.Cirugia), id);
        }

        if (entity.Estado is EstadoCirugia.Finalizada or EstadoCirugia.Cancelada)
        {
            throw new BusinessException($"No se puede modificar una cirugía en estado {entity.Estado}.");
        }

        entity.Tipo = request.Tipo;
        entity.TipoAnestesia = request.TipoAnestesia;
        entity.AdmisionId = request.AdmisionId;
        entity.PacienteId = request.PacienteId;
        entity.CirujanoPrincipalId = request.CirujanoPrincipalId;
        entity.AnestesiologoId = request.AnestesiologoId;
        entity.PrimerAyudanteId = request.PrimerAyudanteId;
        entity.Instrumentista = request.Instrumentista?.Trim();
        entity.Circulante = request.Circulante?.Trim();
        entity.SalaOperaciones = request.SalaOperaciones.Trim();
        entity.ProcedimientoQuirurgico = request.ProcedimientoQuirurgico.Trim();
        entity.DiagnosticoPreOperatorio = request.DiagnosticoPreOperatorio?.Trim();
        entity.FechaProgramada = request.FechaProgramada;
        entity.Observaciones = request.Observaciones?.Trim();
        entity.FechaModificacion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerPorIdAsync(entity.Id, cancellationToken);
    }

    public async Task<CirugiaResponse> IniciarCirugiaAsync(
        int id,
        IniciarCirugiaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<Entity.Cirugia>()
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Entity.Cirugia), id);
        }

        if (entity.Estado is not (EstadoCirugia.Programada or EstadoCirugia.EnPreparacion))
        {
            throw new BusinessException($"Solo se puede iniciar una cirugía programada o en preparación. Estado actual: {entity.Estado}.");
        }

        entity.Estado = EstadoCirugia.EnCurso;
        entity.FechaInicio = request.FechaInicio ?? DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request.Observaciones))
        {
            entity.Observaciones = $"{entity.Observaciones} | Inicio: {request.Observaciones.Trim()}".Trim(' ', '|');
        }
        entity.FechaModificacion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerPorIdAsync(entity.Id, cancellationToken);
    }

    public async Task<CirugiaResponse> RegistrarGastosMaterialesAsync(
        int id,
        RegistrarGastoMaterialCirugiaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<Entity.Cirugia>()
            .Include(x => x.GastosMateriales)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Entity.Cirugia), id);
        }

        if (entity.Estado is EstadoCirugia.Finalizada or EstadoCirugia.Cancelada)
        {
            throw new BusinessException($"No se pueden registrar gastos en una cirugía con estado {entity.Estado}.");
        }

        foreach (var gasto in request.Gastos)
        {
            if (gasto.Cantidad <= 0) continue;

            var existencia = await dbContext.Existencias
                .FirstOrDefaultAsync(e => e.AlmacenId == entity.AlmacenId && e.ProductoId == gasto.ProductoId && e.Activo, cancellationToken);

            var costo = existencia?.CostoPromedio ?? 0m;
            var precio = gasto.PrecioUnitario ?? (costo > 0 ? costo * 1.30m : 20m);

            entity.GastosMateriales.Add(new CirugiaGastoMaterial
            {
                CirugiaId = entity.Id,
                ProductoId = gasto.ProductoId,
                PartidaInventarioId = gasto.PartidaInventarioId,
                Cantidad = gasto.Cantidad,
                CostoUnitario = costo,
                PrecioUnitario = precio,
                MomentoQuirurgico = gasto.MomentoQuirurgico?.Trim() ?? "Tiempo Quirúrgico",
                Observaciones = gasto.Observaciones?.Trim(),
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            });
        }

        entity.FechaModificacion = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerPorIdAsync(entity.Id, cancellationToken);
    }

    public async Task<CirugiaResponse> FinalizarCirugiaAsync(
        int id,
        FinalizarCirugiaRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var entity = await dbContext.Set<Entity.Cirugia>()
                .Include(x => x.GastosMateriales)
                .Include(x => x.Almacen)
                .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

            if (entity is null)
            {
                throw new NotFoundException(nameof(Entity.Cirugia), id);
            }

            if (entity.Estado is EstadoCirugia.Finalizada)
            {
                throw new BusinessException("La cirugía ya se encuentra finalizada.");
            }

            if (entity.Estado is EstadoCirugia.Cancelada)
            {
                throw new BusinessException("No se puede finalizar una cirugía cancelada.");
            }

            // Agregar gastos adicionales si se enviaron en la solicitud de finalización
            if (request.GastosFinales != null && request.GastosFinales.Count > 0)
            {
                foreach (var gasto in request.GastosFinales)
                {
                    if (gasto.Cantidad <= 0) continue;

                    var existencia = await dbContext.Existencias
                        .FirstOrDefaultAsync(e => e.AlmacenId == entity.AlmacenId && e.ProductoId == gasto.ProductoId && e.Activo, cancellationToken);

                    var costo = existencia?.CostoPromedio ?? 0m;
                    var precio = gasto.PrecioUnitario ?? (costo > 0 ? costo * 1.30m : 20m);

                    entity.GastosMateriales.Add(new CirugiaGastoMaterial
                    {
                        CirugiaId = entity.Id,
                        ProductoId = gasto.ProductoId,
                        PartidaInventarioId = gasto.PartidaInventarioId,
                        Cantidad = gasto.Cantidad,
                        CostoUnitario = costo,
                        PrecioUnitario = precio,
                        MomentoQuirurgico = gasto.MomentoQuirurgico?.Trim() ?? "Cierre y Recuperación",
                        Observaciones = gasto.Observaciones?.Trim(),
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });
                }
            }

            // Descontar inventario de Quirófano (ALM-QUI) por los materiales e insumos utilizados
            foreach (var gasto in entity.GastosMateriales)
            {
                var movDetalle = new MovimientoInventarioDetalle
                {
                    ProductoId = gasto.ProductoId,
                    Cantidad = gasto.Cantidad,
                    CostoUnitario = gasto.CostoUnitario
                };

                await existenciaMovimientoService.ConfirmarSalidaAsync(entity.AlmacenId, movDetalle, cancellationToken);
            }

            entity.Estado = EstadoCirugia.Finalizada;
            entity.FechaFin = request.FechaFin ?? DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(request.DiagnosticoPostOperatorio))
            {
                entity.DiagnosticoPostOperatorio = request.DiagnosticoPostOperatorio.Trim();
            }
            if (!string.IsNullOrWhiteSpace(request.Observaciones))
            {
                entity.Observaciones = $"{entity.Observaciones} | Cierre: {request.Observaciones.Trim()}".Trim(' ', '|');
            }
            entity.FechaModificacion = DateTime.UtcNow;

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

    public async Task<CirugiaResponse> CancelarCirugiaAsync(
        int id,
        CancelarCirugiaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Set<Entity.Cirugia>()
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Entity.Cirugia), id);
        }

        if (entity.Estado is EstadoCirugia.Finalizada)
        {
            throw new BusinessException("No se puede cancelar una cirugía que ya fue finalizada.");
        }

        entity.Estado = EstadoCirugia.Cancelada;
        entity.MotivoCancelacion = request.MotivoCancelacion.Trim();
        entity.FechaModificacion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerPorIdAsync(entity.Id, cancellationToken);
    }

    private static CirugiaResponse MapearResponse(Entity.Cirugia c)
    {
        var gastos = c.GastosMateriales.Select(g => new CirugiaGastoMaterialResponse
        {
            Id = g.Id,
            ProductoId = g.ProductoId,
            ProductoCodigo = g.Producto?.Codigo ?? string.Empty,
            ProductoNombre = g.Producto?.Nombre ?? string.Empty,
            PartidaInventarioId = g.PartidaInventarioId,
            Lote = g.PartidaInventario?.NumeroPartida,
            FechaVencimiento = g.PartidaInventario?.FechaVencimiento.HasValue == true
                ? g.PartidaInventario.FechaVencimiento.Value.ToDateTime(TimeOnly.MinValue)
                : null,
            Cantidad = g.Cantidad,
            CostoUnitario = g.CostoUnitario,
            PrecioUnitario = g.PrecioUnitario,
            Subtotal = g.Subtotal,
            MomentoQuirurgico = g.MomentoQuirurgico,
            Observaciones = g.Observaciones
        }).ToList();

        var cirujanoPers = c.CirujanoPrincipal?.Empleado?.Persona;
        var anestPers = c.Anestesiologo?.Empleado?.Persona;
        var ayudantePers = c.PrimerAyudante?.Empleado?.Persona;
        var pacPers = c.Paciente?.Persona;

        return new CirugiaResponse
        {
            Id = c.Id,
            Numero = c.Numero,
            Tipo = c.Tipo,
            TipoTexto = c.Tipo switch
            {
                TipoCirugia.Programada => "Programada",
                TipoCirugia.Urgencia => "Urgencia",
                TipoCirugia.Ambulatoria => "Ambulatoria",
                _ => c.Tipo.ToString()
            },
            Estado = c.Estado,
            EstadoTexto = c.Estado switch
            {
                EstadoCirugia.Programada => "Programada",
                EstadoCirugia.EnPreparacion => "En Preparación",
                EstadoCirugia.EnCurso => "En Quirófano",
                EstadoCirugia.Recuperacion => "En Recuperación",
                EstadoCirugia.Finalizada => "Finalizada",
                EstadoCirugia.Cancelada => "Cancelada",
                _ => c.Estado.ToString()
            },
            TipoAnestesia = c.TipoAnestesia,
            TipoAnestesiaTexto = c.TipoAnestesia switch
            {
                TipoAnestesia.General => "General",
                TipoAnestesia.RegionalRaquidea => "Regional / Raquídea",
                TipoAnestesia.Epidural => "Epidural",
                TipoAnestesia.LocalYSedacion => "Local + Sedación",
                TipoAnestesia.Local => "Local",
                _ => c.TipoAnestesia.ToString()
            },
            AdmisionId = c.AdmisionId,
            AdmisionNumero = c.Admision?.Numero,
            PacienteId = c.PacienteId,
            PacienteNombreCompleto = pacPers != null ? $"{pacPers.Nombres} {pacPers.ApellidoPaterno} {pacPers.ApellidoMaterno ?? ""}".Trim() : string.Empty,
            PacienteDocumento = pacPers?.NumeroDocumento ?? string.Empty,
            PacienteHistoriaClinica = c.Paciente?.NumeroHistoriaClinica ?? string.Empty,
            CirujanoPrincipalId = c.CirujanoPrincipalId,
            CirujanoNombreCompleto = cirujanoPers != null ? $"Dr(a). {cirujanoPers.Nombres} {cirujanoPers.ApellidoPaterno}" : string.Empty,
            CirujanoEspecialidad = c.CirujanoPrincipal?.Especialidades?.FirstOrDefault()?.Especialidad?.Nombre ?? "Cirugía General",
            AnestesiologoId = c.AnestesiologoId,
            AnestesiologoNombreCompleto = anestPers != null ? $"Dr(a). {anestPers.Nombres} {anestPers.ApellidoPaterno}" : null,
            PrimerAyudanteId = c.PrimerAyudanteId,
            PrimerAyudanteNombreCompleto = ayudantePers != null ? $"Dr(a). {ayudantePers.Nombres} {ayudantePers.ApellidoPaterno}" : null,
            Instrumentista = c.Instrumentista,
            Circulante = c.Circulante,
            SalaOperaciones = c.SalaOperaciones,
            ProcedimientoQuirurgico = c.ProcedimientoQuirurgico,
            DiagnosticoPreOperatorio = c.DiagnosticoPreOperatorio,
            DiagnosticoPostOperatorio = c.DiagnosticoPostOperatorio,
            FechaProgramada = c.FechaProgramada,
            FechaInicio = c.FechaInicio,
            FechaFin = c.FechaFin,
            AlmacenId = c.AlmacenId,
            AlmacenNombre = c.Almacen?.Nombre ?? "Almacén de Quirófano",
            MovimientoInventarioId = c.MovimientoInventarioId,
            Observaciones = c.Observaciones,
            MotivoCancelacion = c.MotivoCancelacion,
            TotalCostoMateriales = gastos.Sum(g => g.Cantidad * g.CostoUnitario),
            TotalPrecioMateriales = gastos.Sum(g => g.Subtotal),
            GastosMateriales = gastos,
            FechaCreacion = c.FechaCreacion,
            FechaModificacion = c.FechaModificacion,
            Activo = c.Activo
        };
    }
}
