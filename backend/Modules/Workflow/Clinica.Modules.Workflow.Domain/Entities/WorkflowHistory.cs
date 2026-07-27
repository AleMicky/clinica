using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowHistory : AuditableEntity
{
    public Guid WorkflowInstanceId { get; set; }
    public WorkflowInstance WorkflowInstance { get; set; } = null!;

    public Guid? WorkflowTransitionId { get; set; }
    public WorkflowTransition? WorkflowTransition { get; set; }

    public Guid FromStateId { get; set; }
    public WorkflowState FromState { get; set; } = null!;

    public Guid ToStateId { get; set; }
    public WorkflowState ToState { get; set; } = null!;

    public Guid ExecutedByEmployeeId { get; set; }
    public string? Comment { get; set; }
    public DateTime PerformedAt { get; set; }
}
