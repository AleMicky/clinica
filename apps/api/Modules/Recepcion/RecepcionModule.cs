using Clinica.Api.Modules.Recepcion.Pacientes.Endpoints;
using Clinica.Api.Modules.Recepcion.Pacientes.Services;

namespace Clinica.Api.Modules.Recepcion;

public static class RecepcionModule
{
    public static IServiceCollection AddRecepcionModule(
        this IServiceCollection services)
    {
        services.AddScoped<PacienteService>();

        return services;
    }

    public static IEndpointRouteBuilder MapRecepcionModule(
        this IEndpointRouteBuilder app)
    {
        app.MapPacienteEndpoints();

        return app;
    }
}