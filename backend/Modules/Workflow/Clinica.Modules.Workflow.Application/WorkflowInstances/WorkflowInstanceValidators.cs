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
    }
}

public class ExecuteWorkflowTransitionRequestValidator : AbstractValidator<ExecuteWorkflowTransitionRequest>
{
    public ExecuteWorkflowTransitionRequestValidator()
    {
        RuleFor(x => x.ActionCode).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Comment).MaximumLength(1000);
    }
}
