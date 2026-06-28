using Clinica.Modules.Workflow.Application.WorkflowDefinitions;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Workflow.Application.Abstractions;

public interface IWorkflowDefinitionService
    : ICrudService<
        Guid,
        WorkflowDefinitionResponse,
        CreateWorkflowDefinitionRequest,
        UpdateWorkflowDefinitionRequest>;

public interface IWorkflowStateService
{
    Task<IReadOnlyCollection<WorkflowStates.WorkflowStateResponse>> GetByDefinitionIdAsync(
        Guid definitionId,
        CancellationToken cancellationToken = default);

    Task<WorkflowStates.WorkflowStateResponse> CreateAsync(
        Guid definitionId,
        WorkflowStates.CreateWorkflowStateRequest request,
        CancellationToken cancellationToken = default);

    Task<WorkflowStates.WorkflowStateResponse> UpdateAsync(
        Guid id,
        WorkflowStates.UpdateWorkflowStateRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IWorkflowTransitionService
{
    Task<IReadOnlyCollection<WorkflowTransitions.WorkflowTransitionResponse>> GetByDefinitionIdAsync(
        Guid definitionId,
        CancellationToken cancellationToken = default);

    Task<WorkflowTransitions.WorkflowTransitionResponse> CreateAsync(
        Guid definitionId,
        WorkflowTransitions.CreateWorkflowTransitionRequest request,
        CancellationToken cancellationToken = default);

    Task<WorkflowTransitions.WorkflowTransitionResponse> UpdateAsync(
        Guid id,
        WorkflowTransitions.UpdateWorkflowTransitionRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IWorkflowInstanceService
{
    Task<WorkflowInstances.WorkflowInstanceResponse> StartAsync(
        WorkflowInstances.StartWorkflowInstanceRequest request,
        CancellationToken cancellationToken = default);

    Task<WorkflowInstances.WorkflowInstanceResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<WorkflowInstances.WorkflowInstanceResponse?> GetByReferenceAsync(
        string referenceModule,
        string referenceEntity,
        Guid referenceId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<WorkflowInstances.WorkflowAvailableActionResponse>> GetAvailableActionsAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<WorkflowInstances.WorkflowInstanceResponse> ExecuteAsync(
        Guid id,
        WorkflowInstances.ExecuteWorkflowTransitionRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<WorkflowInstances.WorkflowHistoryResponse>> GetHistoryAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
