using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Seed;

public static class AtencionMedicaDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("AtencionMedicaDbSeeder");

        var context = services.GetRequiredService<AtencionMedicaDbContext>();
        await context.Database.MigrateAsync();

        await SeedTiposCampoFormularioAsync(context, logger);

        logger.LogInformation("Migraciones de AtencionMedica aplicadas correctamente.");
    }

    private static async Task SeedTiposCampoFormularioAsync(
        AtencionMedicaDbContext context,
        ILogger logger)
    {
        var catalogo = TipoCampoFormularioSeedData.Create();
        var existentes = await context.TiposCampoFormulario
            .Select(x => x.Codigo)
            .ToListAsync();

        var pendientes = catalogo
            .Where(x => !existentes.Contains(x.Codigo))
            .ToList();

        if (pendientes.Count == 0)
        {
            logger.LogInformation("Catálogo de tipos de campo de formulario ya está actualizado.");
            return;
        }

        context.TiposCampoFormulario.AddRange(pendientes);
        await context.SaveChangesAsync();

        logger.LogInformation(
            "Se insertaron {Count} tipos de campo de formulario.",
            pendientes.Count);
    }
}
