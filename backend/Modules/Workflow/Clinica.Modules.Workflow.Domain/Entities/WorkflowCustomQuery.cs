using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowCustomQuery : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ProcedureName { get; set; } = string.Empty;
}
