using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Caja.Infrastructure.Seed;

public static class CajaDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("CajaDbSeeder");

        var context = services.GetRequiredService<CajaDbContext>();
        await context.Database.MigrateAsync();

        await SeedMetodosPagoAsync(context);
        await SeedConceptosAsync(context);
        await SeedCajasAsync(context);

        logger.LogInformation("Migraciones y seed de Caja aplicados correctamente.");
    }

    private static async Task SeedMetodosPagoAsync(CajaDbContext context)
    {
        var items = new (string Codigo, string Nombre, bool RequiereReferencia, bool EsEfectivo)[]
        {
            ("EFECTIVO", "Efectivo", false, true),
            ("QR", "QR", true, false),
            ("TRANSFERENCIA", "Transferencia", true, false),
            ("TARJETA_DEBITO", "Tarjeta débito", true, false),
            ("TARJETA_CREDITO", "Tarjeta crédito", true, false),
            ("CREDITO", "Crédito", false, false),
        };

        foreach (var item in items)
        {
            if (await context.MetodosPago.AnyAsync(x => x.Codigo == item.Codigo))
                continue;

            context.MetodosPago.Add(new MetodoPago
            {
                Id = Guid.NewGuid(),
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                RequiereReferencia = item.RequiereReferencia,
                EsEfectivo = item.EsEfectivo,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedConceptosAsync(CajaDbContext context)
    {
        var items = new (string Codigo, string Nombre, string Tipo)[]
        {
            ("FONDO_INICIAL", "Fondo inicial", TipoMovimientoCaja.Ingreso),
            ("COBRO_ATENCION", "Cobro atención médica", TipoMovimientoCaja.Ingreso),
            ("COBRO_LABORATORIO", "Cobro laboratorio", TipoMovimientoCaja.Ingreso),
            ("COBRO_FARMACIA", "Cobro farmacia", TipoMovimientoCaja.Ingreso),
            ("OTRO_INGRESO", "Otro ingreso", TipoMovimientoCaja.Ingreso),
            ("DEVOLUCION", "Devolución", TipoMovimientoCaja.Egreso),
            ("GASTO_MENOR", "Gasto menor", TipoMovimientoCaja.Egreso),
            ("RETIRO_CAJA", "Retiro de caja", TipoMovimientoCaja.Egreso),
        };

        foreach (var item in items)
        {
            if (await context.ConceptosCaja.AnyAsync(x => x.Codigo == item.Codigo))
                continue;

            context.ConceptosCaja.Add(new ConceptoCaja
            {
                Id = Guid.NewGuid(),
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                TipoMovimiento = item.Tipo,
                Activo = true,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedCajasAsync(CajaDbContext context)
    {
        var items = new (string Codigo, string Nombre, string Descripcion)[]
        {
            ("CAJ-REC-01", "Caja Recepción", "Caja principal de recepción"),
            ("CAJ-FAR-01", "Caja Farmacia", "Caja de farmacia"),
            ("CAJ-LAB-01", "Caja Laboratorio", "Caja de laboratorio"),
        };

        foreach (var item in items)
        {
            if (await context.Cajas.AnyAsync(x => x.Codigo == item.Codigo))
                continue;

            context.Cajas.Add(new CajaFisica
            {
                Id = Guid.NewGuid(),
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                Descripcion = item.Descripcion,
                Activo = true,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await context.SaveChangesAsync();
    }
}
