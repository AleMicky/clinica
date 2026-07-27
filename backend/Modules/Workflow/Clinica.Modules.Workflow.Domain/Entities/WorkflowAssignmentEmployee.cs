using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowAssignmentEmployee : AuditableEntity
{
    public Guid WorkflowTransitionAssignmentId { get; set; }
    public WorkflowTransitionAssignment Assignment { get; set; } = null!;

    public Guid EmployeeId { get; set; }
}
