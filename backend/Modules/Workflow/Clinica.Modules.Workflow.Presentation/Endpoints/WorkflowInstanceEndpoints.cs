using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Workflow.Presentation.Endpoints;

public static class WorkflowInstanceEndpoints
{
    public static RouteGroupBuilder MapWorkflowInstanceEndpoints(
        this RouteGroupBuilder group)
    {
        var instancesGroup = group.MapGroup("/instances")
            .RequireAuthorization()
            .WithTags(WorkflowSwaggerTags.Instances);

        instancesGroup.MapPost("/start", async (
                StartWorkflowInstanceRequest request,
                IValidator<StartWorkflowInstanceRequest> validator,
                IWorkflowInstanceService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.StartAsync(request, cancellationToken);
                return ApiResults.Created(result, "Instancia iniciada correctamente.");
            })
            .WithName("WorkflowInstance_Start")
            .Produces<ApiResponse<WorkflowInstanceResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        instancesGroup.MapGet("/by-reference/{referenceModule}/{referenceEntity}/{referenceId:guid}", async (
                string referenceModule,
                string referenceEntity,
                Guid referenceId,
                IWorkflowInstanceService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByReferenceAsync(
                    referenceModule,
                    referenceEntity,
                    referenceId,
                    cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Instancia de workflow no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("WorkflowInstance_GetByReference")
            .Produces<ApiResponse<WorkflowInstanceResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        instancesGroup.MapGet("/{id:guid}", async (
                Guid id,
                IWorkflowInstanceService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Instancia de workflow no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("WorkflowInstance_GetById")
            .Produces<ApiResponse<WorkflowInstanceResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        instancesGroup.MapGet("/{id:guid}/available-actions", async (
                Guid id,
                IWorkflowInstanceService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetAvailableActionsAsync(id, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("WorkflowInstance_GetAvailableActions")
            .Produces<ApiResponse<IReadOnlyCollection<WorkflowAvailableActionResponse>>>(StatusCodes.Status200OK);

        instancesGroup.MapPost("/{id:guid}/execute", async (
                Guid id,
                ExecuteWorkflowTransitionRequest request,
                IValidator<ExecuteWorkflowTransitionRequest> validator,
                IWorkflowInstanceService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.ExecuteAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Transición ejecutada correctamente.");
            })
            .WithName("WorkflowInstance_Execute")
            .Produces<ApiResponse<WorkflowInstanceResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        instancesGroup.MapGet("/{id:guid}/history", async (
                Guid id,
                IWorkflowInstanceService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetHistoryAsync(id, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("WorkflowInstance_GetHistory")
            .Produces<ApiResponse<IReadOnlyCollection<WorkflowHistoryResponse>>>(StatusCodes.Status200OK);

        return group;
    }
}
