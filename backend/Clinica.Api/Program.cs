using Clinica.Api;
using Clinica.Api.Infrastructure;
using Clinica.Api.Middleware;
using Clinica.Modules.Parametros.Infrastructure.Seed;
using Clinica.Modules.Seguridad.Infrastructure.Seed;
using Clinica.SharedKernel.Responses;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddClinicaApi(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    try
    {
        await IdentitySeeder.SeedAsync(app.Services);
        await ParametrosDbSeeder.MigrateAsync(app.Services);
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
}

// Manejo global de errores
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseClinicaSwagger();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () =>
        ApiResults.Ok("Clinica API operativa"))
    .WithName("Health")
    .WithTags("Sistema")
    .WithSummary("Estado general de la API")
    .WithDescription("Verifica que la API esté en ejecución y responda correctamente.")
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status500InternalServerError);

app.MapClinicaModules();

app.Run();