using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowInstance : AuditableEntity
{
    public Guid WorkflowDefinitionId { get; set; }
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;

    public Guid CurrentStateId { get; set; }
    public WorkflowState CurrentState { get; set; } = null!;

    public string ReferenceModule { get; set; } = string.Empty;
    public string ReferenceEntity { get; set; } = string.Empty;
    public Guid ReferenceId { get; set; }

    public Guid StartedByEmployeeId { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }

    public ICollection<WorkflowHistory> History { get; set; } = [];
}
