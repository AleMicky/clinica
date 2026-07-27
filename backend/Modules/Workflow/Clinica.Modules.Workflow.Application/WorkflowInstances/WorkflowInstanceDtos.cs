using Clinica.Modules.Workflow.Domain.Enums;

namespace Clinica.Modules.Workflow.Application.WorkflowInstances;

public sealed record WorkflowAssignableEmployeeResponse(
    Guid EmployeeId,
    string EmployeeName);

public sealed record WorkflowAvailableActionResponse(
    string Code,
    string Name,
    bool RequiresComment,
    Guid ToStateId,
    string ToStateCode,
    string ToStateName,
    string ToStateColor,
    WorkflowAssignmentType? AssignmentType,
    Guid? WorkflowCustomQueryId);

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
    Guid StartedByEmployeeId,
    DateTime StartedAt,
    DateTime? FinishedAt,
    bool IsCompleted,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record StartWorkflowInstanceRequest(
    string WorkflowDefinitionCode,
    string ReferenceModule,
    string ReferenceEntity,
    Guid ReferenceId,
    Guid EmployeeId);

public sealed record ExecuteWorkflowTransitionRequest(
    string Code,
    Guid EmployeeId,
    string? Comment);

public sealed record WorkflowHistoryResponse(
    Guid Id,
    Guid? WorkflowTransitionId,
    string? TransitionCode,
    string? TransitionName,
    Guid FromStateId,
    string FromStateCode,
    string FromStateName,
    Guid ToStateId,
    string ToStateCode,
    string ToStateName,
    Guid ExecutedByEmployeeId,
    string? Comment,
    DateTime PerformedAt);
