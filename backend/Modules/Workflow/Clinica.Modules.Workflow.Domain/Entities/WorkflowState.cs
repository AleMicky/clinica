using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowState : AuditableEntity
{
    public Guid WorkflowDefinitionId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsInitial { get; set; }
    public bool IsFinal { get; set; }
    public string Color { get; set; } = "#1677ff";
    public int Order { get; set; }

    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;
    public ICollection<WorkflowTransition> OutgoingTransitions { get; set; } = [];
    public ICollection<WorkflowTransition> IncomingTransitions { get; set; } = [];
}
