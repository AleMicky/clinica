using Clinica.Modules.Parametros.Application;
using Clinica.Modules.Parametros.Infrastructure;
using Clinica.Modules.Parametros.Presentation;
using Clinica.Modules.Seguridad.Application;
using Clinica.Modules.Seguridad.Infrastructure;
using Clinica.Modules.Seguridad.Presentation;
using Clinica.Modules.Workflow.Application;
using Clinica.Modules.Workflow.Infrastructure;
using Clinica.Modules.Workflow.Presentation;

namespace Clinica.Api.Extensions;

public static class ModuleExtensions
{
    public static IServiceCollection AddClinicaModules(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddSeguridadApplication()
            .AddSeguridadInfrastructure(configuration)
            .AddSeguridadPresentation();

        services
            .AddParametrosApplication()
            .AddParametrosInfrastructure(configuration)
            .AddParametrosPresentation();

        services
            .AddWorkflowApplication()
            .AddWorkflowInfrastructure(configuration)
            .AddWorkflowPresentation();

        return services;
    }

    public static WebApplication MapClinicaModules(this WebApplication app)
    {
        app.MapSeguridadModule();
        app.MapParametrosModule();
        app.MapWorkflowModule();

        return app;
    }
}