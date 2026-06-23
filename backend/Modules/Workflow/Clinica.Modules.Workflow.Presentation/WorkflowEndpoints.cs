using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation;

public static class WorkflowEndpoints
{
    public static IEndpointRouteBuilder MapWorkflowEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/workflow")
            .WithTags("Workflow");

        group.MapGet("/health", () => ApiResults.Ok("Workflow operativo"))
            .WithName("WorkflowHealth")
            .WithSummary("Estado del módulo Workflow")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status500InternalServerError);

        return app;
    }
}