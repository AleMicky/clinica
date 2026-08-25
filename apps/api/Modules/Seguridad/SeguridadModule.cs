using Clinica.Api.Modules.Seguridad.Auth;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Endpoints;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Services;
using Clinica.Api.Modules.Seguridad.Personas.Endpoints;
using Clinica.Api.Modules.Seguridad.Personas.Services;
using Clinica.Api.Modules.Seguridad.Roles.Endpoints;
using Clinica.Api.Modules.Seguridad.Roles.Services;
using Clinica.Api.Modules.Seguridad.Usuarios.Endpoints;
using Clinica.Api.Modules.Seguridad.Usuarios.Services;

namespace Clinica.Api.Modules.Seguridad;

public static class SeguridadModule
{
    public static IServiceCollection AddSeguridadModule(
        this IServiceCollection services)
    {
        services.AddScoped<RolService>();
        services.AddScoped<UsuarioService>();
        services.AddScoped<AuthService>();
        services.AddScoped<PersonaService>();
        services.AddScoped<OpcionMenuService>();
        services.AddScoped<RolOpcionMenuService>();


        return services;
    }

    public static IEndpointRouteBuilder MapSeguridadModule(
        this IEndpointRouteBuilder app)
    {
        app.MapRolEndpoints();
        app.MapUsuarioEndpoints();
        app.MapAuthEndpoints();
        app.MapPersonaEndpoints();
        app.MapOpcionMenuEndpoints();
        app.MapRolOpcionMenuEndpoints();
        app.MapMenuUsuarioEndpoints();

        return app;
    }
}