using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowTransitions;
using Clinica.Modules.Workflow.Domain.Entities;
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

        return await context.WorkflowTransitions
            .AsNoTracking()
            .Include(x => x.FromState)
            .Include(x => x.ToState)
            .Where(x => x.WorkflowDefinitionId == definitionId)
            .OrderBy(x => x.FromState.Order)
            .ThenBy(x => x.Name)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);
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

        context.WorkflowTransitions.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        await context.Entry(entity).Reference(x => x.FromState).LoadAsync(cancellationToken);
        await context.Entry(entity).Reference(x => x.ToState).LoadAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<WorkflowTransitionResponse> UpdateAsync(
        Guid id,
        UpdateWorkflowTransitionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowTransitions
            .Include(x => x.FromState)
            .Include(x => x.ToState)
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

        await context.SaveChangesAsync(cancellationToken);

        await context.Entry(entity).Reference(x => x.FromState).LoadAsync(cancellationToken);
        await context.Entry(entity).Reference(x => x.ToState).LoadAsync(cancellationToken);

        return ToResponse(entity);
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
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
