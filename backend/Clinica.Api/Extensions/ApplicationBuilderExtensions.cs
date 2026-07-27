using Clinica.Api.Infrastructure;
using Clinica.Api.Middleware;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.AtencionMedica.Infrastructure.Seed;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.Modules.Caja.Infrastructure.Seed;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Laboratorio.Infrastructure.Seed;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Infrastructure.Seed;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.Personas.Infrastructure.Seed;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Infrastructure.Seed;
using Clinica.Modules.Seguridad.Infrastructure.Persistence;
using Clinica.Modules.Seguridad.Infrastructure.Seed;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.Modules.Workflow.Infrastructure.Seed;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static async Task<WebApplication> UseClinicaSeedAsync(
        this WebApplication app,
        bool force = false)
    {
        var logger = app.Services
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("Startup");

        // Las migraciones corren siempre para mantener el schema alineado con el código.
        try
        {
            logger.LogInformation("Aplicando migraciones pendientes...");
            await ApplyPendingMigrationsAsync(app.Services);
            logger.LogInformation("Migraciones aplicadas.");
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "No se pudieron aplicar las migraciones. Verifica que SQL Server esté en ejecución.");

            if (force)
                throw;
        }

        // Seeds solo con --seed/--seed-only o CLINICA_RUN_DB_INIT=true (p. ej. Docker).
        var runDbInit = force
            || app.Configuration.GetValue("CLINICA_RUN_DB_INIT", false);

        if (!runDbInit)
            return app;

        try
        {
            logger.LogInformation("Iniciando seeds...");

            await IdentitySeeder.SeedAsync(app.Services);
            await ParametrosDbSeeder.MigrateAsync(app.Services);
            await RecursosHumanosDbSeeder.MigrateAsync(app.Services);
            await PersonasDbSeeder.MigrateAsync(app.Services);
            await DemoUsersSeeder.SeedAsync(app.Services);
            await RecursosHumanosDbSeeder.SeedEmpleadosMedicosAsync(app.Services);
            await AtencionMedicaDbSeeder.MigrateAsync(app.Services);
            await WorkflowDbSeeder.MigrateAsync(app.Services);
            await LaboratorioDbSeeder.MigrateAsync(app.Services);
            await CajaDbSeeder.MigrateAsync(app.Services);

            logger.LogInformation("Seeds completados.");
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "No se pudo inicializar la base de datos. Verifica que SQL Server esté en ejecución.");

            if (force)
                throw;
        }

        return app;
    }

    private static async Task ApplyPendingMigrationsAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var sp = scope.ServiceProvider;

        await sp.GetRequiredService<SeguridadDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<ParametrosDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<RecursosHumanosDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<PersonasDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<AtencionMedicaDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<WorkflowDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<LaboratorioDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<CajaDbContext>().Database.MigrateAsync();
    }

    public static WebApplication UseClinicaPipeline(this WebApplication app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.UseClinicaSwagger();
            app.UseHttpsRedirection();
        }
        else
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor
                    | ForwardedHeaders.XForwardedProto,
            });
        }

        app.UseCors("Frontend");

        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }
}
