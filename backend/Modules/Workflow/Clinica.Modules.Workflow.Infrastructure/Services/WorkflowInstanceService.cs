using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Workflow.Infrastructure.Services;

public sealed class WorkflowInstanceService(
    WorkflowDbContext context,
    ICurrentUser currentUser
) : IWorkflowInstanceService
{
    public async Task<WorkflowInstanceResponse> StartAsync(
        StartWorkflowInstanceRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();

        var definition = await context.WorkflowDefinitions
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                    x.Code == Normalize(request.WorkflowDefinitionCode) &&
                    x.IsActive,
                cancellationToken);

        if (definition is null)
            throw new NotFoundException("Definición de workflow no encontrada o inactiva.");

        var existing = await context.WorkflowInstances
            .AnyAsync(x =>
                    x.ReferenceModule == Normalize(request.ReferenceModule) &&
                    x.ReferenceEntity == Normalize(request.ReferenceEntity) &&
                    x.ReferenceId == request.ReferenceId,
                cancellationToken);

        if (existing)
            throw new BusinessException("Ya existe una instancia de workflow para la referencia indicada.");

        var initialState = await context.WorkflowStates
            .FirstOrDefaultAsync(x =>
                    x.WorkflowDefinitionId == definition.Id &&
                    x.IsInitial,
                cancellationToken);

        if (initialState is null)
            throw new BusinessException("La definición no tiene un estado inicial configurado.");

        var correlative = await context.WorkflowInstances
            .Where(x => x.WorkflowDefinitionId == definition.Id)
            .Select(x => (int?)x.Correlative)
            .MaxAsync(cancellationToken) ?? 0;

        var now = DateTime.UtcNow;
        var userId = currentUser.UserId!.Value;
        var userName = currentUser.UserName ?? "Usuario";

        var instance = new WorkflowInstance
        {
            Id = Guid.NewGuid(),
            WorkflowDefinitionId = definition.Id,
            ReferenceModule = Normalize(request.ReferenceModule),
            ReferenceEntity = Normalize(request.ReferenceEntity),
            ReferenceId = request.ReferenceId,
            CurrentStateId = initialState.Id,
            Correlative = correlative + 1,
            StartedByUserId = userId,
            StartedByUserName = userName,
            StartedAt = now,
            IsCompleted = initialState.IsFinal,
            FinishedAt = initialState.IsFinal ? now : null
        };

        context.WorkflowInstances.Add(instance);

        context.WorkflowHistories.Add(new WorkflowHistory
        {
            WorkflowInstanceId = instance.Id,
            FromStateId = initialState.Id,
            ToStateId = initialState.Id,
            ActionCode = "INICIAR",
            ActionName = "Iniciar workflow",
            Comment = null,
            PerformedByUserId = userId,
            PerformedByUserName = userName,
            PerformedByRole = GetPrimaryRole(),
            PerformedAt = now
        });

        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(instance.Id, cancellationToken)
            ?? throw new BusinessException("No se pudo recuperar la instancia creada.");
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
                x.ReferenceModule == Normalize(referenceModule) &&
                x.ReferenceEntity == Normalize(referenceEntity) &&
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

        var userRoles = currentUser.Roles;

        var transitions = await context.WorkflowTransitions
            .AsNoTracking()
            .Include(x => x.ToState)
            .Where(x =>
                x.WorkflowDefinitionId == instance.WorkflowDefinitionId &&
                x.FromStateId == instance.CurrentStateId &&
                x.IsActive)
            .OrderBy(x => x.ActionName)
            .ToListAsync(cancellationToken);

        return transitions
            .Where(x => string.IsNullOrWhiteSpace(x.RequiredRole) ||
                        userRoles.Contains(x.RequiredRole, StringComparer.OrdinalIgnoreCase))
            .Select(x => new WorkflowAvailableActionResponse(
                x.ActionCode,
                x.ActionName,
                x.Description,
                x.RequiredRole,
                x.RequiresComment,
                x.ToStateId,
                x.ToState.Code,
                x.ToState.Name,
                x.ToState.Color))
            .ToList();
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

        var actionCode = Normalize(request.ActionCode);

        var transition = await context.WorkflowTransitions
            .Include(x => x.ToState)
            .FirstOrDefaultAsync(x =>
                    x.WorkflowDefinitionId == instance.WorkflowDefinitionId &&
                    x.FromStateId == instance.CurrentStateId &&
                    x.ActionCode == actionCode &&
                    x.IsActive,
                cancellationToken);

        if (transition is null)
            throw new BusinessException("La transición no existe o no está activa para el estado actual.");

        if (!string.IsNullOrWhiteSpace(transition.RequiredRole) &&
            !currentUser.Roles.Contains(transition.RequiredRole, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessException("No tiene el rol requerido para ejecutar esta acción.");
        }

        if (transition.RequiresComment && string.IsNullOrWhiteSpace(request.Comment))
            throw new BusinessException("Se requiere un comentario para esta acción.");

        var now = DateTime.UtcNow;
        var userId = currentUser.UserId!.Value;
        var userName = currentUser.UserName ?? "Usuario";
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
            FromStateId = fromStateId,
            ToStateId = transition.ToStateId,
            ActionCode = transition.ActionCode,
            ActionName = transition.ActionName,
            Comment = string.IsNullOrWhiteSpace(request.Comment)
                ? null
                : request.Comment.Trim(),
            PerformedByUserId = userId,
            PerformedByUserName = userName,
            PerformedByRole = GetPrimaryRole(),
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
            .Where(x => x.WorkflowInstanceId == id)
            .OrderByDescending(x => x.PerformedAt)
            .Select(x => new WorkflowHistoryResponse(
                x.Id,
                x.FromStateId,
                x.FromState.Code,
                x.FromState.Name,
                x.ToStateId,
                x.ToState.Code,
                x.ToState.Name,
                x.ActionCode,
                x.ActionName,
                x.Comment,
                x.PerformedByUserId,
                x.PerformedByUserName,
                x.PerformedByRole,
                x.PerformedAt))
            .ToListAsync(cancellationToken);
    }

    private void EnsureAuthenticated()
    {
        if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            throw new BusinessException("Debe iniciar sesión para operar el workflow.");
    }

    private string? GetPrimaryRole() => currentUser.Roles.FirstOrDefault();

    private static string Normalize(string value) => value.Trim();

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
            entity.Correlative,
            entity.StartedByUserId,
            entity.StartedByUserName,
            entity.StartedAt,
            entity.FinishedAt,
            entity.IsCompleted,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
