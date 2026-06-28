using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowStates;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation.Endpoints;

public static class WorkflowStateEndpoints
{
    public static RouteGroupBuilder MapWorkflowStateEndpoints(
        this RouteGroupBuilder group)
    {
        var definitionsGroup = group.MapGroup("/definitions")
            .RequireAuthorization()
            .WithTags(WorkflowSwaggerTags.States);

        definitionsGroup.MapGet("/{definitionId:guid}/states", async (
                Guid definitionId,
                IWorkflowStateService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByDefinitionIdAsync(definitionId, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("WorkflowState_GetByDefinition")
            .Produces<ApiResponse<IReadOnlyCollection<WorkflowStateResponse>>>(StatusCodes.Status200OK);

        definitionsGroup.MapPost("/{definitionId:guid}/states", async (
                Guid definitionId,
                CreateWorkflowStateRequest request,
                IValidator<CreateWorkflowStateRequest> validator,
                IWorkflowStateService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.CreateAsync(definitionId, request, cancellationToken);
                return ApiResults.Created(result, "Estado creado correctamente.");
            })
            .WithName("WorkflowState_Create")
            .Produces<ApiResponse<WorkflowStateResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        var statesGroup = group.MapGroup("/states")
            .RequireAuthorization()
            .WithTags(WorkflowSwaggerTags.States);

        statesGroup.MapPut("/{id:guid}", async (
                Guid id,
                UpdateWorkflowStateRequest request,
                IValidator<UpdateWorkflowStateRequest> validator,
                IWorkflowStateService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.UpdateAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Estado actualizado correctamente.");
            })
            .WithName("WorkflowState_Update")
            .Produces<ApiResponse<WorkflowStateResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        statesGroup.MapDelete("/{id:guid}", async (
                Guid id,
                IWorkflowStateService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.NoContent();
            })
            .WithName("WorkflowState_Delete")
            .Produces(StatusCodes.Status204NoContent);

        return group;
    }
}
