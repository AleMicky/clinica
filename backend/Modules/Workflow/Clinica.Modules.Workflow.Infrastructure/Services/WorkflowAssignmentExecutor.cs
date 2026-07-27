using System.Text.RegularExpressions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Domain.Enums;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Workflow.Infrastructure.Services;

/// <summary>
/// Resuelve empleados asignables para una transición.
/// Contrato SP esperado:
///   EXEC {ProcedureName} @WorkflowInstanceId, @Page, @PageSize
/// Result set: EmployeeId, EmployeeName, TotalRecords
/// </summary>
public sealed class WorkflowAssignmentExecutor(WorkflowDbContext context)
{
    private static readonly Regex ProcedureNameRegex = new(
        @"^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public async Task<PagedResult<WorkflowAssignableEmployeeResponse>> GetAssigneesAsync(
        Guid workflowInstanceId,
        string transitionCode,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var instance = await context.WorkflowInstances
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == workflowInstanceId, cancellationToken);

        if (instance is null)
            throw new NotFoundException("Instancia de workflow no encontrada.");

        var transition = await context.WorkflowTransitions
            .AsNoTracking()
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.Employees)
            .Include(x => x.Assignment!)
                .ThenInclude(x => x.WorkflowCustomQuery)
            .FirstOrDefaultAsync(x =>
                    x.WorkflowDefinitionId == instance.WorkflowDefinitionId &&
                    x.FromStateId == instance.CurrentStateId &&
                    x.Code == transitionCode &&
                    x.IsActive,
                cancellationToken);

        if (transition is null)
            throw new BusinessException("La transición no existe o no está activa para el estado actual.");

        if (transition.Assignment is null)
        {
            return new PagedResult<WorkflowAssignableEmployeeResponse>([], 0, page, pageSize);
        }

        return transition.Assignment.Type switch
        {
            WorkflowAssignmentType.EmployeeList => await ResolveEmployeeListAsync(
                transition.Assignment, page, pageSize, cancellationToken),
            WorkflowAssignmentType.Area => await ResolveAreaAsync(
                transition.Assignment, page, pageSize, cancellationToken),
            WorkflowAssignmentType.StoredProcedure => await ResolveStoredProcedureAsync(
                workflowInstanceId, transition.Assignment, page, pageSize, cancellationToken),
            _ => throw new BusinessException("Tipo de asignación no soportado.")
        };
    }

    public async Task EnsureEmployeeCanExecuteAsync(
        Guid workflowInstanceId,
        WorkflowTransitionAssignment? assignment,
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        if (assignment is null)
            return;

        if (assignment.Type == WorkflowAssignmentType.EmployeeList)
        {
            if (!assignment.Employees.Any(x => x.EmployeeId == employeeId))
                throw new BusinessException("El empleado no está autorizado para ejecutar esta transición.");
            return;
        }

        if (assignment.Type == WorkflowAssignmentType.Area)
        {
            if (!assignment.AreaId.HasValue)
                throw new BusinessException("La asignación por área no está configurada correctamente.");

            var belongs = await EmployeeBelongsToAreaAsync(
                employeeId, assignment.AreaId.Value, cancellationToken);

            if (!belongs)
                throw new BusinessException("El empleado no pertenece al área autorizada para esta transición.");
            return;
        }

        if (assignment.Type == WorkflowAssignmentType.StoredProcedure)
        {
            var page = 1;
            const int pageSize = 100;
            var found = false;

            while (page <= 20)
            {
                var result = await ResolveStoredProcedureAsync(
                    workflowInstanceId, assignment, page, pageSize, cancellationToken);

                if (result.Items.Any(x => x.EmployeeId == employeeId))
                {
                    found = true;
                    break;
                }

                if (page * pageSize >= result.TotalRecords)
                    break;

                page++;
            }

            if (!found)
                throw new BusinessException("El empleado no está autorizado según el procedimiento de asignación.");
        }
    }

    private async Task<PagedResult<WorkflowAssignableEmployeeResponse>> ResolveEmployeeListAsync(
        WorkflowTransitionAssignment assignment,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var ids = assignment.Employees.Select(x => x.EmployeeId).Distinct().ToList();
        if (ids.Count == 0)
            return new PagedResult<WorkflowAssignableEmployeeResponse>([], 0, page, pageSize);

        return await QueryEmployeesByIdsAsync(ids, page, pageSize, cancellationToken);
    }

    private async Task<PagedResult<WorkflowAssignableEmployeeResponse>> ResolveAreaAsync(
        WorkflowTransitionAssignment assignment,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        if (!assignment.AreaId.HasValue)
            throw new BusinessException("AreaId es obligatorio para asignación por área.");

        var sql = """
            SELECT
                e.Id AS EmployeeId,
                LTRIM(RTRIM(CONCAT(p.Nombres, ' ', p.ApellidoPaterno, ' ', p.ApellidoMaterno))) AS EmployeeName,
                COUNT(*) OVER() AS TotalRecords
            FROM recursos_humanos.Empleados e
            INNER JOIN personas.Personas p ON p.Id = e.PersonaId
            WHERE e.AreaId = {0}
              AND e.IsDeleted = 0
              AND p.IsDeleted = 0
            ORDER BY EmployeeName
            OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY
            """;

        var rows = await context.Database
            .SqlQueryRaw<WorkflowProcedureEmployeeRow>(
                sql,
                assignment.AreaId.Value,
                (page - 1) * pageSize,
                pageSize)
            .ToListAsync(cancellationToken);

        var total = rows.FirstOrDefault()?.TotalRecords ?? 0;
        var items = rows
            .Select(x => new WorkflowAssignableEmployeeResponse(x.EmployeeId, x.EmployeeName))
            .ToList();

        return new PagedResult<WorkflowAssignableEmployeeResponse>(items, total, page, pageSize);
    }

    private async Task<PagedResult<WorkflowAssignableEmployeeResponse>> ResolveStoredProcedureAsync(
        Guid workflowInstanceId,
        WorkflowTransitionAssignment assignment,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = assignment.WorkflowCustomQuery
            ?? await context.WorkflowCustomQueries
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == assignment.WorkflowCustomQueryId, cancellationToken);

        if (query is null)
            throw new NotFoundException("Consulta personalizada de workflow no encontrada.");

        var procedureName = query.ProcedureName.Trim();
        if (!ProcedureNameRegex.IsMatch(procedureName))
            throw new BusinessException("El nombre del procedimiento almacenado no es válido.");

        var quoted = QuoteProcedureName(procedureName);
        var sql = $"EXEC {quoted} @WorkflowInstanceId={{0}}, @Page={{1}}, @PageSize={{2}}";

        var rows = await context.Database
            .SqlQueryRaw<WorkflowProcedureEmployeeRow>(
                sql,
                workflowInstanceId,
                page,
                pageSize)
            .ToListAsync(cancellationToken);

        var total = rows.FirstOrDefault()?.TotalRecords ?? 0;
        var items = rows
            .Select(x => new WorkflowAssignableEmployeeResponse(x.EmployeeId, x.EmployeeName.Trim()))
            .ToList();

        return new PagedResult<WorkflowAssignableEmployeeResponse>(items, total, page, pageSize);
    }

    private async Task<PagedResult<WorkflowAssignableEmployeeResponse>> QueryEmployeesByIdsAsync(
        IReadOnlyCollection<Guid> ids,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var idList = string.Join(",", ids.Select(id => $"'{id}'"));
        var skip = (page - 1) * pageSize;
        var sql = $"""
            SELECT
                e.Id AS EmployeeId,
                LTRIM(RTRIM(CONCAT(p.Nombres, ' ', p.ApellidoPaterno, ' ', p.ApellidoMaterno))) AS EmployeeName,
                COUNT(*) OVER() AS TotalRecords
            FROM recursos_humanos.Empleados e
            INNER JOIN personas.Personas p ON p.Id = e.PersonaId
            WHERE e.Id IN ({idList})
              AND e.IsDeleted = 0
              AND p.IsDeleted = 0
            ORDER BY EmployeeName
            OFFSET {skip} ROWS FETCH NEXT {pageSize} ROWS ONLY
            """;

        var rows = await context.Database
            .SqlQueryRaw<WorkflowProcedureEmployeeRow>(sql)
            .ToListAsync(cancellationToken);

        var total = rows.FirstOrDefault()?.TotalRecords ?? ids.Count;
        var items = rows
            .Select(x => new WorkflowAssignableEmployeeResponse(x.EmployeeId, x.EmployeeName))
            .ToList();

        return new PagedResult<WorkflowAssignableEmployeeResponse>(items, total, page, pageSize);
    }

    private async Task<bool> EmployeeBelongsToAreaAsync(
        Guid employeeId,
        Guid areaId,
        CancellationToken cancellationToken)
    {
        var rows = await context.Database
            .SqlQueryRaw<WorkflowScalarBoolRow>(
                """
                SELECT CAST(CASE WHEN EXISTS (
                    SELECT 1
                    FROM recursos_humanos.Empleados e
                    WHERE e.Id = {0}
                      AND e.AreaId = {1}
                      AND e.IsDeleted = 0
                ) THEN 1 ELSE 0 END AS bit) AS Value
                """,
                employeeId,
                areaId)
            .ToListAsync(cancellationToken);

        return rows.FirstOrDefault()?.Value ?? false;
    }

    private static string QuoteProcedureName(string procedureName)
    {
        var parts = procedureName.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return string.Join('.', parts.Select(part => $"[{part.Replace("]", "]]", StringComparison.Ordinal)}]"));
    }

    private sealed class WorkflowProcedureEmployeeRow
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int TotalRecords { get; set; }
    }

    private sealed class WorkflowScalarBoolRow
    {
        public bool Value { get; set; }
    }
}
