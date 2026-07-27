using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.Modules.Farmacia.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Farmacia.Infrastructure.Seed;

public static class FarmaciaDbSeeder
{
    // Mismos IDs de productos demo de Almacén.
    private static readonly Guid ProductoParacetamolId = Guid.Parse("a2000001-0000-4000-8000-000000000001");
    private static readonly Guid ProductoIbuprofenoId = Guid.Parse("a2000001-0000-4000-8000-000000000002");
    private static readonly Guid ProductoAmoxicilinaId = Guid.Parse("a2000001-0000-4000-8000-000000000003");
    private static readonly Guid ProductoSueroId = Guid.Parse("a2000001-0000-4000-8000-000000000006");

    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("FarmaciaDbSeeder");
        var context = services.GetRequiredService<FarmaciaDbContext>();
        await context.Database.MigrateAsync();
        await SeedAsync(context, logger);
        logger.LogInformation("Migraciones y datos demo de Farmacia aplicados correctamente.");
    }

    private static async Task SeedAsync(FarmaciaDbContext context, ILogger logger)
    {
        await SeedPreciosAsync(context, logger);
        await SeedRecetaDemoAsync(context, logger);
    }

    private static async Task SeedPreciosAsync(FarmaciaDbContext context, ILogger logger)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var precios = new (Guid ProductoId, decimal Importe, string Motivo)[]
        {
            (ProductoParacetamolId, 1.50m, "Precio lista demo"),
            (ProductoIbuprofenoId, 2.00m, "Precio lista demo"),
            (ProductoAmoxicilinaId, 3.50m, "Precio lista demo"),
            (ProductoSueroId, 12.00m, "Precio lista demo"),
        };

        foreach (var p in precios)
        {
            var existe = await context.Precios.AnyAsync(x =>
                x.ProductoId == p.ProductoId
                && x.FechaFin == null
                && x.FechaInicio <= hoy);

            if (existe)
                continue;

            context.Precios.Add(new Precio
            {
                Id = Guid.NewGuid(),
                ProductoId = p.ProductoId,
                Importe = p.Importe,
                FechaInicio = hoy.AddMonths(-1),
                FechaFin = null,
                MotivoCambio = p.Motivo,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "seed",
            });
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Precios demo de farmacia aplicados.");
    }

    private static async Task SeedRecetaDemoAsync(FarmaciaDbContext context, ILogger logger)
    {
        if (await context.Recetas.AnyAsync())
            return;

        // Paciente demo: el primero disponible en personas (si hay seed previo).
        Guid? pacienteId = null;
        try
        {
            pacienteId = await context.Database
                .SqlQueryRaw<Guid>(
                    """
                    SELECT TOP 1 Id AS [Value]
                    FROM personas.Pacientes
                    WHERE IsDeleted = 0
                    ORDER BY CreatedAt
                    """)
                .FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo consultar pacientes; se omite receta demo.");
            return;
        }

        if (pacienteId is null || pacienteId == Guid.Empty)
        {
            logger.LogWarning("No hay pacientes; se omite receta demo de farmacia.");
            return;
        }

        var now = DateTime.UtcNow;
        var recetaId = Guid.Parse("f1000001-0000-4000-8000-000000000001");
        context.Recetas.Add(new Receta
        {
            Id = recetaId,
            Numero = "RX-SEED-000001",
            PacienteId = pacienteId.Value,
            EsExterna = false,
            Fecha = now.AddHours(-2),
            Estado = RecetaEstados.Activa,
            Observaciones = "Receta demo para dispensación",
            CreatedAt = now,
            CreatedBy = "seed",
            Detalles =
            [
                new RecetaDetalle
                {
                    Id = Guid.Parse("f1000001-0000-4000-8000-000000000011"),
                    RecetaId = recetaId,
                    ProductoId = ProductoParacetamolId,
                    Cantidad = 20,
                    Indicaciones = "1 tableta cada 8 horas",
                    CreatedAt = now,
                    CreatedBy = "seed",
                },
                new RecetaDetalle
                {
                    Id = Guid.Parse("f1000001-0000-4000-8000-000000000012"),
                    RecetaId = recetaId,
                    ProductoId = ProductoIbuprofenoId,
                    Cantidad = 10,
                    Indicaciones = "1 tableta cada 12 horas con alimentos",
                    CreatedAt = now,
                    CreatedBy = "seed",
                },
            ],
        });

        await context.SaveChangesAsync();
        logger.LogInformation("Receta demo RX-SEED-000001 creada.");
    }
}
