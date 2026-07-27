using Clinica.Modules.Workflow.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Workflow.Domain.Entities;

public class WorkflowTransitionAssignment : AuditableEntity
{
    public Guid WorkflowTransitionId { get; set; }
    public WorkflowTransition WorkflowTransition { get; set; } = null!;

    public WorkflowAssignmentType Type { get; set; }
    public Guid? AreaId { get; set; }

    public Guid? WorkflowCustomQueryId { get; set; }
    public WorkflowCustomQuery? WorkflowCustomQuery { get; set; }

    public ICollection<WorkflowAssignmentEmployee> Employees { get; set; } = [];
}
