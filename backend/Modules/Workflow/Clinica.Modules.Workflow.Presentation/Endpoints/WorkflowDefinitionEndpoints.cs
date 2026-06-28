using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowDefinitions;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation.Endpoints;

public static class WorkflowDefinitionEndpoints
{
    public static RouteGroupBuilder MapWorkflowDefinitionEndpoints(
        this RouteGroupBuilder group)
    {
        group.MapGroup("/definitions")
            .RequireAuthorization()
            .WithTags(WorkflowSwaggerTags.Definitions)
            .MapCrud<
                IWorkflowDefinitionService,
                Guid,
                WorkflowDefinitionResponse,
                CreateWorkflowDefinitionRequest,
                UpdateWorkflowDefinitionRequest>("WorkflowDefinition");

        return group;
    }
}
