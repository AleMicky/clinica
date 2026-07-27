using Clinica.Modules.Compras.Domain.Entities;
using Clinica.Modules.Compras.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Compras.Infrastructure.Seed;

public static class ComprasDbSeeder
{
    public static readonly Guid Proveedor1Id = Guid.Parse("c1000001-0000-4000-8000-000000000001");
    public static readonly Guid Proveedor2Id = Guid.Parse("c1000001-0000-4000-8000-000000000002");
    public static readonly Guid OrdenDemoId = Guid.Parse("c3000001-0000-4000-8000-000000000001");

    // Mismos IDs que AlmacenDbSeeder (productos demo).
    private static readonly Guid ProductoParacetamolId = Guid.Parse("a2000001-0000-4000-8000-000000000001");
    private static readonly Guid ProductoIbuprofenoId = Guid.Parse("a2000001-0000-4000-8000-000000000002");
    private static readonly Guid ProductoJeringaId = Guid.Parse("a2000001-0000-4000-8000-000000000004");

    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("ComprasDbSeeder");
        var context = services.GetRequiredService<ComprasDbContext>();
        await context.Database.MigrateAsync();
        await SeedAsync(context, logger);
        logger.LogInformation("Migraciones y datos demo de Compras aplicados correctamente.");
    }

    private static async Task SeedAsync(ComprasDbContext context, ILogger logger)
    {
        await SeedProveedoresAsync(context);
        await SeedOrdenDemoAsync(context, logger);
    }

    private static async Task SeedProveedoresAsync(ComprasDbContext context)
    {
        if (!await context.Proveedores.AnyAsync(x => x.Id == Proveedor1Id || x.Codigo == "PROV-001"))
        {
            context.Proveedores.Add(new Proveedor
            {
                Id = Proveedor1Id,
                Codigo = "PROV-001",
                Nombre = "Distribuidora Farmacéutica Demo",
                Nit = "123456789",
                Telefono = "7000-1111",
                Email = "ventas@farmademo.local",
                Activo = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        if (!await context.Proveedores.AnyAsync(x => x.Id == Proveedor2Id || x.Codigo == "PROV-002"))
        {
            context.Proveedores.Add(new Proveedor
            {
                Id = Proveedor2Id,
                Codigo = "PROV-002",
                Nombre = "Insumos Clínicos S.A.",
                Nit = "987654321",
                Telefono = "7000-2222",
                Email = "contacto@insumos.local",
                Activo = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedOrdenDemoAsync(ComprasDbContext context, ILogger logger)
    {
        if (await context.OrdenesCompra.AnyAsync())
            return;

        if (!await context.Proveedores.AnyAsync(x => x.Id == Proveedor1Id))
        {
            logger.LogWarning("Proveedor demo no encontrado; se omite orden de compra demo.");
            return;
        }

        var now = DateTime.UtcNow;
        var orden = new OrdenCompra
        {
            Id = OrdenDemoId,
            Numero = "OC-SEED-000001",
            ProveedorId = Proveedor1Id,
            Fecha = now.AddDays(-3),
            Estado = OrdenCompraEstados.Confirmada,
            Observaciones = "Orden demo pendiente de recepción",
            CreatedAt = now,
            CreatedBy = "seed",
            Detalles =
            [
                new OrdenCompraDetalle
                {
                    Id = Guid.Parse("c3000001-0000-4000-8000-000000000011"),
                    OrdenCompraId = OrdenDemoId,
                    ProductoId = ProductoParacetamolId,
                    Cantidad = 500,
                    CostoUnitario = 0.32m,
                    CantidadRecibida = 0,
                    CreatedAt = now,
                    CreatedBy = "seed",
                },
                new OrdenCompraDetalle
                {
                    Id = Guid.Parse("c3000001-0000-4000-8000-000000000012"),
                    OrdenCompraId = OrdenDemoId,
                    ProductoId = ProductoIbuprofenoId,
                    Cantidad = 300,
                    CostoUnitario = 0.40m,
                    CantidadRecibida = 0,
                    CreatedAt = now,
                    CreatedBy = "seed",
                },
                new OrdenCompraDetalle
                {
                    Id = Guid.Parse("c3000001-0000-4000-8000-000000000013"),
                    OrdenCompraId = OrdenDemoId,
                    ProductoId = ProductoJeringaId,
                    Cantidad = 1000,
                    CostoUnitario = 0.12m,
                    CantidadRecibida = 0,
                    CreatedAt = now,
                    CreatedBy = "seed",
                },
            ],
        };

        context.OrdenesCompra.Add(orden);
        await context.SaveChangesAsync();
        logger.LogInformation("Orden de compra demo creada ({Numero}).", orden.Numero);
    }
}
