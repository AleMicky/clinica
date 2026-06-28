namespace Clinica.Modules.Workflow.Application.WorkflowDefinitions;

public sealed record WorkflowDefinitionResponse(
    Guid Id,
    string Code,
    string Name,
    string Description,
    string Module,
    string EntityName,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateWorkflowDefinitionRequest(
    string Code,
    string Name,
    string Description,
    string Module,
    string EntityName,
    bool IsActive = true);

public sealed record UpdateWorkflowDefinitionRequest(
    string Code,
    string Name,
    string Description,
    string Module,
    string EntityName,
    bool IsActive);
