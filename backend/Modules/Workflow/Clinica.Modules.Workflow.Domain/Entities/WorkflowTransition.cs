using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowTransition : AuditableEntity
{
    public Guid WorkflowDefinitionId { get; set; }
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;
    
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public Guid FromStateId { get; set; }
    public WorkflowState FromState { get; set; } = null!;

    public Guid ToStateId { get; set; }
    public WorkflowState ToState { get; set; } = null!;
    public bool RequiresComment { get; set; }
    public bool IsActive { get; set; } = true;

}
