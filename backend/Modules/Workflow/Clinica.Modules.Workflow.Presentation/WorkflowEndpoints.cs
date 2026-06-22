using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation;

public static class WorkflowEndpoints
{
    public static IEndpointRouteBuilder MapWorkflowEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/workflow")
            .WithTags("Workflow");

        group.MapGet("/health", () => ApiResponse<string>.Ok("Workflow operativo"))
            .WithName("WorkflowHealth")
            .WithSummary("Estado del módulo Workflow")
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);

        return app;
    }
}
