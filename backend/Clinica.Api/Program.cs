using Clinica.Api;
using Clinica.Api.Infrastructure;
using Clinica.Modules.Parametros.Infrastructure.Seed;
using Clinica.Modules.Seguridad.Infrastructure.Seed;
using Clinica.SharedKernel.Contracts;
using Microsoft.AspNetCore.Mvc;

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
        var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
        logger.LogError(ex, "No se pudo inicializar la base de datos. Verifica que SQL Server esté en ejecución.");
    }
}

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseClinicaSwagger();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => ApiResponse<string>.Ok("Clinica API operativa"))
    .WithName("Health")
    .WithTags("Sistema")
    .WithSummary("Estado general de la API")
    .WithDescription("Verifica que la API esté en ejecución y responda correctamente.")
    .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
    .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);

app.MapClinicaModules();

app.Run();
