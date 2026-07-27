namespace Clinica.Modules.Workflow.Application.WorkflowStates;

public sealed record WorkflowStateResponse(
    Guid Id,
    Guid WorkflowDefinitionId,
    string Code,
    string Name,
    bool IsInitial,
    bool IsFinal,
    bool IsGateway,
    string Color,
    int Order,
    double? DiagramX,
    double? DiagramY,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateWorkflowStateRequest(
    string Code,
    string Name,
    bool IsInitial,
    bool IsFinal,
    bool IsGateway,
    string Color,
    int Order,
    double? DiagramX,
    double? DiagramY);

public sealed record UpdateWorkflowStateRequest(
    string Code,
    string Name,
    bool IsInitial,
    bool IsFinal,
    bool IsGateway,
    string Color,
    int Order,
    double? DiagramX,
    double? DiagramY);

public sealed record UpdateWorkflowStatePositionRequest(
    double DiagramX,
    double DiagramY);
