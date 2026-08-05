using Clinica.Api.Modules.Seguridad.Auth;
using Clinica.Api.Modules.Seguridad.Roles;
using Clinica.Api.Modules.Seguridad.Usuarios;

namespace Clinica.Api.Modules.Seguridad;

public static class SeguridadModule
{
    public static IServiceCollection AddSeguridadModule(
        this IServiceCollection services)
    {
        services.AddScoped<RolService>();
        services.AddScoped<UsuarioService>();
        services.AddScoped<AuthService>();

        return services;
    }

    public static IEndpointRouteBuilder MapSeguridadModule(
        this IEndpointRouteBuilder app)
    {
        app.MapRolEndpoints();
        app.MapUsuarioEndpoints();
        app.MapAuthEndpoints();

        return app;
    }
}