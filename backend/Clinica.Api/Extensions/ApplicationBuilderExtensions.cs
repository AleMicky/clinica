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
        this WebApplication app)
    {
        var runDbInit = app.Environment.IsDevelopment()
            || app.Configuration.GetValue("CLINICA_RUN_DB_INIT", false);

        if (!runDbInit)
            return app;

        try
        {
            await IdentitySeeder.SeedAsync(app.Services);
            await ParametrosDbSeeder.MigrateAsync(app.Services);
            await RecursosHumanosDbSeeder.MigrateAsync(app.Services);
            await PersonasDbSeeder.MigrateAsync(app.Services);
            await DemoUsersSeeder.SeedAsync(app.Services);
            await AtencionMedicaDbSeeder.MigrateAsync(app.Services);
            await WorkflowDbSeeder.MigrateAsync(app.Services);
        }
        catch (Exception ex)
        {
            var logger = app.Services
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("Startup");

            logger.LogError(
                ex,
                "No se pudo inicializar la base de datos. Verifica que SQL Server esté en ejecución.");
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