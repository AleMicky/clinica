using Clinica.Modules.Workflow.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation;

public static class WorkflowEndpoints
{
    private const string BasePath = "/api/workflow";

    public static IEndpointRouteBuilder MapWorkflowEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        MapHealth(group);
        group.MapWorkflowDefinitionEndpoints();
        group.MapWorkflowStateEndpoints();
        group.MapWorkflowTransitionEndpoints();
        group.MapWorkflowInstanceEndpoints();

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", HealthCheck)
            .WithName("WorkflowHealth")
            .WithSummary("Estado del módulo Workflow")
            .WithTags(WorkflowSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Workflow operativo.");
    }
}
