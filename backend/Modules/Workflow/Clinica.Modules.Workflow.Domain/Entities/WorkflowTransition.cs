using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowTransition : AuditableEntity
{
    public Guid WorkflowDefinitionId { get; set; }
    public Guid FromStateId { get; set; }
    public Guid ToStateId { get; set; }
    public string ActionCode { get; set; } = string.Empty;
    public string ActionName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? RequiredRole { get; set; }
    public bool RequiresComment { get; set; }
    public bool IsActive { get; set; } = true;

    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;
    public WorkflowState FromState { get; set; } = null!;
    public WorkflowState ToState { get; set; } = null!;
}
