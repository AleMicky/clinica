using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowStates;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Text;
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
        EnsureGatewayFlags(request.IsGateway, request.IsInitial, request.IsFinal);

        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(definitionId, code, null, cancellationToken);

        if (request.IsInitial)
            await EnsureSingleInitialStateAsync(definitionId, null, cancellationToken);

        var entity = new WorkflowState
        {
            WorkflowDefinitionId = definitionId,
            Code = code,
            Name = StringNormalize.Required(request.Name),
            IsInitial = request.IsInitial,
            IsFinal = request.IsFinal,
            IsGateway = request.IsGateway,
            Color = StringNormalize.Required(request.Color),
            Order = request.Order,
            DiagramX = request.DiagramX,
            DiagramY = request.DiagramY,
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

        EnsureGatewayFlags(request.IsGateway, request.IsInitial, request.IsFinal);

        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(entity.WorkflowDefinitionId, code, id, cancellationToken);

        if (request.IsInitial)
            await EnsureSingleInitialStateAsync(entity.WorkflowDefinitionId, id, cancellationToken);

        entity.Code = code;
        entity.Name = StringNormalize.Required(request.Name);
        entity.IsInitial = request.IsInitial;
        entity.IsFinal = request.IsFinal;
        entity.IsGateway = request.IsGateway;
        entity.Color = StringNormalize.Required(request.Color);
        entity.Order = request.Order;
        entity.DiagramX = request.DiagramX;
        entity.DiagramY = request.DiagramY;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<WorkflowStateResponse> UpdatePositionAsync(
        Guid id,
        UpdateWorkflowStatePositionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowStates
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Estado de workflow no encontrado.");

        entity.DiagramX = request.DiagramX;
        entity.DiagramY = request.DiagramY;
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

    private static void EnsureGatewayFlags(bool isGateway, bool isInitial, bool isFinal)
    {
        if (isGateway && (isInitial || isFinal))
            throw new BusinessException("Un gateway no puede ser estado inicial ni final.");
    }

    private static WorkflowStateResponse ToResponse(WorkflowState entity)
    {
        return new WorkflowStateResponse(
            entity.Id,
            entity.WorkflowDefinitionId,
            entity.Code,
            entity.Name,
            entity.IsInitial,
            entity.IsFinal,
            entity.IsGateway,
            entity.Color,
            entity.Order,
            entity.DiagramX,
            entity.DiagramY,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
