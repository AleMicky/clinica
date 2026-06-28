using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowDefinitions;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Workflow.Infrastructure.Services;

public sealed class WorkflowDefinitionService(
    WorkflowDbContext context
) : IWorkflowDefinitionService
{
    public async Task<PagedResult<WorkflowDefinitionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.WorkflowDefinitions.AsNoTracking();

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<WorkflowDefinitionResponse>(items, total, page, pageSize);
    }

    public async Task<WorkflowDefinitionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.WorkflowDefinitions
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<WorkflowDefinitionResponse> CreateAsync(
        CreateWorkflowDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = Normalize(request.Code);
        await EnsureCodeIsUniqueAsync(code, null, cancellationToken);

        var entity = new WorkflowDefinition
        {
            Code = code,
            Name = Normalize(request.Name),
            Description = Normalize(request.Description),
            Module = Normalize(request.Module),
            EntityName = Normalize(request.EntityName),
            IsActive = request.IsActive
        };

        context.WorkflowDefinitions.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<WorkflowDefinitionResponse> UpdateAsync(
        Guid id,
        UpdateWorkflowDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowDefinitions
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Definición de workflow no encontrada.");

        var code = Normalize(request.Code);
        await EnsureCodeIsUniqueAsync(code, id, cancellationToken);

        entity.Code = code;
        entity.Name = Normalize(request.Name);
        entity.Description = Normalize(request.Description);
        entity.Module = Normalize(request.Module);
        entity.EntityName = Normalize(request.EntityName);
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowDefinitions
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Definición de workflow no encontrada.");

        context.WorkflowDefinitions.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodeIsUniqueAsync(
        string code,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.WorkflowDefinitions
            .AnyAsync(x =>
                    x.Code == code &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static WorkflowDefinitionResponse ToResponse(WorkflowDefinition entity)
    {
        return new WorkflowDefinitionResponse(
            entity.Id,
            entity.Code,
            entity.Name,
            entity.Description,
            entity.Module,
            entity.EntityName,
            entity.IsActive,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
