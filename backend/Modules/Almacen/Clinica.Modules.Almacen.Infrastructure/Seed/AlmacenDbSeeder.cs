using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Almacen.Infrastructure.Seed;

public static class AlmacenDbSeeder
{
    public static readonly Guid CategoriaMedId = Guid.Parse("a1000001-0000-4000-8000-000000000001");
    public static readonly Guid CategoriaInsId = Guid.Parse("a1000001-0000-4000-8000-000000000002");

    public static readonly Guid ProductoParacetamolId = Guid.Parse("a2000001-0000-4000-8000-000000000001");
    public static readonly Guid ProductoIbuprofenoId = Guid.Parse("a2000001-0000-4000-8000-000000000002");
    public static readonly Guid ProductoAmoxicilinaId = Guid.Parse("a2000001-0000-4000-8000-000000000003");
    public static readonly Guid ProductoJeringaId = Guid.Parse("a2000001-0000-4000-8000-000000000004");
    public static readonly Guid ProductoGuantesId = Guid.Parse("a2000001-0000-4000-8000-000000000005");
    public static readonly Guid ProductoSueroId = Guid.Parse("a2000001-0000-4000-8000-000000000006");

    public static readonly Guid ProveedorDemoId = Guid.Parse("c1000001-0000-4000-8000-000000000001");

    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("AlmacenDbSeeder");
        var context = services.GetRequiredService<AlmacenDbContext>();

        await context.Database.MigrateAsync();
        await SeedAsync(context, logger);
        logger.LogInformation("Migraciones y datos demo de Almacén aplicados correctamente.");
    }

    private static async Task SeedAsync(AlmacenDbContext context, ILogger logger)
    {
        await SeedCategoriasAsync(context);
        await SeedProductosAsync(context, logger);
        await SeedLotesYExistenciasAsync(context, logger);
    }

    private static async Task SeedCategoriasAsync(AlmacenDbContext context)
    {
        async Task EnsureCategoria(Guid id, string codigo, string nombre)
        {
            if (await context.Categorias.AnyAsync(x => x.Id == id || x.Codigo == codigo))
                return;

            context.Categorias.Add(new Categoria
            {
                Id = id,
                Codigo = codigo,
                Nombre = nombre,
                Activo = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await EnsureCategoria(CategoriaMedId, "MED", "Medicamentos");
        await EnsureCategoria(CategoriaInsId, "INS", "Insumos médicos");
        await context.SaveChangesAsync();
    }

    private static async Task SeedProductosAsync(AlmacenDbContext context, ILogger logger)
    {
        var unidadTab = await context.Set<UnidadesMedida>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Codigo == "TAB");
        var unidadUnd = await context.Set<UnidadesMedida>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Codigo == "UND");
        var unidadMl = await context.Set<UnidadesMedida>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Codigo == "ML");

        if (unidadTab is null && unidadUnd is null && unidadMl is null)
        {
            logger.LogWarning(
                "No hay unidades de medida en Parámetros; se omiten productos demo de Almacén.");
            return;
        }

        var tabId = unidadTab?.Id ?? unidadUnd?.Id ?? unidadMl!.Id;
        var undId = unidadUnd?.Id ?? unidadTab?.Id ?? unidadMl!.Id;
        var mlId = unidadMl?.Id ?? undId;

        var productos = new (Guid Id, string Codigo, string Nombre, Guid CategoriaId, Guid UnidadId, decimal StockMin, bool EsMed)[]
        {
            (ProductoParacetamolId, "MED-PARA-500", "Paracetamol 500 mg", CategoriaMedId, tabId, 50, true),
            (ProductoIbuprofenoId, "MED-IBU-400", "Ibuprofeno 400 mg", CategoriaMedId, tabId, 40, true),
            (ProductoAmoxicilinaId, "MED-AMOX-500", "Amoxicilina 500 mg", CategoriaMedId, tabId, 30, true),
            (ProductoSueroId, "MED-SUERO-NS", "Suero fisiológico 500 mL", CategoriaMedId, mlId, 20, true),
            (ProductoJeringaId, "INS-JER-5ML", "Jeringa 5 mL", CategoriaInsId, undId, 100, false),
            (ProductoGuantesId, "INS-GUA-M", "Guantes de látex M (caja)", CategoriaInsId, undId, 10, false),
        };

        foreach (var p in productos)
        {
            if (await context.Productos.AnyAsync(x => x.Id == p.Id || x.Codigo == p.Codigo))
                continue;

            context.Productos.Add(new Producto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nombre = p.Nombre,
                CategoriaId = p.CategoriaId,
                UnidadMedidaId = p.UnidadId,
                StockMinimo = p.StockMin,
                ControlaLote = true,
                ControlaVencimiento = true,
                EsMedicamento = p.EsMed,
                Activo = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedLotesYExistenciasAsync(AlmacenDbContext context, ILogger logger)
    {
        if (await context.Lotes.AnyAsync())
            return;

        if (!await context.Productos.AnyAsync())
        {
            logger.LogWarning("Sin productos; se omiten lotes/existencias demo.");
            return;
        }

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var now = DateTime.UtcNow;
        var lotes = new (Guid ProductoId, string Numero, DateOnly Vence, decimal Cantidad, decimal Costo)[]
        {
            (ProductoParacetamolId, "LOT-PARA-2026A", hoy.AddMonths(18), 200, 0.35m),
            (ProductoParacetamolId, "LOT-PARA-2026B", hoy.AddMonths(8), 80, 0.35m),
            (ProductoIbuprofenoId, "LOT-IBU-2026A", hoy.AddMonths(14), 150, 0.45m),
            (ProductoAmoxicilinaId, "LOT-AMOX-2026A", hoy.AddMonths(10), 120, 0.80m),
            (ProductoSueroId, "LOT-SUERO-2026A", hoy.AddMonths(24), 60, 3.50m),
            (ProductoJeringaId, "LOT-JER-2026A", hoy.AddYears(3), 500, 0.15m),
            (ProductoGuantesId, "LOT-GUA-2026A", hoy.AddYears(2), 25, 4.00m),
        };

        var productoIds = await context.Productos.Select(x => x.Id).ToListAsync();
        var movimientoId = Guid.NewGuid();
        var correlativo = $"ALM-SEED-{DateTime.UtcNow:yyyyMMdd}";
        var movimiento = new Movimiento
        {
            Id = movimientoId,
            Numero = correlativo,
            Tipo = MovimientoTipos.Ingreso,
            Fecha = now.AddDays(-7),
            Estado = MovimientoEstados.Aplicado,
            Observaciones = "Carga inicial de inventario demo",
            ModuloOrigen = "Almacen",
            EntidadOrigen = "Seed",
            ProveedorId = ProveedorDemoId,
            RequiereAprobacion = false,
            CreatedAt = now,
            CreatedBy = "seed",
        };

        foreach (var item in lotes)
        {
            if (!productoIds.Contains(item.ProductoId))
                continue;

            var loteId = Guid.NewGuid();
            context.Lotes.Add(new Lote
            {
                Id = loteId,
                ProductoId = item.ProductoId,
                Numero = item.Numero,
                FechaVencimiento = item.Vence,
                FechaIngreso = now.AddDays(-7),
                ProveedorId = ProveedorDemoId,
                CreatedAt = now,
                CreatedBy = "seed",
            });

            context.Existencias.Add(new Existencia
            {
                Id = Guid.NewGuid(),
                ProductoId = item.ProductoId,
                LoteId = loteId,
                Cantidad = item.Cantidad,
                CreatedAt = now,
                CreatedBy = "seed",
            });

            movimiento.Detalles.Add(new MovimientoDetalle
            {
                Id = Guid.NewGuid(),
                MovimientoId = movimientoId,
                ProductoId = item.ProductoId,
                LoteId = loteId,
                Cantidad = item.Cantidad,
                CostoUnitario = item.Costo,
                CreatedAt = now,
                CreatedBy = "seed",
            });
        }

        if (movimiento.Detalles.Count > 0)
            context.Movimientos.Add(movimiento);

        await context.SaveChangesAsync();
        logger.LogInformation("Lotes, existencias y movimiento de ingreso demo creados.");
    }
}
