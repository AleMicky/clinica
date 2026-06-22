using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Parametros.Infrastructure.Seed;

public static class ParametrosDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("ParametrosDbSeeder");

        var context = services.GetRequiredService<ParametrosDbContext>();
        await context.Database.MigrateAsync();

        logger.LogInformation("Migraciones de Parametros aplicadas correctamente.");
    }
}
