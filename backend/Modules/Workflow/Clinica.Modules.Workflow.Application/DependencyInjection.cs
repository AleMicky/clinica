using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Workflow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddWorkflowApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
