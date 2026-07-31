using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using AlmacenEntity = Clinica.Modules.Almacen.Domain.Entities.Almacen;

namespace Clinica.Modules.Almacen.Infrastructure.Seed;

public static class AlmacenDbSeeder
{
    public static readonly Guid TipoAlmacenGeneralId = Guid.Parse("a0100001-0000-4000-8000-000000000001");
    public static readonly Guid AlmacenPrincipalId = Guid.Parse("a0200001-0000-4000-8000-000000000001");
    public static readonly Guid UnidadTabId = Guid.Parse("a0300001-0000-4000-8000-000000000001");
    public static readonly Guid UnidadUndId = Guid.Parse("a0300001-0000-4000-8000-000000000002");
    public static readonly Guid UnidadMlId = Guid.Parse("a0300001-0000-4000-8000-000000000003");
    public static readonly Guid CategoriaMedId = Guid.Parse("a1000001-0000-4000-8000-000000000001");
    public static readonly Guid CategoriaInsId = Guid.Parse("a1000001-0000-4000-8000-000000000002");
    public static readonly Guid FormaTabletaId = Guid.Parse("a0400001-0000-4000-8000-000000000001");
    public static readonly Guid FormaSolucionId = Guid.Parse("a0400001-0000-4000-8000-000000000002");

    public static readonly Guid ProductoParacetamolId = Guid.Parse("a2000001-0000-4000-8000-000000000001");
    public static readonly Guid ProductoIbuprofenoId = Guid.Parse("a2000001-0000-4000-8000-000000000002");
    public static readonly Guid ProductoAmoxicilinaId = Guid.Parse("a2000001-0000-4000-8000-000000000003");
    public static readonly Guid ProductoJeringaId = Guid.Parse("a2000001-0000-4000-8000-000000000004");
    public static readonly Guid ProductoGuantesId = Guid.Parse("a2000001-0000-4000-8000-000000000005");
    public static readonly Guid ProductoSueroId = Guid.Parse("a2000001-0000-4000-8000-000000000006");

    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("AlmacenDbSeeder");
        var context = services.GetRequiredService<AlmacenDbContext>();

        await context.Database.MigrateAsync();
        await SeedCatalogosAsync(context);
        await SeedProductosYStockAsync(context, logger);
        logger.LogInformation("Migraciones y catálogos base de Almacén aplicados.");
    }

    private static async Task SeedCatalogosAsync(AlmacenDbContext context)
    {
        if (!await context.TiposAlmacen.AnyAsync(x => x.Id == TipoAlmacenGeneralId || x.Codigo == "GEN"))
        {
            context.TiposAlmacen.Add(new TipoAlmacen
            {
                Id = TipoAlmacenGeneralId,
                Codigo = "GEN",
                Nombre = "General",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        if (!await context.Almacenes.AnyAsync(x => x.Id == AlmacenPrincipalId || x.Codigo == "ALM-PRIN"))
        {
            context.Almacenes.Add(new AlmacenEntity
            {
                Id = AlmacenPrincipalId,
                Codigo = "ALM-PRIN",
                Nombre = "Almacén principal",
                TipoAlmacenId = TipoAlmacenGeneralId,
                PermiteVenta = true,
                PermiteDispensacion = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        async Task EnsureUnidad(Guid id, string codigo, string nombre, string abrev, bool decimales)
        {
            if (await context.UnidadesMedida.AnyAsync(x => x.Id == id || x.Codigo == codigo))
                return;
            context.UnidadesMedida.Add(new UnidadMedida
            {
                Id = id,
                Codigo = codigo,
                Nombre = nombre,
                Abreviatura = abrev,
                PermiteDecimales = decimales,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await EnsureUnidad(UnidadTabId, "TAB", "Tableta", "tab", false);
        await EnsureUnidad(UnidadUndId, "UND", "Unidad", "und", false);
        await EnsureUnidad(UnidadMlId, "ML", "Mililitro", "ml", true);

        async Task EnsureCategoria(Guid id, string codigo, string nombre)
        {
            if (await context.CategoriasProducto.AnyAsync(x => x.Id == id || x.Codigo == codigo))
                return;
            context.CategoriasProducto.Add(new CategoriaProducto
            {
                Id = id,
                Codigo = codigo,
                Nombre = nombre,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await EnsureCategoria(CategoriaMedId, "MED", "Medicamentos");
        await EnsureCategoria(CategoriaInsId, "INS", "Insumos médicos");

        async Task EnsureForma(Guid id, string codigo, string nombre)
        {
            if (await context.FormasFarmaceuticas.AnyAsync(x => x.Id == id || x.Codigo == codigo))
                return;
            context.FormasFarmaceuticas.Add(new FormaFarmaceutica
            {
                Id = id,
                Codigo = codigo,
                Nombre = nombre,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await EnsureForma(FormaTabletaId, "TAB", "Tableta");
        await EnsureForma(FormaSolucionId, "SOL", "Solución");

        var tiposMovimiento = new (string Codigo, string Nombre, TipoOperacionStock Op)[]
        {
            ("INGRESO", "Ingreso", TipoOperacionStock.Entrada),
            ("SALIDA", "Salida", TipoOperacionStock.Salida),
            ("AJUSTE", "Ajuste", TipoOperacionStock.Entrada),
            ("BAJA", "Baja", TipoOperacionStock.Salida),
            ("TRANSFERENCIA", "Transferencia", TipoOperacionStock.Transferencia),
        };

        foreach (var t in tiposMovimiento)
        {
            var existing = await context.TiposMovimientoAlmacen
                .FirstOrDefaultAsync(x => x.Codigo == t.Codigo);
            if (existing is null)
            {
                context.TiposMovimientoAlmacen.Add(new TipoMovimientoAlmacen
                {
                    Id = Guid.NewGuid(),
                    Codigo = t.Codigo,
                    Nombre = t.Nombre,
                    OperacionStock = t.Op,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "seed",
                });
            }
            else if (existing.Codigo == "AJUSTE" && existing.OperacionStock == TipoOperacionStock.SinMovimiento)
            {
                existing.OperacionStock = TipoOperacionStock.Entrada;
                existing.UpdatedAt = DateTime.UtcNow;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedProductosYStockAsync(AlmacenDbContext context, ILogger logger)
    {
        var productos = new (Guid Id, string Codigo, string Nombre, Guid CategoriaId, Guid UnidadId, decimal StockMin, bool EsMed)[]
        {
            (ProductoParacetamolId, "MED-PARA-500", "Paracetamol 500 mg", CategoriaMedId, UnidadTabId, 50, true),
            (ProductoIbuprofenoId, "MED-IBU-400", "Ibuprofeno 400 mg", CategoriaMedId, UnidadTabId, 40, true),
            (ProductoAmoxicilinaId, "MED-AMOX-500", "Amoxicilina 500 mg", CategoriaMedId, UnidadTabId, 30, true),
            (ProductoSueroId, "MED-SUERO-NS", "Suero fisiológico 500 mL", CategoriaMedId, UnidadMlId, 20, true),
            (ProductoJeringaId, "INS-JER-5ML", "Jeringa 5 mL", CategoriaInsId, UnidadUndId, 100, false),
            (ProductoGuantesId, "INS-GUA-M", "Guantes de látex M (caja)", CategoriaInsId, UnidadUndId, 10, false),
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
                CategoriaProductoId = p.CategoriaId,
                UnidadMedidaId = p.UnidadId,
                StockMinimo = p.StockMin,
                ManejaLote = true,
                ManejaVencimiento = true,
                EsMedicamento = p.EsMed,
                Activo = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await context.SaveChangesAsync();

        if (await context.ProductosLote.AnyAsync())
            return;

        if (!await context.Productos.AnyAsync())
        {
            logger.LogWarning("Sin productos; se omiten lotes/stock demo.");
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
        var stockPorProducto = new Dictionary<Guid, decimal>();

        foreach (var item in lotes)
        {
            if (!productoIds.Contains(item.ProductoId))
                continue;

            context.ProductosLote.Add(new ProductoLote
            {
                Id = Guid.NewGuid(),
                ProductoId = item.ProductoId,
                AlmacenId = AlmacenPrincipalId,
                NumeroLote = item.Numero,
                FechaVencimiento = item.Vence,
                CantidadInicial = item.Cantidad,
                CantidadDisponible = item.Cantidad,
                CostoUnitario = item.Costo,
                CreatedAt = now,
                CreatedBy = "seed",
            });

            stockPorProducto[item.ProductoId] =
                stockPorProducto.GetValueOrDefault(item.ProductoId) + item.Cantidad;
        }

        foreach (var (productoId, cantidad) in stockPorProducto)
        {
            var producto = await context.Productos.FirstAsync(x => x.Id == productoId);
            context.ProductosStock.Add(new ProductoStock
            {
                Id = Guid.NewGuid(),
                ProductoId = productoId,
                AlmacenId = AlmacenPrincipalId,
                CantidadDisponible = cantidad,
                StockMinimo = producto.StockMinimo,
                StockMaximo = producto.StockMaximo,
                CreatedAt = now,
                CreatedBy = "seed",
            });
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Productos y stock demo de Almacén sembrados.");
    }
}
