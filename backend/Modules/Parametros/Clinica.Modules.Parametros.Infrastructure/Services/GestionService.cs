using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Gestiones;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class GestionService(
    ParametrosDbContext context
) : IGestionService
{
    private static readonly string[] LiteralesMes =
    [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    public async Task<PagedResult<GestionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await context.Gestiones
            .AsNoTracking()
            .OrderByDescending(x => x.NumeroGestion)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<GestionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Gestiones
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<GestionResponse> CreateAsync(
        CreateGestionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureGestionIsUniqueAsync(request.Gestion, null, cancellationToken);

        if (request.Activa)
            await DesactivarOtrasAsync(null, cancellationToken);

        var entity = new Gestion
        {
            NumeroGestion = request.Gestion,
            FechaInicio = request.FechaInicio,
            FechaFin = request.FechaFin,
            Literal = StringNormalize.Required(request.Literal),
            Activa = request.Activa,
        };

        for (var mes = 1; mes <= 12; mes++)
        {
            var inicio = new DateOnly(request.Gestion, mes, 1);
            var fin = inicio.AddMonths(1).AddDays(-1);

            entity.Periodos.Add(new Periodo
            {
                Numero = mes,
                FechaInicio = inicio,
                FechaFin = fin,
                Literal = LiteralesMes[mes - 1],
            });
        }

        context.Gestiones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<GestionResponse> UpdateAsync(
        Guid id,
        UpdateGestionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Gestiones
            .GetRequiredAsync(id, "Gestión no encontrada.", cancellationToken);

        await EnsureGestionIsUniqueAsync(request.Gestion, id, cancellationToken);

        if (request.Activa)
            await DesactivarOtrasAsync(id, cancellationToken);

        entity.NumeroGestion = request.Gestion;
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.Literal = StringNormalize.Required(request.Literal);
        entity.Activa = request.Activa;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Gestiones
            .GetRequiredAsync(id, "Gestión no encontrada.", cancellationToken);

        context.Gestiones.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureGestionIsUniqueAsync(
        int gestion,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        if (currentId is { } id)
        {
            await context.Gestiones.EnsureUniqueAsync(
                x => x.NumeroGestion == gestion && x.Id != id,
                "La gestión ya existe.",
                cancellationToken);
            return;
        }

        await context.Gestiones.EnsureUniqueAsync(
            x => x.NumeroGestion == gestion,
            "La gestión ya existe.",
            cancellationToken);
    }

    private async Task DesactivarOtrasAsync(
        Guid? exceptId,
        CancellationToken cancellationToken)
    {
        var query = context.Gestiones.Where(x => x.Activa);

        if (exceptId is { } id)
            query = query.Where(x => x.Id != id);

        var activas = await query.ToListAsync(cancellationToken);

        foreach (var item in activas)
            item.Activa = false;
    }

    private static GestionResponse ToResponse(Gestion entity) =>
        new(
            entity.Id,
            entity.NumeroGestion,
            entity.FechaInicio,
            entity.FechaFin,
            entity.Literal,
            entity.Activa);
}
