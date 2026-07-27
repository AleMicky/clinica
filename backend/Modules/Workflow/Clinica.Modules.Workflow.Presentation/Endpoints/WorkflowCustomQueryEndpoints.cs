using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowCustomQueries;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation.Endpoints;

public static class WorkflowCustomQueryEndpoints
{
    public static RouteGroupBuilder MapWorkflowCustomQueryEndpoints(
        this RouteGroupBuilder group)
    {
        group.MapGroup("/custom-queries")
            .RequireAuthorization()
            .WithTags(WorkflowSwaggerTags.CustomQueries)
            .MapCrud<
                IWorkflowCustomQueryService,
                Guid,
                WorkflowCustomQueryResponse,
                CreateWorkflowCustomQueryRequest,
                UpdateWorkflowCustomQueryRequest>("WorkflowCustomQuery");

        return group;
    }
}
