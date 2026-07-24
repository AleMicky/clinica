using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowDefinitions;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
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
        var query = context.WorkflowDefinitions.AsNoTracking();

        return await query
            .OrderBy(x => x.Name)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
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
        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(code, null, cancellationToken);

        var entity = new WorkflowDefinition
        {
            Code = code,
            Name = StringNormalize.Required(request.Name),
            Description = StringNormalize.Required(request.Description),
            Module = StringNormalize.Required(request.Module),
            EntityName = StringNormalize.Required(request.EntityName),
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

        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(code, id, cancellationToken);

        entity.Code = code;
        entity.Name = StringNormalize.Required(request.Name);
        entity.Description = StringNormalize.Required(request.Description);
        entity.Module = StringNormalize.Required(request.Module);
        entity.EntityName = StringNormalize.Required(request.EntityName);
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
