using FluentValidation;

namespace Clinica.Modules.Workflow.Application.WorkflowTransitions;

public class CreateWorkflowTransitionRequestValidator : AbstractValidator<CreateWorkflowTransitionRequest>
{
    public CreateWorkflowTransitionRequestValidator()
    {
        RuleFor(x => x.FromStateId).NotEmpty();
        RuleFor(x => x.ToStateId).NotEmpty();
        RuleFor(x => x.ActionCode).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ActionName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.RequiredRole).MaximumLength(100);
    }
}

public class UpdateWorkflowTransitionRequestValidator : AbstractValidator<UpdateWorkflowTransitionRequest>
{
    public UpdateWorkflowTransitionRequestValidator()
    {
        RuleFor(x => x.FromStateId).NotEmpty();
        RuleFor(x => x.ToStateId).NotEmpty();
        RuleFor(x => x.ActionCode).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ActionName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.RequiredRole).MaximumLength(100);
    }
}
