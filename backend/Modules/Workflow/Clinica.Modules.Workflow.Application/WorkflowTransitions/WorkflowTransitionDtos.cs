namespace Clinica.Modules.Workflow.Application.WorkflowTransitions;

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
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateWorkflowTransitionRequest(
    Guid FromStateId,
    Guid ToStateId,
    string Code,
    string Name,
    bool RequiresComment,
    bool IsActive = true);

public sealed record UpdateWorkflowTransitionRequest(
    Guid FromStateId,
    Guid ToStateId,
    string Code,
    string Name,
    bool RequiresComment,
    bool IsActive);
