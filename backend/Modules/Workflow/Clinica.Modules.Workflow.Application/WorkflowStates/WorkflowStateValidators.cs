using FluentValidation;

namespace Clinica.Modules.Workflow.Application.WorkflowStates;

public class CreateWorkflowStateRequestValidator : AbstractValidator<CreateWorkflowStateRequest>
{
    public CreateWorkflowStateRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
        RuleFor(x => x)
            .Must(x => !x.IsGateway || (!x.IsInitial && !x.IsFinal))
            .WithMessage("Un gateway no puede ser estado inicial ni final.");
    }
}

public class UpdateWorkflowStateRequestValidator : AbstractValidator<UpdateWorkflowStateRequest>
{
    public UpdateWorkflowStateRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
        RuleFor(x => x)
            .Must(x => !x.IsGateway || (!x.IsInitial && !x.IsFinal))
            .WithMessage("Un gateway no puede ser estado inicial ni final.");
    }
}

public class UpdateWorkflowStatePositionRequestValidator
    : AbstractValidator<UpdateWorkflowStatePositionRequest>
{
    public UpdateWorkflowStatePositionRequestValidator()
    {
        RuleFor(x => x.DiagramX).NotEqual(double.NaN);
        RuleFor(x => x.DiagramY).NotEqual(double.NaN);
    }
}
