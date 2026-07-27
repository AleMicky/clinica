using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowCustomQueries;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Workflow.Infrastructure.Services;

public sealed class WorkflowCustomQueryService(
    WorkflowDbContext context
) : IWorkflowCustomQueryService
{
    public async Task<PagedResult<WorkflowCustomQueryResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.WorkflowCustomQueries.AsNoTracking();

        return await query
            .OrderBy(x => x.Name)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<WorkflowCustomQueryResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.WorkflowCustomQueries
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<WorkflowCustomQueryResponse> CreateAsync(
        CreateWorkflowCustomQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(code, null, cancellationToken);

        var entity = new WorkflowCustomQuery
        {
            Code = code,
            Name = StringNormalize.Required(request.Name),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            ProcedureName = StringNormalize.Required(request.ProcedureName)
        };

        context.WorkflowCustomQueries.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<WorkflowCustomQueryResponse> UpdateAsync(
        Guid id,
        UpdateWorkflowCustomQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowCustomQueries
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Consulta personalizada de workflow no encontrada.");

        var code = StringNormalize.Required(request.Code);
        await EnsureCodeIsUniqueAsync(code, id, cancellationToken);

        entity.Code = code;
        entity.Name = StringNormalize.Required(request.Name);
        entity.Description = string.IsNullOrWhiteSpace(request.Description)
            ? null
            : request.Description.Trim();
        entity.ProcedureName = StringNormalize.Required(request.ProcedureName);
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.WorkflowCustomQueries
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Consulta personalizada de workflow no encontrada.");

        var inUse = await context.WorkflowTransitionAssignments
            .AnyAsync(x => x.WorkflowCustomQueryId == id, cancellationToken);

        if (inUse)
            throw new BusinessException("La consulta está asignada a una o más transiciones.");

        context.WorkflowCustomQueries.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodeIsUniqueAsync(
        string code,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.WorkflowCustomQueries
            .AnyAsync(x =>
                    x.Code == code &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe.");
    }

    private static WorkflowCustomQueryResponse ToResponse(WorkflowCustomQuery entity)
    {
        return new WorkflowCustomQueryResponse(
            entity.Id,
            entity.Code,
            entity.Name,
            entity.Description,
            entity.ProcedureName,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
