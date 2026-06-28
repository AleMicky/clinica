namespace Clinica.Modules.Workflow.Application.WorkflowStates;

public sealed record WorkflowStateResponse(
    Guid Id,
    Guid WorkflowDefinitionId,
    string Code,
    string Name,
    string Description,
    bool IsInitial,
    bool IsFinal,
    string Color,
    int Order,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateWorkflowStateRequest(
    string Code,
    string Name,
    string Description,
    bool IsInitial,
    bool IsFinal,
    string Color,
    int Order);

public sealed record UpdateWorkflowStateRequest(
    string Code,
    string Name,
    string Description,
    bool IsInitial,
    bool IsFinal,
    string Color,
    int Order);
