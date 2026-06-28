using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.Modules.Workflow.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Workflow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddWorkflowInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<WorkflowDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IWorkflowDefinitionService, WorkflowDefinitionService>();
        services.AddScoped<IWorkflowStateService, WorkflowStateService>();
        services.AddScoped<IWorkflowTransitionService, WorkflowTransitionService>();
        services.AddScoped<IWorkflowInstanceService, WorkflowInstanceService>();

        return services;
    }
}
