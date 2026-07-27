using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowTransitions;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Domain.Enums;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Workflow.Infrastructure.Services;

public sealed class WorkflowTransitionService(
    WorkflowDbContext context
) : IWorkflowTransitionService
{
    public async Task<IReadOnlyCollection<WorkflowTransitionResponse>> GetByDefinitionIdAsync(
        Guid definitionId,
        CancellationToken cancellationToken = default)
    {
        await EnsureDefinitionExistsAsync(definitionId, cancellationToken);

        var transitions = await context.WorkflowTransitions
            .AsNoTracking()
            .Include(x => x.FromState)
            .Include(x => x.ToState)
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.Employees)
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.WorkflowCustomQuery)
            .Where(x => x.WorkflowDefinitionId == definitionId)
            .OrderBy(x => x.FromState.Order)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return transitions.Select(ToResponse).ToList();
    }

    public async Task<WorkflowTransitionResponse> CreateAsync(
        Guid definitionId,
        CreateWorkflowTransitionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureDefinitionExistsAsync(definitionId, cancellationToken);
        await EnsureStatesBelongToDefinitionAsync(definitionId, request.FromStateId, request.ToStateId, cancellationToken);

        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(definitionId, request.FromStateId, code, null, cancellationToken);

        var entity = new WorkflowTransition
        {
            WorkflowDefinitionId = definitionId,
            FromStateId = request.FromStateId,
            ToStateId = request.ToStateId,
            Code = code,
            Name = StringNormalize.Required(request.Name),
            RequiresComment = request.RequiresComment,
            IsActive = request.IsActive
        };

        if (request.Assignment is not null)
            entity.Assignment = await BuildAssignmentAsync(request.Assignment, cancellationToken);

        context.WorkflowTransitions.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return await LoadResponseAsync(entity.Id, cancellationToken);
    }

    public async Task<WorkflowTransitionResponse> UpdateAsync(
        Guid id,
        UpdateWorkflowTransitionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowTransitions
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.Employees)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Transición de workflow no encontrada.");

        await EnsureStatesBelongToDefinitionAsync(
            entity.WorkflowDefinitionId,
            request.FromStateId,
            request.ToStateId,
            cancellationToken);

        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(
            entity.WorkflowDefinitionId,
            request.FromStateId,
            code,
            id,
            cancellationToken);

        entity.FromStateId = request.FromStateId;
        entity.ToStateId = request.ToStateId;
        entity.Code = code;
        entity.Name = StringNormalize.Required(request.Name);
        entity.RequiresComment = request.RequiresComment;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await SyncAssignmentAsync(entity, request.Assignment, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);

        return await LoadResponseAsync(entity.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowTransitions
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Transición de workflow no encontrada.");

        context.WorkflowTransitions.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task SyncAssignmentAsync(
        WorkflowTransition entity,
        WorkflowTransitionAssignmentRequest? request,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            if (entity.Assignment is not null)
                context.WorkflowTransitionAssignments.Remove(entity.Assignment);

            entity.Assignment = null;
            return;
        }

        if (entity.Assignment is null)
        {
            entity.Assignment = await BuildAssignmentAsync(request, cancellationToken);
            return;
        }

        await ApplyAssignmentAsync(entity.Assignment, request, cancellationToken);
        entity.Assignment.UpdatedAt = DateTime.UtcNow;
    }

    private async Task<WorkflowTransitionAssignment> BuildAssignmentAsync(
        WorkflowTransitionAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        var assignment = new WorkflowTransitionAssignment();
        await ApplyAssignmentAsync(assignment, request, cancellationToken);
        return assignment;
    }

    private async Task ApplyAssignmentAsync(
        WorkflowTransitionAssignment assignment,
        WorkflowTransitionAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        await ValidateAssignmentReferencesAsync(request, cancellationToken);

        assignment.Type = request.Type;
        assignment.AreaId = request.Type == WorkflowAssignmentType.Area ? request.AreaId : null;
        assignment.WorkflowCustomQueryId = request.Type == WorkflowAssignmentType.StoredProcedure
            ? request.WorkflowCustomQueryId
            : null;

        if (assignment.Employees.Count > 0)
            context.WorkflowAssignmentEmployees.RemoveRange(assignment.Employees);

        assignment.Employees.Clear();

        if (request.Type == WorkflowAssignmentType.EmployeeList && request.EmployeeIds is not null)
        {
            foreach (var employeeId in request.EmployeeIds.Distinct())
            {
                assignment.Employees.Add(new WorkflowAssignmentEmployee
                {
                    EmployeeId = employeeId
                });
            }
        }
    }

    private async Task ValidateAssignmentReferencesAsync(
        WorkflowTransitionAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Type == WorkflowAssignmentType.StoredProcedure)
        {
            var queryId = request.WorkflowCustomQueryId
                ?? throw new BusinessException("WorkflowCustomQueryId es obligatorio.");

            var exists = await context.WorkflowCustomQueries
                .AnyAsync(x => x.Id == queryId, cancellationToken);

            if (!exists)
                throw new NotFoundException("Consulta personalizada de workflow no encontrada.");
        }
    }

    private async Task<WorkflowTransitionResponse> LoadResponseAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var entity = await context.WorkflowTransitions
            .AsNoTracking()
            .Include(x => x.FromState)
            .Include(x => x.ToState)
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.Employees)
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.WorkflowCustomQuery)
            .FirstAsync(x => x.Id == id, cancellationToken);

        return ToResponse(entity);
    }

    private async Task EnsureDefinitionExistsAsync(
        Guid definitionId,
        CancellationToken cancellationToken)
    {
        var exists = await context.WorkflowDefinitions
            .AnyAsync(x => x.Id == definitionId, cancellationToken);

        if (!exists)
            throw new NotFoundException("Definición de workflow no encontrada.");
    }

    private async Task EnsureStatesBelongToDefinitionAsync(
        Guid definitionId,
        Guid fromStateId,
        Guid toStateId,
        CancellationToken cancellationToken)
    {
        var statesValid = await context.WorkflowStates
            .CountAsync(x =>
                    x.WorkflowDefinitionId == definitionId &&
                    (x.Id == fromStateId || x.Id == toStateId),
                cancellationToken) == 2;

        if (!statesValid)
            throw new BusinessException("Los estados deben pertenecer a la misma definición.");
    }

    private async Task EnsureCodeIsUniqueAsync(
        Guid definitionId,
        Guid fromStateId,
        string code,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.WorkflowTransitions
            .AnyAsync(x =>
                    x.WorkflowDefinitionId == definitionId &&
                    x.FromStateId == fromStateId &&
                    x.Code == code &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe para el estado origen.");
    }

    private static WorkflowTransitionResponse ToResponse(WorkflowTransition entity)
    {
        WorkflowTransitionAssignmentResponse? assignment = null;

        if (entity.Assignment is not null)
        {
            assignment = new WorkflowTransitionAssignmentResponse(
                entity.Assignment.Id,
                entity.Assignment.Type,
                entity.Assignment.AreaId,
                entity.Assignment.WorkflowCustomQueryId,
                entity.Assignment.WorkflowCustomQuery?.Code,
                entity.Assignment.WorkflowCustomQuery?.Name,
                entity.Assignment.Employees.Select(x => x.EmployeeId).ToList());
        }

        return new WorkflowTransitionResponse(
            entity.Id,
            entity.WorkflowDefinitionId,
            entity.FromStateId,
            entity.FromState.Code,
            entity.FromState.Name,
            entity.ToStateId,
            entity.ToState.Code,
            entity.ToState.Name,
            entity.Code,
            entity.Name,
            entity.RequiresComment,
            entity.IsActive,
            assignment,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
