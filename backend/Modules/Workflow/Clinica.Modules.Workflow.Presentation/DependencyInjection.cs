using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Workflow.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddWorkflowPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static IEndpointRouteBuilder MapWorkflowModule(this IEndpointRouteBuilder app)
    {
        return app.MapWorkflowEndpoints();
    }
}
