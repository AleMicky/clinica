using FluentValidation;

namespace Clinica.Modules.Workflow.Application.WorkflowInstances;

public class StartWorkflowInstanceRequestValidator : AbstractValidator<StartWorkflowInstanceRequest>
{
    public StartWorkflowInstanceRequestValidator()
    {
        RuleFor(x => x.WorkflowDefinitionCode).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ReferenceModule).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ReferenceEntity).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ReferenceId).NotEmpty();
        RuleFor(x => x.EmployeeId).NotEmpty();
    }
}

public class ExecuteWorkflowTransitionRequestValidator : AbstractValidator<ExecuteWorkflowTransitionRequest>
{
    public ExecuteWorkflowTransitionRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.Comment).MaximumLength(1000);
    }
}
