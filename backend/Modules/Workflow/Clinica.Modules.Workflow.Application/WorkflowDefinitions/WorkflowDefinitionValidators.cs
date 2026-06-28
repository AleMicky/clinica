using FluentValidation;

namespace Clinica.Modules.Workflow.Application.WorkflowDefinitions;

public class CreateWorkflowDefinitionRequestValidator : AbstractValidator<CreateWorkflowDefinitionRequest>
{
    public CreateWorkflowDefinitionRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntityName).NotEmpty().MaximumLength(100);
    }
}

public class UpdateWorkflowDefinitionRequestValidator : AbstractValidator<UpdateWorkflowDefinitionRequest>
{
    public UpdateWorkflowDefinitionRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntityName).NotEmpty().MaximumLength(100);
    }
}
