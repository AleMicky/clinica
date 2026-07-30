using System.Data;
using System.Data.Common;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class CorrelativoService(ParametrosDbContext context) : ICorrelativoService
{
    public async Task<PagedResult<CorrelativoResponse>> GetPagedAsync(CorrelativoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Correlativos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Codigo))
        {
            var codigo = request.Codigo.Trim().ToUpperInvariant();
            query = query.Where(x => x.Codigo == codigo);
        }

        if (request.Gestion.HasValue)
            query = query.Where(x => x.Gestion == request.Gestion.Value);

        var paged = await query
            .OrderByDescending(x => x.Gestion)
            .ThenBy(x => x.Codigo)
            .ToPagedResultAsync(request, cancellationToken);

        return new PagedResult<CorrelativoResponse>(
            paged.Items.Select(ToResponse).ToList(),
            paged.TotalRecords,
            paged.Page,
            paged.PageSize);
    }

    public async Task<CorrelativoResponse> GenerarAsync(
        GenerarCorrelativoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var gestion = request.Gestion ?? DateTime.UtcNow.Year;
        var now = DateTime.UtcNow;
        var updatePrefijo = request.Prefijo is not null;
        var prefijo = updatePrefijo ? StringNormalize.Optional(request.Prefijo) : null;
        var updateLongitud = request.Longitud.HasValue;
        var longitud = request.Longitud ?? 0;

        var updated = await IncrementAsync(
            codigo,
            gestion,
            now,
            updatePrefijo,
            prefijo,
            updateLongitud,
            longitud,
            cancellationToken);

        if (updated is not null)
            return ToResponse(updated);

        var entity = new Correlativo
        {
            Id = Guid.NewGuid(),
            Codigo = codigo,
            Gestion = gestion,
            UltimoNumero = 1,
            Prefijo = StringNormalize.Optional(request.Prefijo),
            Longitud = request.Longitud ?? 6,
            FechaCreacion = now
        };

        context.Correlativos.Add(entity);

        try
        {
            await context.SaveChangesAsync(cancellationToken);
            return ToResponse(entity);
        }
        catch (DbUpdateException)
        {
            context.Entry(entity).State = EntityState.Detached;

            updated = await IncrementAsync(
                codigo,
                gestion,
                now,
                updatePrefijo,
                prefijo,
                updateLongitud,
                longitud,
                cancellationToken);

            if (updated is not null)
                return ToResponse(updated);

            throw;
        }
    }

    private async Task<Correlativo?> IncrementAsync(
        string codigo,
        int gestion,
        DateTime now,
        bool updatePrefijo,
        string? prefijo,
        bool updateLongitud,
        int longitud,
        CancellationToken cancellationToken)
    {
        var connection = context.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await context.Database.OpenConnectionAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.Transaction = context.Database.CurrentTransaction?.GetDbTransaction();
        command.CommandText =
            """
            UPDATE [parametros].[Correlativos]
            SET UltimoNumero = UltimoNumero + 1,
                FechaActualizacion = @now,
                Prefijo = CASE WHEN @updatePrefijo = 1 THEN @prefijo ELSE Prefijo END,
                Longitud = CASE WHEN @updateLongitud = 1 THEN @longitud ELSE Longitud END
            OUTPUT
                INSERTED.Id,
                INSERTED.Codigo,
                INSERTED.Gestion,
                INSERTED.UltimoNumero,
                INSERTED.Prefijo,
                INSERTED.Longitud,
                INSERTED.FechaCreacion,
                INSERTED.FechaActualizacion
            WHERE Codigo = @codigo AND Gestion = @gestion
            """;

        AddParameter(command, "@now", now);
        AddParameter(command, "@updatePrefijo", updatePrefijo);
        AddParameter(command, "@prefijo", prefijo);
        AddParameter(command, "@updateLongitud", updateLongitud);
        AddParameter(command, "@longitud", longitud);
        AddParameter(command, "@codigo", codigo);
        AddParameter(command, "@gestion", gestion);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
            return null;

        return new Correlativo
        {
            Id = reader.GetGuid(0),
            Codigo = reader.GetString(1),
            Gestion = reader.GetInt32(2),
            UltimoNumero = reader.GetInt32(3),
            Prefijo = reader.IsDBNull(4) ? null : reader.GetString(4),
            Longitud = reader.GetInt32(5),
            FechaCreacion = reader.GetDateTime(6),
            FechaActualizacion = reader.IsDBNull(7) ? null : reader.GetDateTime(7)
        };
    }

    private static void AddParameter(DbCommand command, string name, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;
        command.Parameters.Add(parameter);
    }

    private static string Formatear(Correlativo entity)
    {
        var numero = entity.UltimoNumero
            .ToString()
            .PadLeft(entity.Longitud, '0');

        return string.IsNullOrEmpty(entity.Prefijo)
            ? $"{entity.Gestion}-{numero}"
            : $"{entity.Prefijo}-{entity.Gestion}-{numero}";
    }

    private static CorrelativoResponse ToResponse(Correlativo entity)
    {
        return new CorrelativoResponse(
            entity.Id,
            entity.Codigo,
            entity.Gestion,
            entity.UltimoNumero,
            entity.Prefijo,
            entity.Longitud,
            Formatear(entity),
            entity.FechaCreacion,
            entity.FechaActualizacion);
    }
}
