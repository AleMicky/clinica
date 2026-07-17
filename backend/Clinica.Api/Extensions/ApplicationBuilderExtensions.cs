using Clinica.Api.Infrastructure;
using Clinica.Api.Middleware;
using Clinica.Modules.AtencionMedica.Infrastructure.Seed;
using Clinica.Modules.Parametros.Infrastructure.Seed;
using Clinica.Modules.Personas.Infrastructure.Seed;
using Clinica.Modules.RecursosHumanos.Infrastructure.Seed;
using Clinica.Modules.Seguridad.Infrastructure.Seed;
using Clinica.Modules.Workflow.Infrastructure.Seed;
using Microsoft.AspNetCore.HttpOverrides;

namespace Clinica.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static async Task<WebApplication> UseClinicaSeedAsync(
        this WebApplication app,
        bool force = false)
    {
        var runDbInit = force
            || app.Environment.IsDevelopment()
            || app.Configuration.GetValue("CLINICA_RUN_DB_INIT", false);

        if (!runDbInit)
            return app;

        var logger = app.Services
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("Startup");

        try
        {
            logger.LogInformation("Iniciando migraciones y seeds...");

            await IdentitySeeder.SeedAsync(app.Services);
            await ParametrosDbSeeder.MigrateAsync(app.Services);
            await RecursosHumanosDbSeeder.MigrateAsync(app.Services);
            await PersonasDbSeeder.MigrateAsync(app.Services);
            await DemoUsersSeeder.SeedAsync(app.Services);
            await RecursosHumanosDbSeeder.SeedEmpleadosMedicosAsync(app.Services);
            await AtencionMedicaDbSeeder.MigrateAsync(app.Services);
            await WorkflowDbSeeder.MigrateAsync(app.Services);

            logger.LogInformation("Migraciones y seeds completados.");
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