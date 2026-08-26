using Clinica.Api.Modules.Recepcion.Admision.Endpoints;
using Clinica.Api.Modules.Recepcion.Admision.Services;
using Clinica.Api.Modules.Recepcion.Pacientes.Endpoints;
using Clinica.Api.Modules.Recepcion.Pacientes.Services;

namespace Clinica.Api.Modules.Recepcion;

public static class RecepcionModule
{
    public static IServiceCollection AddRecepcionModule(
        this IServiceCollection services)
    {
        services.AddScoped<PacienteService>();
        services.AddScoped<PacienteConvenioService>();
        services.AddScoped<AdmisionService>();
        services.AddScoped<AdmisionDetalleService>();
        services.AddScoped<AdmisionPdfService>();
        services.AddScoped<IPacienteImportacionService, PacienteImportacionService>();

        return services;
    }

    public static IEndpointRouteBuilder MapRecepcionModule(
        this IEndpointRouteBuilder app)
    {
        app.MapPacienteEndpoints();
        app.MapAdmisionEndpoints();

        return app;
    }
}