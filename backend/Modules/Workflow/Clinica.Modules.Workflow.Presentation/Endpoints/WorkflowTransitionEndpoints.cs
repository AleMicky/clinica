using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowTransitions;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation.Endpoints;

public static class WorkflowTransitionEndpoints
{
    public static RouteGroupBuilder MapWorkflowTransitionEndpoints(
        this RouteGroupBuilder group)
    {
        var definitionsGroup = group.MapGroup("/definitions")
            .RequireAuthorization()
            .WithTags(WorkflowSwaggerTags.Transitions);

        definitionsGroup.MapGet("/{definitionId:guid}/transitions", async (
                Guid definitionId,
                IWorkflowTransitionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByDefinitionIdAsync(definitionId, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("WorkflowTransition_GetByDefinition")
            .Produces<ApiResponse<IReadOnlyCollection<WorkflowTransitionResponse>>>(StatusCodes.Status200OK);

        definitionsGroup.MapPost("/{definitionId:guid}/transitions", async (
                Guid definitionId,
                CreateWorkflowTransitionRequest request,
                IValidator<CreateWorkflowTransitionRequest> validator,
                IWorkflowTransitionService service,
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
                return ApiResults.Created(result, "Transición creada correctamente.");
            })
            .WithName("WorkflowTransition_Create")
            .Produces<ApiResponse<WorkflowTransitionResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        var transitionsGroup = group.MapGroup("/transitions")
            .RequireAuthorization()
            .WithTags(WorkflowSwaggerTags.Transitions);

        transitionsGroup.MapPut("/{id:guid}", async (
                Guid id,
                UpdateWorkflowTransitionRequest request,
                IValidator<UpdateWorkflowTransitionRequest> validator,
                IWorkflowTransitionService service,
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
                return ApiResults.Ok(result, "Transición actualizada correctamente.");
            })
            .WithName("WorkflowTransition_Update")
            .Produces<ApiResponse<WorkflowTransitionResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        transitionsGroup.MapDelete("/{id:guid}", async (
                Guid id,
                IWorkflowTransitionService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.NoContent();
            })
            .WithName("WorkflowTransition_Delete")
            .Produces(StatusCodes.Status204NoContent);

        return group;
    }
}
