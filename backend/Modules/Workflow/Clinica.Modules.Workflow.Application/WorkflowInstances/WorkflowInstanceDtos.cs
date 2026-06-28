namespace Clinica.Modules.Workflow.Application.WorkflowInstances;

public sealed record WorkflowInstanceResponse(
    Guid Id,
    Guid WorkflowDefinitionId,
    string WorkflowDefinitionCode,
    string WorkflowDefinitionName,
    string ReferenceModule,
    string ReferenceEntity,
    Guid ReferenceId,
    Guid CurrentStateId,
    string CurrentStateCode,
    string CurrentStateName,
    string CurrentStateColor,
    int Correlative,
    Guid StartedByUserId,
    string StartedByUserName,
    DateTime StartedAt,
    DateTime? FinishedAt,
    bool IsCompleted,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record StartWorkflowInstanceRequest(
    string WorkflowDefinitionCode,
    string ReferenceModule,
    string ReferenceEntity,
    Guid ReferenceId);

public sealed record ExecuteWorkflowTransitionRequest(
    string ActionCode,
    string? Comment);

public sealed record WorkflowAvailableActionResponse(
    string ActionCode,
    string ActionName,
    string Description,
    string? RequiredRole,
    bool RequiresComment,
    Guid ToStateId,
    string ToStateCode,
    string ToStateName,
    string ToStateColor);

public sealed record WorkflowHistoryResponse(
    Guid Id,
    Guid FromStateId,
    string FromStateCode,
    string FromStateName,
    Guid ToStateId,
    string ToStateCode,
    string ToStateName,
    string ActionCode,
    string ActionName,
    string? Comment,
    Guid PerformedByUserId,
    string PerformedByUserName,
    string? PerformedByRole,
    DateTime PerformedAt);
