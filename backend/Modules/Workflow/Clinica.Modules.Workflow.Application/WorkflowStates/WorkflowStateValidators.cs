using FluentValidation;

namespace Clinica.Modules.Workflow.Application.WorkflowStates;

public class CreateWorkflowStateRequestValidator : AbstractValidator<CreateWorkflowStateRequest>
{
    public CreateWorkflowStateRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
    }
}

public class UpdateWorkflowStateRequestValidator : AbstractValidator<UpdateWorkflowStateRequest>
{
    public UpdateWorkflowStateRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
    }
}
