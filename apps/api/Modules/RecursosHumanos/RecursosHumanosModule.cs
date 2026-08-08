using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Endpoints;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Services;
using Clinica.Api.Modules.RecursosHumanos.Area.Endpoints;
using Clinica.Api.Modules.RecursosHumanos.Area.Services;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Endpoints;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Services;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Endpoints;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Services;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Endpoints;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Services;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Endpoints;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Services;

namespace Clinica.Api.Modules.RecursosHumanos;

public static class RecursosHumanosModule
{
    public static IServiceCollection AddRecursosHumanosModule(
        this IServiceCollection services)
    {
        services.AddScoped<TipoAreaService>();
        services.AddScoped<AreaService>();
        services.AddScoped<CargoService>();
        services.AddScoped<EmpleadoService>();
        services.AddScoped<AsignacionEmpleadoService>();
        services.AddScoped<EspecialidadService>();

        return services;
    }

    public static IEndpointRouteBuilder MapRecursosHumanosModule(
        this IEndpointRouteBuilder app)
    {
        app.MapTipoAreaEndpoints();
        app.MapAreaEndpoints();
        app.MapCargoEndpoints();
        app.MapEmpleadoEndpoints();
        app.MapAsignacionEmpleadoEndpoints();
        app.MapEspecialidadEndpoints();

        return app;
    }
}