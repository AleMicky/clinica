using System.Linq.Expressions;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Turnos;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class TurnoService(RecursosHumanosDbContext context) : ITurnoService
{
    private static readonly Expression<Func<Turno, TurnoResponse>> ProjectToResponse =
        x => new TurnoResponse(
            x.Id,
            x.Codigo,
            x.Nombre,
            x.HoraInicio,
            x.HoraFin,
            x.CruceDia,
            x.Activo,
            x.PermiteMultiplesMedicosTurno);

    public Task<PagedResult<TurnoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new TurnoPagedRequest { Page = request.Page, PageSize = request.PageSize },
            cancellationToken);
    }

    public async Task<PagedResult<TurnoResponse>> GetPagedAsync(
        TurnoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Turnos.AsNoTracking().AsQueryable();

        if (request.Activo is { } activo)
            query = query.Where(x => x.Activo == activo);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(search) ||
                x.Nombre.Contains(search));
        }

        return await query
            .OrderBy(x => x.HoraInicio)
            .ThenBy(x => x.Nombre)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<TurnoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Turnos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<TurnoResponse> CreateAsync(
        CreateTurnoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Turno
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            HoraInicio = request.HoraInicio,
            HoraFin = request.HoraFin,
            CruceDia = request.CruceDia,
            Activo = request.Activo,
            PermiteMultiplesMedicosTurno = request.PermiteMultiplesMedicosTurno
        };

        context.Turnos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<TurnoResponse> UpdateAsync(
        Guid id,
        UpdateTurnoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Turnos.GetRequiredAsync(id, "Turno no encontrado.", cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.HoraInicio = request.HoraInicio;
        entity.HoraFin = request.HoraFin;
        entity.CruceDia = request.CruceDia;
        entity.Activo = request.Activo;
        entity.PermiteMultiplesMedicosTurno = request.PermiteMultiplesMedicosTurno;

        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Turnos.GetRequiredAsync(id, "Turno no encontrado.", cancellationToken);

        var enUso = await context.ProgramacionDiaria
            .AnyAsync(x => x.TurnoId == id, cancellationToken);

        if (enUso)
            throw new BusinessException("No se puede eliminar un turno con programaciones asociadas.");

        context.Turnos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Turnos.AnyAsync(
            x => x.Codigo == codigo && (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El código de turno ya existe.");
    }

    private static TurnoResponse MapToResponse(Turno entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.HoraInicio,
            entity.HoraFin,
            entity.CruceDia,
            entity.Activo,
            entity.PermiteMultiplesMedicosTurno);
}
