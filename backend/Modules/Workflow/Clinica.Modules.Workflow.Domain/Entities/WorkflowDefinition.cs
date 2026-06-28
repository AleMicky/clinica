using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowDefinition : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<WorkflowState> States { get; set; } = [];
    public ICollection<WorkflowTransition> Transitions { get; set; } = [];
    public ICollection<WorkflowInstance> Instances { get; set; } = [];
}
