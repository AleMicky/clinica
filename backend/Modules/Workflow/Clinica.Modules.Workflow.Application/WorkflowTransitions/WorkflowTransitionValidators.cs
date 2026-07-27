using FluentValidation;

namespace Clinica.Modules.Workflow.Application.WorkflowTransitions;

public class CreateWorkflowTransitionRequestValidator : AbstractValidator<CreateWorkflowTransitionRequest>
{
    public CreateWorkflowTransitionRequestValidator()
    {
        RuleFor(x => x.FromStateId).NotEmpty();
        RuleFor(x => x.ToStateId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

public class UpdateWorkflowTransitionRequestValidator : AbstractValidator<UpdateWorkflowTransitionRequest>
{
    public UpdateWorkflowTransitionRequestValidator()
    {
        RuleFor(x => x.FromStateId).NotEmpty();
        RuleFor(x => x.ToStateId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
