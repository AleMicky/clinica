using Clinica.Modules.Workflow.Domain.Enums;

namespace Clinica.Modules.Workflow.Application.WorkflowTransitions;

public sealed record WorkflowTransitionAssignmentResponse(
    Guid Id,
    WorkflowAssignmentType Type,
    Guid? AreaId,
    Guid? WorkflowCustomQueryId,
    string? WorkflowCustomQueryCode,
    string? WorkflowCustomQueryName,
    IReadOnlyCollection<Guid> EmployeeIds);

public sealed record WorkflowTransitionAssignmentRequest(
    WorkflowAssignmentType Type,
    Guid? AreaId,
    Guid? WorkflowCustomQueryId,
    IReadOnlyCollection<Guid>? EmployeeIds);

public sealed record WorkflowTransitionResponse(
    Guid Id,
    Guid WorkflowDefinitionId,
    Guid FromStateId,
    string FromStateCode,
    string FromStateName,
    Guid ToStateId,
    string ToStateCode,
    string ToStateName,
    string Code,
    string Name,
    bool RequiresComment,
    bool IsActive,
    WorkflowTransitionAssignmentResponse? Assignment,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateWorkflowTransitionRequest(
    Guid FromStateId,
    Guid ToStateId,
    string Code,
    string Name,
    bool RequiresComment,
    bool IsActive = true,
    WorkflowTransitionAssignmentRequest? Assignment = null);

public sealed record UpdateWorkflowTransitionRequest(
    Guid FromStateId,
    Guid ToStateId,
    string Code,
    string Name,
    bool RequiresComment,
    bool IsActive,
    WorkflowTransitionAssignmentRequest? Assignment = null);
