namespace Clinica.Modules.Workflow.Application.WorkflowCustomQueries;

public sealed record WorkflowCustomQueryResponse(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string ProcedureName,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateWorkflowCustomQueryRequest(
    string Code,
    string Name,
    string? Description,
    string ProcedureName);

public sealed record UpdateWorkflowCustomQueryRequest(
    string Code,
    string Name,
    string? Description,
    string ProcedureName);
