using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Workflow.Infrastructure.Services;

public sealed class WorkflowInstanceService(
    WorkflowDbContext context,
    ICurrentUser currentUser,
    WorkflowAssignmentExecutor assignmentExecutor
) : IWorkflowInstanceService
{
    public async Task<WorkflowInstanceResponse> StartAsync(
        StartWorkflowInstanceRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();

        var definitionCode = StringNormalize.Required(request.WorkflowDefinitionCode);
        var referenceModule = StringNormalize.Required(request.ReferenceModule);
        var referenceEntity = StringNormalize.Required(request.ReferenceEntity);

        var definition = await context.WorkflowDefinitions
            .AsNoTracking()
            .Where(x => x.Code == definitionCode && x.IsActive)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                InitialState = x.States
                    .Where(s => s.IsInitial)
                    .Select(s => new { s.Id, s.Code, s.Name, s.Color, s.IsFinal })
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (definition is null)
            throw new NotFoundException("Definición de workflow no encontrada o inactiva.");

        if (definition.InitialState is null)
            throw new BusinessException("La definición no tiene un estado inicial configurado.");

        var existing = await context.WorkflowInstances
            .AnyAsync(x =>
                    x.ReferenceModule == referenceModule &&
                    x.ReferenceEntity == referenceEntity &&
                    x.ReferenceId == request.ReferenceId,
                cancellationToken);

        if (existing)
            throw new BusinessException("Ya existe una instancia de workflow para la referencia indicada.");

        var now = DateTime.UtcNow;
        var initialState = definition.InitialState;

        var instance = new WorkflowInstance
        {
            Id = Guid.NewGuid(),
            WorkflowDefinitionId = definition.Id,
            ReferenceModule = referenceModule,
            ReferenceEntity = referenceEntity,
            ReferenceId = request.ReferenceId,
            CurrentStateId = initialState.Id,
            StartedByEmployeeId = request.EmployeeId,
            StartedAt = now,
            CreatedAt = now,
            IsCompleted = initialState.IsFinal,
            FinishedAt = initialState.IsFinal ? now : null
        };

        context.WorkflowInstances.Add(instance);

        context.WorkflowHistories.Add(new WorkflowHistory
        {
            WorkflowInstanceId = instance.Id,
            WorkflowTransitionId = null,
            FromStateId = initialState.Id,
            ToStateId = initialState.Id,
            Comment = null,
            ExecutedByEmployeeId = request.EmployeeId,
            PerformedAt = now,
            CreatedAt = now
        });

        await context.SaveChangesAsync(cancellationToken);

        return new WorkflowInstanceResponse(
            instance.Id,
            definition.Id,
            definition.Code,
            definition.Name,
            instance.ReferenceModule,
            instance.ReferenceEntity,
            instance.ReferenceId,
            initialState.Id,
            initialState.Code,
            initialState.Name,
            initialState.Color,
            instance.StartedByEmployeeId,
            instance.StartedAt,
            instance.FinishedAt,
            instance.IsCompleted,
            instance.CreatedAt,
            instance.UpdatedAt);
    }

    public async Task<WorkflowInstanceResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.WorkflowInstances
            .AsNoTracking()
            .Include(x => x.WorkflowDefinition)
            .Include(x => x.CurrentState)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<WorkflowInstanceResponse?> GetByReferenceAsync(
        string referenceModule,
        string referenceEntity,
        Guid referenceId,
        CancellationToken cancellationToken = default)
    {
        return await context.WorkflowInstances
            .AsNoTracking()
            .Include(x => x.WorkflowDefinition)
            .Include(x => x.CurrentState)
            .Where(x =>
                x.ReferenceModule == StringNormalize.Required(referenceModule) &&
                x.ReferenceEntity == StringNormalize.Required(referenceEntity) &&
                x.ReferenceId == referenceId)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<WorkflowAvailableActionResponse>> GetAvailableActionsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var instance = await context.WorkflowInstances
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (instance is null)
            throw new NotFoundException("Instancia de workflow no encontrada.");

        if (instance.IsCompleted)
            return [];

        var transitions = await context.WorkflowTransitions
            .AsNoTracking()
            .Include(x => x.ToState)
            .Include(x => x.Assignment)
            .Where(x =>
                x.WorkflowDefinitionId == instance.WorkflowDefinitionId &&
                x.FromStateId == instance.CurrentStateId &&
                x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return transitions
            .Select(x => new WorkflowAvailableActionResponse(
                x.Code,
                x.Name,
                x.RequiresComment,
                x.ToStateId,
                x.ToState.Code,
                x.ToState.Name,
                x.ToState.Color,
                x.Assignment?.Type,
                x.Assignment?.WorkflowCustomQueryId))
            .ToList();
    }

    public Task<PagedResult<WorkflowAssignableEmployeeResponse>> GetAssigneesAsync(
        Guid id,
        string transitionCode,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        return assignmentExecutor.GetAssigneesAsync(
            id,
            StringNormalize.Required(transitionCode),
            page,
            pageSize,
            cancellationToken);
    }

    public async Task<WorkflowInstanceResponse> ExecuteAsync(
        Guid id,
        ExecuteWorkflowTransitionRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();

        var instance = await context.WorkflowInstances
            .Include(x => x.CurrentState)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (instance is null)
            throw new NotFoundException("Instancia de workflow no encontrada.");

        if (instance.IsCompleted)
            throw new BusinessException("La instancia ya está completada.");

        var code = StringNormalize.Required(request.Code);

        var transition = await context.WorkflowTransitions
            .Include(x => x.ToState)
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.Employees)
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.WorkflowCustomQuery)
            .FirstOrDefaultAsync(x =>
                    x.WorkflowDefinitionId == instance.WorkflowDefinitionId &&
                    x.FromStateId == instance.CurrentStateId &&
                    x.Code == code &&
                    x.IsActive,
                cancellationToken);

        if (transition is null)
            throw new BusinessException("La transición no existe o no está activa para el estado actual.");

        if (transition.RequiresComment && string.IsNullOrWhiteSpace(request.Comment))
            throw new BusinessException("Se requiere un comentario para esta acción.");

        await assignmentExecutor.EnsureEmployeeCanExecuteAsync(
            instance.Id,
            transition.Assignment,
            request.EmployeeId,
            cancellationToken);

        var now = DateTime.UtcNow;
        var fromStateId = instance.CurrentStateId;

        instance.CurrentStateId = transition.ToStateId;
        instance.UpdatedAt = now;

        if (transition.ToState.IsFinal)
        {
            instance.IsCompleted = true;
            instance.FinishedAt = now;
        }

        context.WorkflowHistories.Add(new WorkflowHistory
        {
            WorkflowInstanceId = instance.Id,
            WorkflowTransitionId = transition.Id,
            FromStateId = fromStateId,
            ToStateId = transition.ToStateId,
            Comment = string.IsNullOrWhiteSpace(request.Comment)
                ? null
                : request.Comment.Trim(),
            ExecutedByEmployeeId = request.EmployeeId,
            PerformedAt = now
        });

        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(instance.Id, cancellationToken)
            ?? throw new BusinessException("No se pudo recuperar la instancia actualizada.");
    }

    public async Task<IReadOnlyCollection<WorkflowHistoryResponse>> GetHistoryAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var exists = await context.WorkflowInstances
            .AnyAsync(x => x.Id == id, cancellationToken);

        if (!exists)
            throw new NotFoundException("Instancia de workflow no encontrada.");

        return await context.WorkflowHistories
            .AsNoTracking()
            .Include(x => x.FromState)
            .Include(x => x.ToState)
            .Include(x => x.WorkflowTransition)
            .Where(x => x.WorkflowInstanceId == id)
            .OrderByDescending(x => x.PerformedAt)
            .Select(x => new WorkflowHistoryResponse(
                x.Id,
                x.WorkflowTransitionId,
                x.WorkflowTransition != null ? x.WorkflowTransition.Code : null,
                x.WorkflowTransition != null ? x.WorkflowTransition.Name : null,
                x.FromStateId,
                x.FromState.Code,
                x.FromState.Name,
                x.ToStateId,
                x.ToState.Code,
                x.ToState.Name,
                x.ExecutedByEmployeeId,
                x.Comment,
                x.PerformedAt))
            .ToListAsync(cancellationToken);
    }

    private void EnsureAuthenticated()
    {
        if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            throw new BusinessException("Debe iniciar sesión para operar el workflow.");
    }

    private static WorkflowInstanceResponse ToResponse(WorkflowInstance entity)
    {
        return new WorkflowInstanceResponse(
            entity.Id,
            entity.WorkflowDefinitionId,
            entity.WorkflowDefinition.Code,
            entity.WorkflowDefinition.Name,
            entity.ReferenceModule,
            entity.ReferenceEntity,
            entity.ReferenceId,
            entity.CurrentStateId,
            entity.CurrentState.Code,
            entity.CurrentState.Name,
            entity.CurrentState.Color,
            entity.StartedByEmployeeId,
            entity.StartedAt,
            entity.FinishedAt,
            entity.IsCompleted,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
