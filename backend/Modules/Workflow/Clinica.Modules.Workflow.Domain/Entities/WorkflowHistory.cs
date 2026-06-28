using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowHistory : AuditableEntity
{
    public Guid WorkflowInstanceId { get; set; }
    public Guid FromStateId { get; set; }
    public Guid ToStateId { get; set; }
    public string ActionCode { get; set; } = string.Empty;
    public string ActionName { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public Guid PerformedByUserId { get; set; }
    public string PerformedByUserName { get; set; } = string.Empty;
    public string? PerformedByRole { get; set; }
    public DateTime PerformedAt { get; set; }

    public WorkflowInstance WorkflowInstance { get; set; } = null!;
    public WorkflowState FromState { get; set; } = null!;
    public WorkflowState ToState { get; set; } = null!;
}
