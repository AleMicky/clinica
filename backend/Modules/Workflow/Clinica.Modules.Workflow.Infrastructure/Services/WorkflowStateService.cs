using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowStates;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Workflow.Infrastructure.Services;

public sealed class WorkflowStateService(
    WorkflowDbContext context
) : IWorkflowStateService
{
    public async Task<IReadOnlyCollection<WorkflowStateResponse>> GetByDefinitionIdAsync(
        Guid definitionId,
        CancellationToken cancellationToken = default)
    {
        await EnsureDefinitionExistsAsync(definitionId, cancellationToken);

        return await context.WorkflowStates
            .AsNoTracking()
            .Where(x => x.WorkflowDefinitionId == definitionId)
            .OrderBy(x => x.Order)
            .ThenBy(x => x.Name)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<WorkflowStateResponse> CreateAsync(
        Guid definitionId,
        CreateWorkflowStateRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureDefinitionExistsAsync(definitionId, cancellationToken);

        var code = Normalize(request.Code);
        await EnsureCodeIsUniqueAsync(definitionId, code, null, cancellationToken);

        if (request.IsInitial)
            await EnsureSingleInitialStateAsync(definitionId, null, cancellationToken);

        var entity = new WorkflowState
        {
            WorkflowDefinitionId = definitionId,
            Code = code,
            Name = Normalize(request.Name),
            Description = Normalize(request.Description),
            IsInitial = request.IsInitial,
            IsFinal = request.IsFinal,
            Color = Normalize(request.Color),
            Order = request.Order
        };

        context.WorkflowStates.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<WorkflowStateResponse> UpdateAsync(
        Guid id,
        UpdateWorkflowStateRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowStates
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Estado de workflow no encontrado.");

        var code = Normalize(request.Code);
        await EnsureCodeIsUniqueAsync(entity.WorkflowDefinitionId, code, id, cancellationToken);

        if (request.IsInitial)
            await EnsureSingleInitialStateAsync(entity.WorkflowDefinitionId, id, cancellationToken);

        entity.Code = code;
        entity.Name = Normalize(request.Name);
        entity.Description = Normalize(request.Description);
        entity.IsInitial = request.IsInitial;
        entity.IsFinal = request.IsFinal;
        entity.Color = Normalize(request.Color);
        entity.Order = request.Order;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowStates
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Estado de workflow no encontrado.");

        var hasTransitions = await context.WorkflowTransitions
            .AnyAsync(x => x.FromStateId == id || x.ToStateId == id, cancellationToken);

        if (hasTransitions)
            throw new BusinessException("No se puede eliminar un estado con transiciones asociadas.");

        var hasInstances = await context.WorkflowInstances
            .AnyAsync(x => x.CurrentStateId == id, cancellationToken);

        if (hasInstances)
            throw new BusinessException("No se puede eliminar un estado usado por instancias activas.");

        context.WorkflowStates.Remove(entity);
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

    private async Task EnsureCodeIsUniqueAsync(
        Guid definitionId,
        string code,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.WorkflowStates
            .AnyAsync(x =>
                    x.WorkflowDefinitionId == definitionId &&
                    x.Code == code &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código de estado ya existe en esta definición.");
    }

    private async Task EnsureSingleInitialStateAsync(
        Guid definitionId,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.WorkflowStates
            .AnyAsync(x =>
                    x.WorkflowDefinitionId == definitionId &&
                    x.IsInitial &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("Solo puede existir un estado inicial por definición.");
    }

    private static string Normalize(string value) => value.Trim();

    private static WorkflowStateResponse ToResponse(WorkflowState entity)
    {
        return new WorkflowStateResponse(
            entity.Id,
            entity.WorkflowDefinitionId,
            entity.Code,
            entity.Name,
            entity.Description,
            entity.IsInitial,
            entity.IsFinal,
            entity.Color,
            entity.Order,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
