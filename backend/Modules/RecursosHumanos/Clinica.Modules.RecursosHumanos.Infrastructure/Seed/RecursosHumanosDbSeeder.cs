using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Seed;

public static class RecursosHumanosDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("RecursosHumanosDbSeeder");

        var context = services.GetRequiredService<RecursosHumanosDbContext>();
        await context.Database.MigrateAsync();

        logger.LogInformation("Migraciones de RecursosHumanos aplicadas correctamente.");
    }
}
