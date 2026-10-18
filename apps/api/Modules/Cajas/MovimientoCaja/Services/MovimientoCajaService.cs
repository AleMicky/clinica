using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Excel;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using MovimientoCajaEntity =
    Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja;
using TurnoCajaEntity =
    Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Services;

public sealed class MovimientoCajaService(
    AppDbContext dbContext,
    IExcelReportGenerator excelReportGenerator)
{
    private AppDbContext DbContext { get; } = dbContext;
    private IExcelReportGenerator ExcelReportGenerator { get; } = excelReportGenerator;

    private DbSet<MovimientoCajaEntity> Entities =>
        DbContext.Set<MovimientoCajaEntity>();

    // ============================================================
    // LISTAR
    // ============================================================

    public async Task<PagedResult<MovimientoCajaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        int? turnoCajaId = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (turnoCajaId.HasValue)
        {
            query = query.Where(
                x => x.TurnoCajaId == turnoCajaId.Value);
        }

        if (fechaDesde.HasValue)
        {
            var desdeDateTime = fechaDesde.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.FechaHora >= desdeDateTime);
        }

        if (fechaHasta.HasValue)
        {
            var hastaDateTime = fechaHasta.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.FechaHora <= hastaDateTime);
        }

        var normalizedSearch =
            string.IsNullOrWhiteSpace(search)
                ? null
                : search.Trim();

        query = ApplySearch(
            query,
            normalizedSearch);

        var totalItems =
            await query.CountAsync(cancellationToken);

        var offset =
            (pagination.ValidPage - 1) *
            pagination.ValidPageSize;

        var entities = await ApplyOrder(query)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<MovimientoCajaResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    // ============================================================
    // MÉTRICAS Y ANALÍTICA
    // ============================================================

    public async Task<MovimientoCajaMetricsResponse> ObtenerMetricasAsync(
        string? search = null,
        int? turnoCajaId = null,
        string? naturaleza = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default)
    {
        var query = Entities
            .Include(x => x.TipoMovimientoCaja)
            .Include(x => x.ConceptoMovimientoCaja)
            .Include(x => x.TurnoCaja).ThenInclude(x => x.Caja)
            .AsNoTracking()
            .Where(x => x.Activo);

        if (turnoCajaId.HasValue)
        {
            query = query.Where(x => x.TurnoCajaId == turnoCajaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(naturaleza) && !naturaleza.Equals("TODOS", StringComparison.OrdinalIgnoreCase))
        {
            var natUpper = naturaleza.Trim().ToUpperInvariant();
            query = query.Where(x => x.NaturalezaAplicada == natUpper || (x.TipoMovimientoCaja != null && x.TipoMovimientoCaja.Naturaleza == natUpper));
        }

        if (fechaDesde.HasValue)
        {
            var desdeDateTime = fechaDesde.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.FechaHora >= desdeDateTime);
        }

        if (fechaHasta.HasValue)
        {
            var hastaDateTime = fechaHasta.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.FechaHora <= hastaDateTime);
        }

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        query = ApplySearch(query, normalizedSearch);

        var allItems = await query.ToListAsync(cancellationToken);

        if (allItems.Count == 0)
        {
            return new MovimientoCajaMetricsResponse();
        }

        int totalMovimientos = allItems.Count;
        decimal totalIngresos = 0m;
        decimal totalEgresos = 0m;
        int cantIngresos = 0;
        int cantEgresos = 0;

        foreach (var item in allItems)
        {
            var monto = item.MontoMonedaBase > 0 ? item.MontoMonedaBase : item.Monto;
            var isIngreso = item.NaturalezaAplicada.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase) ||
                            (item.TipoMovimientoCaja != null && item.TipoMovimientoCaja.Naturaleza.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase));

            if (isIngreso)
            {
                totalIngresos += monto;
                cantIngresos++;
            }
            else
            {
                totalEgresos += monto;
                cantEgresos++;
            }
        }

        decimal balanceNeto = totalIngresos - totalEgresos;
        decimal promIngreso = cantIngresos > 0 ? Math.Round(totalIngresos / cantIngresos, 2) : 0m;
        decimal promEgreso = cantEgresos > 0 ? Math.Round(totalEgresos / cantEgresos, 2) : 0m;

        // Tendencia diaria
        var tendenciaDiaria = allItems
            .GroupBy(x => x.FechaHora.Date)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                decimal diaIngresos = 0m;
                decimal diaEgresos = 0m;
                foreach (var m in g)
                {
                    var monto = m.MontoMonedaBase > 0 ? m.MontoMonedaBase : m.Monto;
                    var isIng = m.NaturalezaAplicada.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase) ||
                                (m.TipoMovimientoCaja != null && m.TipoMovimientoCaja.Naturaleza.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase));
                    if (isIng) diaIngresos += monto;
                    else diaEgresos += monto;
                }
                return new MovimientoCajaDiarioDto
                {
                    Fecha = g.Key.ToString("yyyy-MM-dd"),
                    Ingresos = diaIngresos,
                    Egresos = diaEgresos,
                    Balance = diaIngresos - diaEgresos,
                    Cantidad = g.Count()
                };
            })
            .ToList();

        // Por tipo movimiento
        decimal totalVolumen = totalIngresos + totalEgresos;
        var porTipoMovimiento = allItems
            .GroupBy(x => new
            {
                Nombre = x.TipoMovimientoCaja != null ? x.TipoMovimientoCaja.Nombre : "Sin tipo",
                Naturaleza = x.NaturalezaAplicada ?? (x.TipoMovimientoCaja != null ? x.TipoMovimientoCaja.Naturaleza : "OTRO")
            })
            .Select(g =>
            {
                var montoTipo = g.Sum(x => x.MontoMonedaBase > 0 ? x.MontoMonedaBase : x.Monto);
                return new MovimientoPorTipoDto
                {
                    TipoNombre = g.Key.Nombre,
                    Naturaleza = g.Key.Naturaleza,
                    Monto = montoTipo,
                    Cantidad = g.Count(),
                    Porcentaje = totalVolumen > 0 ? Math.Round((montoTipo / totalVolumen) * 100m, 1) : 0m
                };
            })
            .OrderByDescending(x => x.Monto)
            .ToList();

        // Por concepto
        var porConcepto = allItems
            .GroupBy(x => new
            {
                ConceptoNombre = x.ConceptoMovimientoCaja != null ? x.ConceptoMovimientoCaja.Nombre : "Sin concepto",
                TipoNombre = x.TipoMovimientoCaja != null ? x.TipoMovimientoCaja.Nombre : "-",
                Naturaleza = x.NaturalezaAplicada ?? (x.TipoMovimientoCaja != null ? x.TipoMovimientoCaja.Naturaleza : "-")
            })
            .Select(g =>
            {
                var montoConcepto = g.Sum(x => x.MontoMonedaBase > 0 ? x.MontoMonedaBase : x.Monto);
                return new MovimientoPorConceptoDto
                {
                    ConceptoNombre = g.Key.ConceptoNombre,
                    TipoNombre = g.Key.TipoNombre,
                    Naturaleza = g.Key.Naturaleza,
                    Monto = montoConcepto,
                    Cantidad = g.Count(),
                    Porcentaje = totalVolumen > 0 ? Math.Round((montoConcepto / totalVolumen) * 100m, 1) : 0m
                };
            })
            .OrderByDescending(x => x.Monto)
            .Take(10)
            .ToList();

        // Por caja
        var porCaja = allItems
            .Where(x => x.TurnoCaja?.Caja != null)
            .GroupBy(x => x.TurnoCaja!.Caja!.Nombre)
            .Select(g =>
            {
                decimal cajaIng = 0m;
                decimal cajaEgr = 0m;
                foreach (var m in g)
                {
                    var monto = m.MontoMonedaBase > 0 ? m.MontoMonedaBase : m.Monto;
                    var isIng = m.NaturalezaAplicada.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase) ||
                                (m.TipoMovimientoCaja != null && m.TipoMovimientoCaja.Naturaleza.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase));
                    if (isIng) cajaIng += monto;
                    else cajaEgr += monto;
                }
                return new MovimientoPorCajaDto
                {
                    CajaNombre = g.Key,
                    Ingresos = cajaIng,
                    Egresos = cajaEgr,
                    Balance = cajaIng - cajaEgr,
                    Cantidad = g.Count()
                };
            })
            .OrderByDescending(x => x.Ingresos + x.Egresos)
            .Take(5)
            .ToList();

        return new MovimientoCajaMetricsResponse
        {
            TotalMovimientos = totalMovimientos,
            TotalIngresos = totalIngresos,
            TotalEgresos = totalEgresos,
            BalanceNeto = balanceNeto,
            CantidadIngresos = cantIngresos,
            CantidadEgresos = cantEgresos,
            PromedioIngreso = promIngreso,
            PromedioEgreso = promEgreso,
            TendenciaDiaria = tendenciaDiaria,
            PorTipoMovimiento = porTipoMovimiento,
            PorConcepto = porConcepto,
            PorCaja = porCaja
        };
    }

    // ============================================================
    // EXPORTAR EXCEL
    // ============================================================

    public async Task<byte[]> ExportarExcelAsync(
        string? search,
        int? turnoCajaId = null,
        string? naturaleza = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (turnoCajaId.HasValue)
        {
            query = query.Where(x => x.TurnoCajaId == turnoCajaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(naturaleza) && !naturaleza.Equals("TODOS", StringComparison.OrdinalIgnoreCase))
        {
            var natUpper = naturaleza.Trim().ToUpperInvariant();
            query = query.Where(x => x.NaturalezaAplicada == natUpper || (x.TipoMovimientoCaja != null && x.TipoMovimientoCaja.Naturaleza == natUpper));
        }

        if (fechaDesde.HasValue)
        {
            var desdeDateTime = fechaDesde.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.FechaHora >= desdeDateTime);
        }

        if (fechaHasta.HasValue)
        {
            var hastaDateTime = fechaHasta.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.FechaHora <= hastaDateTime);
        }

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        query = ApplySearch(query, normalizedSearch);

        var movimientos = await ApplyOrder(query)
            .ToListAsync(cancellationToken);

        var options = new ExcelReportOptions
        {
            Title = "Reporte General de Movimientos de Caja",
            Subtitle = "Módulo de Cajas & Tesorería - Control de Flujo de Efectivo",
            SheetName = "MovimientosCaja",
            HeaderColor = "#0284C7",
            GeneratedBy = "Sistema Clínico"
        };

        return ExcelReportGenerator.Generate(options, movimientos, builder =>
        {
            builder.AddColumn("ID", x => x.Id.ToString(), ExcelColumnAlignment.Center);
            builder.AddDateTimeColumn("Fecha y Hora", x => x.FechaHora);
            builder.AddColumn("Caja", x => x.TurnoCaja?.Caja?.Nombre ?? "-", ExcelColumnAlignment.Center);
            builder.AddColumn("Cajero / Usuario", x => x.TurnoCaja?.Empleado?.Persona != null ? $"{x.TurnoCaja.Empleado.Persona.Nombres} {x.TurnoCaja.Empleado.Persona.ApellidoPaterno}".Trim() : "-");
            builder.AddColumn("Tipo de Movimiento", x => x.TipoMovimientoCaja?.Nombre ?? "-");
            builder.AddColumn("Concepto", x => x.ConceptoMovimientoCaja?.Nombre ?? "-");
            builder.AddColumn("Naturaleza", x => x.NaturalezaAplicada ?? x.TipoMovimientoCaja?.Naturaleza ?? "-", ExcelColumnAlignment.Center);
            builder.AddColumn("Moneda", x => x.Moneda?.Simbolo ?? "Bs.", ExcelColumnAlignment.Center);
            builder.AddCurrencyColumn("Monto Original", x => x.Monto);
            builder.AddColumn("Tipo de Cambio", x => x.TipoCambio.ToString("N2"), ExcelColumnAlignment.Right);
            builder.AddCurrencyColumn("Monto Base (Bs.)", x => x.MontoMonedaBase);
            builder.AddColumn("Referencia", x => x.Referencia ?? "-");
            builder.AddColumn("Observación", x => x.Observacion ?? "-");
        });
    }

    // ============================================================
    // OBTENER
    // ============================================================

    public async Task<MovimientoCajaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == id &&
                    x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw CreateNotFoundException(id);
        }

        return MapToResponse(entity);
    }

    // ============================================================
    // REGISTRAR
    // ============================================================

    public async Task<MovimientoCajaResponse> RegistrarAsync(
        RegistrarMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var turno = await ObtenerTurnoAsync(
            request.TurnoCajaId,
            cancellationToken);

        if (turno.Estado != EstadoTurnoCaja.Abierto)
        {
            throw new ConflictException(
                "No se pueden registrar movimientos en un turno de caja cerrado.");
        }

        var moneda = await ObtenerMonedaAsync(
            request.MonedaId,
            cancellationToken);

        ValidarTipoCambio(
            moneda,
            request.TipoCambio);

        var tipoMovimiento = await ObtenerTipoMovimientoAsync(
            request.TipoMovimientoCajaId,
            cancellationToken);

        var concepto = await ObtenerConceptoMovimientoAsync(
            request.ConceptoMovimientoCajaId,
            cancellationToken);

        if (concepto.TipoMovimientoCajaId != tipoMovimiento.Id)
        {
            throw new ConflictException(
                "El concepto seleccionado no corresponde al tipo de movimiento especificado.");
        }

        var entity =
            MovimientoCajaMapper.ToEntity(request);

        entity.FechaHora =
            DateTime.UtcNow;

        entity.Monto =
            Redondear(request.Monto);

        entity.TipoCambio =
            NormalizarTipoCambio(
                moneda,
                request.TipoCambio);

        entity.MontoMonedaBase =
            CalcularMontoMonedaBase(
                entity.Monto,
                entity.TipoCambio);

        entity.NaturalezaAplicada =
            tipoMovimiento.Naturaleza;

        entity.Referencia =
            NormalizarOpcional(
                request.Referencia);

        entity.Observacion =
            NormalizarOpcional(
                request.Observacion);

        entity.Activo =
            true;

        await Entities.AddAsync(
            entity,
            cancellationToken);

        await DbContext.SaveChangesAsync(
            cancellationToken);

        return await ObtenerAsync(
            entity.Id,
            cancellationToken);
    }

    // ============================================================
    // TIPOS DE MOVIMIENTO CRUD
    // ============================================================

    public async Task<IReadOnlyCollection<TipoMovimientoCajaInfo>> ListarTiposAsync(
        string? naturaleza = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbContext.TiposMovimientoCaja
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!string.IsNullOrWhiteSpace(naturaleza))
        {
            var natUpper = naturaleza.Trim().ToUpperInvariant();
            query = query.Where(x => x.Naturaleza == natUpper);
        }

        return await query
            .OrderBy(x => x.Nombre)
            .Select(x => new TipoMovimientoCajaInfo
            {
                Id = x.Id,
                Codigo = x.Codigo,
                Nombre = x.Nombre,
                Descripcion = x.Descripcion,
                Naturaleza = x.Naturaleza,
                Activo = x.Activo
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<TipoMovimientoCajaInfo> ObtenerTipoAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var tipo = await DbContext.TiposMovimientoCaja
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (tipo is null)
        {
            throw new NotFoundException("TipoMovimientoCaja", id);
        }

        return new TipoMovimientoCajaInfo
        {
            Id = tipo.Id,
            Codigo = tipo.Codigo,
            Nombre = tipo.Nombre,
            Descripcion = tipo.Descripcion,
            Naturaleza = tipo.Naturaleza,
            Activo = tipo.Activo
        };
    }

    public async Task<TipoMovimientoCajaInfo> CrearTipoAsync(
        CreateTipoMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var existe = await DbContext.TiposMovimientoCaja
            .AnyAsync(x => x.Codigo == codigo && x.Activo, cancellationToken);

        if (existe)
        {
            throw new ConflictException($"Ya existe un tipo de movimiento con el código '{codigo}'.");
        }

        var entity = new TipoMovimientoCaja
        {
            Codigo = codigo,
            Nombre = request.Nombre.Trim(),
            Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim(),
            Naturaleza = request.Naturaleza.Trim().ToUpperInvariant(),
            Activo = true
        };

        await DbContext.TiposMovimientoCaja.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        return new TipoMovimientoCajaInfo
        {
            Id = entity.Id,
            Codigo = entity.Codigo,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion,
            Naturaleza = entity.Naturaleza,
            Activo = entity.Activo
        };
    }

    public async Task<TipoMovimientoCajaInfo> ActualizarTipoAsync(
        int id,
        UpdateTipoMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.TiposMovimientoCaja
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException("TipoMovimientoCaja", id);
        }

        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var existe = await DbContext.TiposMovimientoCaja
            .AnyAsync(x => x.Id != id && x.Codigo == codigo && x.Activo, cancellationToken);

        if (existe)
        {
            throw new ConflictException($"Ya existe otro tipo de movimiento con el código '{codigo}'.");
        }

        entity.Codigo = codigo;
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim();
        entity.Naturaleza = request.Naturaleza.Trim().ToUpperInvariant();

        await DbContext.SaveChangesAsync(cancellationToken);

        return new TipoMovimientoCajaInfo
        {
            Id = entity.Id,
            Codigo = entity.Codigo,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion,
            Naturaleza = entity.Naturaleza,
            Activo = entity.Activo
        };
    }

    public async Task EliminarTipoAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.TiposMovimientoCaja
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException("TipoMovimientoCaja", id);
        }

        var tieneMovimientos = await DbContext.MovimientosCaja
            .AnyAsync(x => x.TipoMovimientoCajaId == id && x.Activo, cancellationToken);

        if (tieneMovimientos)
        {
            throw new ConflictException("No se puede eliminar el tipo de movimiento porque tiene movimientos registrados en caja.");
        }

        var tieneConceptos = await DbContext.ConceptosMovimientoCaja
            .AnyAsync(x => x.TipoMovimientoCajaId == id && x.Activo, cancellationToken);

        if (tieneConceptos)
        {
            throw new ConflictException("No se puede eliminar el tipo de movimiento porque tiene conceptos asociados. Elimine o reasigne los conceptos primero.");
        }

        entity.Activo = false;
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    // ============================================================
    // CONCEPTOS DE MOVIMIENTO CRUD
    // ============================================================

    public async Task<IReadOnlyCollection<ConceptoMovimientoCajaInfo>> ListarConceptosAsync(
        int? tipoMovimientoCajaId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbContext.ConceptosMovimientoCaja
            .AsNoTracking()
            .Where(x => x.Activo);

        if (tipoMovimientoCajaId.HasValue && tipoMovimientoCajaId.Value > 0)
        {
            query = query.Where(x => x.TipoMovimientoCajaId == tipoMovimientoCajaId.Value);
        }

        return await query
            .OrderBy(x => x.Nombre)
            .Select(x => new ConceptoMovimientoCajaInfo
            {
                Id = x.Id,
                TipoMovimientoCajaId = x.TipoMovimientoCajaId,
                Codigo = x.Codigo,
                Nombre = x.Nombre,
                Descripcion = x.Descripcion,
                Activo = x.Activo
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ConceptoMovimientoCajaInfo> ObtenerConceptoAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var concepto = await DbContext.ConceptosMovimientoCaja
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (concepto is null)
        {
            throw new NotFoundException("ConceptoMovimientoCaja", id);
        }

        return new ConceptoMovimientoCajaInfo
        {
            Id = concepto.Id,
            TipoMovimientoCajaId = concepto.TipoMovimientoCajaId,
            Codigo = concepto.Codigo,
            Nombre = concepto.Nombre,
            Descripcion = concepto.Descripcion,
            Activo = concepto.Activo
        };
    }

    public async Task<ConceptoMovimientoCajaInfo> CrearConceptoAsync(
        CreateConceptoMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var tipoExiste = await DbContext.TiposMovimientoCaja
            .AnyAsync(x => x.Id == request.TipoMovimientoCajaId && x.Activo, cancellationToken);

        if (!tipoExiste)
        {
            throw new NotFoundException("TipoMovimientoCaja", request.TipoMovimientoCajaId);
        }

        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var existe = await DbContext.ConceptosMovimientoCaja
            .AnyAsync(x => x.TipoMovimientoCajaId == request.TipoMovimientoCajaId &&
                           x.Codigo == codigo &&
                           x.Activo, cancellationToken);

        if (existe)
        {
            throw new ConflictException($"Ya existe un concepto con el código '{codigo}' para este tipo de movimiento.");
        }

        var entity = new ConceptoMovimientoCaja
        {
            TipoMovimientoCajaId = request.TipoMovimientoCajaId,
            Codigo = codigo,
            Nombre = request.Nombre.Trim(),
            Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim(),
            Activo = true
        };

        await DbContext.ConceptosMovimientoCaja.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        return new ConceptoMovimientoCajaInfo
        {
            Id = entity.Id,
            TipoMovimientoCajaId = entity.TipoMovimientoCajaId,
            Codigo = entity.Codigo,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion,
            Activo = entity.Activo
        };
    }

    public async Task<ConceptoMovimientoCajaInfo> ActualizarConceptoAsync(
        int id,
        UpdateConceptoMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.ConceptosMovimientoCaja
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException("ConceptoMovimientoCaja", id);
        }

        var tipoExiste = await DbContext.TiposMovimientoCaja
            .AnyAsync(x => x.Id == request.TipoMovimientoCajaId && x.Activo, cancellationToken);

        if (!tipoExiste)
        {
            throw new NotFoundException("TipoMovimientoCaja", request.TipoMovimientoCajaId);
        }

        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var existe = await DbContext.ConceptosMovimientoCaja
            .AnyAsync(x => x.Id != id &&
                           x.TipoMovimientoCajaId == request.TipoMovimientoCajaId &&
                           x.Codigo == codigo &&
                           x.Activo, cancellationToken);

        if (existe)
        {
            throw new ConflictException($"Ya existe otro concepto con el código '{codigo}' para este tipo de movimiento.");
        }

        entity.TipoMovimientoCajaId = request.TipoMovimientoCajaId;
        entity.Codigo = codigo;
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim();

        await DbContext.SaveChangesAsync(cancellationToken);

        return new ConceptoMovimientoCajaInfo
        {
            Id = entity.Id,
            TipoMovimientoCajaId = entity.TipoMovimientoCajaId,
            Codigo = entity.Codigo,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion,
            Activo = entity.Activo
        };
    }

    public async Task EliminarConceptoAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.ConceptosMovimientoCaja
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException("ConceptoMovimientoCaja", id);
        }

        var tieneMovimientos = await DbContext.MovimientosCaja
            .AnyAsync(x => x.ConceptoMovimientoCajaId == id && x.Activo, cancellationToken);

        if (tieneMovimientos)
        {
            throw new ConflictException("No se puede eliminar el concepto de movimiento porque tiene movimientos registrados en caja.");
        }

        entity.Activo = false;
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    // ============================================================
    // ELIMINAR
    // ============================================================

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .Include(x => x.TurnoCaja)
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw CreateNotFoundException(id);
        }

        if (entity.TurnoCaja.Estado != EstadoTurnoCaja.Abierto)
        {
            throw new ConflictException(
                "No se pueden anular o eliminar movimientos de un turno de caja cerrado.");
        }

        entity.Activo = false;
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    // ============================================================
    // OBTENER TURNO
    // ============================================================

    private async Task<TurnoCajaEntity> ObtenerTurnoAsync(
        int turnoCajaId,
        CancellationToken cancellationToken)
    {
        var turno = await DbContext
            .Set<TurnoCajaEntity>()
            .AsNoTracking()
            .Include(x => x.Caja)
            .Include(x => x.Empleado)
                .ThenInclude(x => x.Persona)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == turnoCajaId &&
                    x.Activo,
                cancellationToken);

        if (turno is null)
        {
            throw new NotFoundException(
                "TurnoCaja",
                turnoCajaId);
        }

        return turno;
    }

    // ============================================================
    // OBTENER MONEDA
    // ============================================================

    private async Task<Moneda> ObtenerMonedaAsync(
        int monedaId,
        CancellationToken cancellationToken)
    {
        var moneda = await DbContext
            .Set<Moneda>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == monedaId &&
                    x.Activo,
                cancellationToken);

        if (moneda is null)
        {
            throw new NotFoundException(
                "Moneda",
                monedaId);
        }

        return moneda;
    }

    // ============================================================
    // OBTENER TIPO MOVIMIENTO
    // ============================================================

    private async Task<TipoMovimientoCaja> ObtenerTipoMovimientoAsync(
        int tipoMovimientoCajaId,
        CancellationToken cancellationToken)
    {
        var tipo = await DbContext.TiposMovimientoCaja
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == tipoMovimientoCajaId &&
                    x.Activo,
                cancellationToken);

        if (tipo is null)
        {
            throw new NotFoundException(
                "TipoMovimientoCaja",
                tipoMovimientoCajaId);
        }

        return tipo;
    }

    // ============================================================
    // OBTENER CONCEPTO MOVIMIENTO
    // ============================================================

    private async Task<ConceptoMovimientoCaja> ObtenerConceptoMovimientoAsync(
        int conceptoMovimientoCajaId,
        CancellationToken cancellationToken)
    {
        var concepto = await DbContext.ConceptosMovimientoCaja
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == conceptoMovimientoCajaId &&
                    x.Activo,
                cancellationToken);

        if (concepto is null)
        {
            throw new NotFoundException(
                "ConceptoMovimientoCaja",
                conceptoMovimientoCajaId);
        }

        return concepto;
    }

    // ============================================================
    // VALIDAR TIPO DE CAMBIO
    // ============================================================

    private static void ValidarTipoCambio(
        Moneda moneda,
        decimal tipoCambio)
    {
        if (tipoCambio <= 0)
        {
            throw new ConflictException(
                "El tipo de cambio debe ser mayor que cero.");
        }

        if (moneda.EsBase &&
            tipoCambio != 1m)
        {
            throw new ConflictException(
                "La moneda base debe utilizar un tipo de cambio igual a 1.");
        }
    }

    // ============================================================
    // NORMALIZAR TIPO CAMBIO
    // ============================================================

    private static decimal NormalizarTipoCambio(
        Moneda moneda,
        decimal tipoCambio)
    {
        if (moneda.EsBase)
            return 1m;

        return decimal.Round(
            tipoCambio,
            6,
            MidpointRounding.AwayFromZero);
    }

    // ============================================================
    // MONTO MONEDA BASE
    // ============================================================

    private static decimal CalcularMontoMonedaBase(
        decimal monto,
        decimal tipoCambio)
    {
        return Redondear(
            monto * tipoCambio);
    }

    // ============================================================
    // BUILD QUERY
    // ============================================================

    private IQueryable<MovimientoCajaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja)
                .ThenInclude(x => x.Caja)
            .Include(x => x.TurnoCaja)
                .ThenInclude(x => x.Empleado)
                .ThenInclude(x => x.Persona)
            .Include(x => x.TipoMovimientoCaja)
            .Include(x => x.ConceptoMovimientoCaja)
            .Include(x => x.Moneda);
    }

    // ============================================================
    // ORDER
    // ============================================================

    private static IQueryable<MovimientoCajaEntity> ApplyOrder(
        IQueryable<MovimientoCajaEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    // ============================================================
    // SEARCH
    // ============================================================

    private static IQueryable<MovimientoCajaEntity> ApplySearch(
        IQueryable<MovimientoCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.TipoMovimientoCaja.Nombre.Contains(search) ||
            x.TipoMovimientoCaja.Codigo.Contains(search) ||
            x.ConceptoMovimientoCaja.Nombre.Contains(search) ||
            x.ConceptoMovimientoCaja.Codigo.Contains(search) ||
            (
                x.Referencia != null &&
                x.Referencia.Contains(search)
            ) ||
            (
                x.Observacion != null &&
                x.Observacion.Contains(search)
            ) ||
            x.TurnoCaja.Caja.Codigo.Contains(search) ||
            x.TurnoCaja.Caja.Nombre.Contains(search) ||
            x.Moneda.Codigo.Contains(search) ||
            x.Moneda.Nombre.Contains(search));
    }

    // ============================================================
    // MAP RESPONSE
    // ============================================================

    private static MovimientoCajaResponse MapToResponse(
        MovimientoCajaEntity entity)
    {
        return new MovimientoCajaResponse
        {
            Id =
                entity.Id,

            TurnoCaja =
                MapTurnoCajaInfo(
                    entity.TurnoCaja),

            TipoMovimientoCajaId =
                entity.TipoMovimientoCajaId,

            TipoMovimientoCaja =
                new TipoMovimientoCajaInfo
                {
                    Id = entity.TipoMovimientoCaja.Id,
                    Codigo = entity.TipoMovimientoCaja.Codigo,
                    Nombre = entity.TipoMovimientoCaja.Nombre,
                    Naturaleza = entity.TipoMovimientoCaja.Naturaleza
                },

            ConceptoMovimientoCajaId =
                entity.ConceptoMovimientoCajaId,

            ConceptoMovimientoCaja =
                new ConceptoMovimientoCajaInfo
                {
                    Id = entity.ConceptoMovimientoCaja.Id,
                    Codigo = entity.ConceptoMovimientoCaja.Codigo,
                    Nombre = entity.ConceptoMovimientoCaja.Nombre
                },

            FechaHora =
                entity.FechaHora,

            MonedaId =
                entity.MonedaId,

            Moneda =
                MapMonedaInfo(
                    entity.Moneda),

            Monto =
                entity.Monto,

            TipoCambio =
                entity.TipoCambio,

            MontoMonedaBase =
                entity.MontoMonedaBase,

            NaturalezaAplicada =
                entity.NaturalezaAplicada,

            Referencia =
                entity.Referencia,

            Observacion =
                entity.Observacion,

            Activo =
                entity.Activo,

            FechaCreacion =
                entity.FechaCreacion,

            FechaModificacion =
                entity.FechaModificacion,

            CreadoPor =
                entity.CreadoPor,

            ModificadoPor =
                entity.ModificadoPor
        };
    }

    // ============================================================
    // MAP RESPONSE LIST
    // ============================================================

    private static IReadOnlyCollection<MovimientoCajaResponse>
        MapToResponseList(
            IEnumerable<MovimientoCajaEntity> entities)
    {
        return entities
            .Select(MapToResponse)
            .ToList();
    }

    // ============================================================
    // MAP TURNO
    // ============================================================

    private static TurnoCajaInfo? MapTurnoCajaInfo(
        TurnoCajaEntity? turno)
    {
        if (turno is null)
            return null;

        return new TurnoCajaInfo
        {
            Id =
                turno.Id,

            Caja =
                MapCajaInfo(
                    turno.Caja),

            Empleado =
                MapEmpleadoInfo(
                    turno.Empleado),

            FechaHoraApertura =
                turno.FechaHoraApertura,

            MontoInicial =
                turno.MontoInicial,

            ObservacionApertura =
                turno.ObservacionApertura,

            FechaHoraCierre =
                turno.FechaHoraCierre,

            ObservacionCierre =
                turno.ObservacionCierre,

            Estado =
                turno.Estado
        };
    }

    // ============================================================
    // MAP CAJA
    // ============================================================

    private static CajaInfo? MapCajaInfo(
        Clinica.Api.Modules.Cajas.Caja.Entity.Caja? caja)
    {
        if (caja is null)
            return null;

        return new CajaInfo
        {
            Id =
                caja.Id,

            Codigo =
                caja.Codigo,

            Nombre =
                caja.Nombre
        };
    }

    // ============================================================
    // MAP EMPLEADO
    // ============================================================

    private static EmpleadoInfo? MapEmpleadoInfo(
        Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado?
            empleado)
    {
        if (empleado is null)
            return null;

        var nombreCompleto =
            string.Join(
                " ",
                new[]
                {
                    empleado.Persona?.Nombres,
                    empleado.Persona?.ApellidoPaterno,
                    empleado.Persona?.ApellidoMaterno
                }
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x)));

        return new EmpleadoInfo
        {
            Id =
                empleado.Id,

            CodigoEmpleado =
                empleado.CodigoEmpleado,

            NombreCompleto =
                nombreCompleto
        };
    }

    // ============================================================
    // MAP MONEDA
    // ============================================================

    private static MonedaInfo MapMonedaInfo(
        Moneda moneda)
    {
        return new MonedaInfo
        {
            Id =
                moneda.Id,

            Codigo =
                moneda.Codigo,

            Nombre =
                moneda.Nombre,

            Simbolo =
                moneda.Simbolo
        };
    }

    // ============================================================
    // NORMALIZAR STRING
    // ============================================================

    private static string? NormalizarOpcional(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    // ============================================================
    // REDONDEAR
    // ============================================================

    private static decimal Redondear(
        decimal value)
    {
        return decimal.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }

    // ============================================================
    // NOT FOUND
    // ============================================================

    private static NotFoundException CreateNotFoundException(
        int id)
    {
        return new NotFoundException(
            "MovimientoCaja",
            id);
    }
}