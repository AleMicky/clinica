using Clinica.Modules.Workflow.Domain.Enums;
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
        RuleFor(x => x.Assignment).SetValidator(new WorkflowTransitionAssignmentRequestValidator()!)
            .When(x => x.Assignment is not null);
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
        RuleFor(x => x.Assignment).SetValidator(new WorkflowTransitionAssignmentRequestValidator()!)
            .When(x => x.Assignment is not null);
    }
}

public class WorkflowTransitionAssignmentRequestValidator : AbstractValidator<WorkflowTransitionAssignmentRequest>
{
    public WorkflowTransitionAssignmentRequestValidator()
    {
        RuleFor(x => x.Type).IsInEnum();

        RuleFor(x => x.AreaId)
            .NotEmpty()
            .When(x => x.Type == WorkflowAssignmentType.Area)
            .WithMessage("AreaId es obligatorio cuando el tipo es Area.");

        RuleFor(x => x.AreaId)
            .Null()
            .When(x => x.Type != WorkflowAssignmentType.Area)
            .WithMessage("AreaId solo aplica cuando el tipo es Area.");

        RuleFor(x => x.EmployeeIds)
            .NotNull()
            .Must(ids => ids is { Count: > 0 })
            .When(x => x.Type == WorkflowAssignmentType.EmployeeList)
            .WithMessage("Debe indicar al menos un empleado.");

        RuleFor(x => x.EmployeeIds)
            .Must(ids => ids is null || ids.Count == 0)
            .When(x => x.Type != WorkflowAssignmentType.EmployeeList)
            .WithMessage("EmployeeIds solo aplica cuando el tipo es EmployeeList.");

        RuleForEach(x => x.EmployeeIds!)
            .NotEmpty()
            .When(x => x.Type == WorkflowAssignmentType.EmployeeList && x.EmployeeIds is not null);

        RuleFor(x => x.WorkflowCustomQueryId)
            .NotEmpty()
            .When(x => x.Type == WorkflowAssignmentType.StoredProcedure)
            .WithMessage("WorkflowCustomQueryId es obligatorio cuando el tipo es StoredProcedure.");

        RuleFor(x => x.WorkflowCustomQueryId)
            .Null()
            .When(x => x.Type != WorkflowAssignmentType.StoredProcedure)
            .WithMessage("WorkflowCustomQueryId solo aplica cuando el tipo es StoredProcedure.");
    }
}
