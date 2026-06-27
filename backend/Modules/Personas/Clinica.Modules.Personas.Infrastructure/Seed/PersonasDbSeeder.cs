using Clinica.Modules.Personas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Personas.Infrastructure.Seed;

public static class PersonasDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("PersonasDbSeeder");

        var context = services.GetRequiredService<PersonasDbContext>();
        await context.Database.MigrateAsync();

        logger.LogInformation("Migraciones de Personas aplicadas correctamente.");
    }
}
