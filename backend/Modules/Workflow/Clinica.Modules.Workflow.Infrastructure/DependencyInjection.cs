using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Workflow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddWorkflowInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        _ = configuration;
        return services;
    }
}
