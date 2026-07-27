using FluentValidation;

namespace Clinica.Modules.Workflow.Application.WorkflowCustomQueries;

public class CreateWorkflowCustomQueryRequestValidator : AbstractValidator<CreateWorkflowCustomQueryRequest>
{
    public CreateWorkflowCustomQueryRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.ProcedureName).NotEmpty().MaximumLength(200);
    }
}

public class UpdateWorkflowCustomQueryRequestValidator : AbstractValidator<UpdateWorkflowCustomQueryRequest>
{
    public UpdateWorkflowCustomQueryRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.ProcedureName).NotEmpty().MaximumLength(200);
    }
}
