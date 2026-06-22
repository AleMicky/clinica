using Clinica.SharedKernel.Responses;

namespace Clinica.Api.Extensions;

public static class EndpointRouteBuilderExtensions
{
    public static WebApplication MapClinicaEndpoints(this WebApplication app)
    {
        app.MapGet("/health", () =>
                ApiResults.Ok("Clinica API operativa"))
            .WithName("Health")
            .WithTags("Sistema")
            .WithSummary("Estado general de la API")
            .WithDescription("Verifica que la API esté en ejecución y responda correctamente.")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapClinicaModules();

        return app;
    }
}