using System.Data;
using System.Data.Common;
using System.Linq.Expressions;
using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using CorrelativoEntity = Clinica.Api.Modules.Parametros.Correlativo.Entity.Correlativo;

namespace Clinica.Api.Modules.Parametros.Correlativo.Services;

public interface ICorrelativoService
{
    Task<List<CorrelativoResponse>> ListarAsync(
        string? codigo,
        int? gestion,
        CancellationToken cancellationToken = default);

    Task<CorrelativoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CorrelativoResponse> CrearAsync(
        CreateCorrelativoRequest request,
        CancellationToken cancellationToken = default);

    Task<CorrelativoResponse> ActualizarAsync(
        int id,
        UpdateCorrelativoRequest request,
        CancellationToken cancellationToken = default);

    Task<CorrelativoResponse> GenerarAsync(
        GenerarCorrelativoRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class CorrelativoService(AppDbContext dbContext) : ICorrelativoService
{
    private const int LongitudDefault = 6;

    private static readonly Expression<Func<CorrelativoEntity, CorrelativoResponse>>
        ToResponseProjection = x => new CorrelativoResponse
        {
            Id = x.Id,
            Codigo = x.Codigo,
            Gestion = x.Gestion,
            UltimoNumero = x.UltimoNumero,
            Prefijo = x.Prefijo,
            Longitud = x.Longitud
        };

    public async Task<List<CorrelativoResponse>> ListarAsync(
        string? codigo,
        int? gestion,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Correlativo
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(codigo))
        {
            var codigoNormalizado = NormalizarCodigo(codigo);

            query = query.Where(x => x.Codigo == codigoNormalizado);
        }

        if (gestion.HasValue)
        {
            query = query.Where(x => x.Gestion == gestion.Value);
        }

        return await query
            .OrderByDescending(x => x.Gestion)
            .ThenBy(x => x.Codigo)
            .Select(ToResponseProjection)
            .ToListAsync(cancellationToken);
    }

    public async Task<CorrelativoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Correlativo
                   .AsNoTracking()
                   .Where(x => x.Id == id)
                   .Select(ToResponseProjection)
                   .FirstOrDefaultAsync(cancellationToken)
               ?? throw new NotFoundException("Correlativo no encontrado.");
    }

    public async Task<CorrelativoResponse> CrearAsync(
        CreateCorrelativoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = NormalizarCodigo(request.Codigo);
        var gestion = ObtenerGestion(request.Gestion);

        await ValidarDuplicadoAsync(
            codigo,
            gestion,
            cancellationToken: cancellationToken);

        var entity = new CorrelativoEntity
        {
            Codigo = codigo,
            Gestion = gestion,
            UltimoNumero = 0,
            Prefijo = NormalizarPrefijo(request.Prefijo),
            Longitud = request.Longitud ?? LongitudDefault
        };

        dbContext.Correlativo.Add(entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<CorrelativoResponse> ActualizarAsync(
        int id,
        UpdateCorrelativoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Correlativo
                         .FirstOrDefaultAsync(
                             x => x.Id == id,
                             cancellationToken)
                     ?? throw new NotFoundException("Correlativo no encontrado.");

        var codigo = NormalizarCodigo(request.Codigo);
        var gestion = request.Gestion ?? entity.Gestion;

        await ValidarDuplicadoAsync(
            codigo,
            gestion,
            id,
            cancellationToken);

        entity.Codigo = codigo;
        entity.Gestion = gestion;
        entity.Prefijo = NormalizarPrefijo(request.Prefijo);

        if (request.Longitud.HasValue)
        {
            entity.Longitud = request.Longitud.Value;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<CorrelativoResponse> GenerarAsync(
        GenerarCorrelativoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = NormalizarCodigo(request.Codigo);
        var gestion = ObtenerGestion(request.Gestion);

        var correlativo = await IncrementarAsync(
            codigo,
            gestion,
            cancellationToken);

        if (correlativo is not null)
        {
            return ToResponse(correlativo);
        }

        return await CrearInicialAsync(
            codigo,
            gestion,
            request.Prefijo,
            request.Longitud,
            cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var affected = await dbContext.Correlativo
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync(cancellationToken);

        if (affected == 0)
        {
            throw new NotFoundException("Correlativo no encontrado.");
        }
    }

    private async Task<CorrelativoResponse> CrearInicialAsync(
        string codigo,
        int gestion,
        string? prefijo,
        int? longitud,
        CancellationToken cancellationToken)
    {
        var entity = new CorrelativoEntity
        {
            Codigo = codigo,
            Gestion = gestion,
            UltimoNumero = 1,
            Prefijo = NormalizarPrefijo(prefijo),
            Longitud = longitud ?? LongitudDefault
        };

        dbContext.Correlativo.Add(entity);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);

            return ToResponse(entity);
        }
        catch (DbUpdateException)
        {
            /*
             * Otra petición pudo crear el mismo Codigo + Gestion
             * mientras esta petición intentaba insertarlo.
             *
             * El índice UNIQUE es indispensable para garantizar esto.
             */

            dbContext.Entry(entity).State = EntityState.Detached;

            var correlativo = await IncrementarAsync(
                codigo,
                gestion,
                cancellationToken);

            if (correlativo is null)
            {
                throw;
            }

            return ToResponse(correlativo);
        }
    }

    private async Task<CorrelativoEntity?> IncrementarAsync(
        string codigo,
        int gestion,
        CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();

        var debeCerrarConexion = connection.State != ConnectionState.Open;

        if (debeCerrarConexion)
        {
            await dbContext.Database.OpenConnectionAsync(cancellationToken);
        }

        try
        {
            await using var command = connection.CreateCommand();

            command.Transaction =
                dbContext.Database.CurrentTransaction?.GetDbTransaction();

            command.CommandText =
                """
                UPDATE Correlativos
                SET UltimoNumero = UltimoNumero + 1
                OUTPUT
                    INSERTED.Id,
                    INSERTED.Codigo,
                    INSERTED.Gestion,
                    INSERTED.UltimoNumero,
                    INSERTED.Prefijo,
                    INSERTED.Longitud
                WHERE Codigo = @codigo
                  AND Gestion = @gestion;
                """;

            AddParameter(command, "@codigo", codigo);
            AddParameter(command, "@gestion", gestion);

            await using var reader =
                await command.ExecuteReaderAsync(cancellationToken);

            if (!await reader.ReadAsync(cancellationToken))
            {
                return null;
            }

            return new CorrelativoEntity
            {
                Id = reader.GetInt32(0),
                Codigo = reader.GetString(1),
                Gestion = reader.GetInt32(2),
                UltimoNumero = reader.GetInt32(3),
                Prefijo = reader.IsDBNull(4)
                    ? null
                    : reader.GetString(4),
                Longitud = reader.GetInt32(5)
            };
        }
        finally
        {
            if (debeCerrarConexion)
            {
                await dbContext.Database.CloseConnectionAsync();
            }
        }
    }

    private async Task ValidarDuplicadoAsync(
        string codigo,
        int gestion,
        int? excluirId = null,
        CancellationToken cancellationToken = default)
    {
        var existe = await dbContext.Correlativo
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.Codigo == codigo &&
                    x.Gestion == gestion &&
                    (!excluirId.HasValue || x.Id != excluirId.Value),
                cancellationToken);

        if (existe)
        {
            throw new BusinessException(
                $"Ya existe el correlativo '{codigo}' para la gestión {gestion}.");
        }
    }

    private static int ObtenerGestion(int? gestion)
    {
        return gestion ?? DateTime.UtcNow.Year;
    }

    private static string NormalizarCodigo(string codigo)
    {
        return codigo.Trim().ToUpperInvariant();
    }

    private static string? NormalizarPrefijo(string? prefijo)
    {
        return string.IsNullOrWhiteSpace(prefijo)
            ? null
            : prefijo.Trim().ToUpperInvariant();
    }

    private static void AddParameter(
        DbCommand command,
        string name,
        object? value)
    {
        var parameter = command.CreateParameter();

        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;

        command.Parameters.Add(parameter);
    }

    private static CorrelativoResponse ToResponse(
        CorrelativoEntity entity)
    {
        return new CorrelativoResponse
        {
            Id = entity.Id,
            Codigo = entity.Codigo,
            Gestion = entity.Gestion,
            UltimoNumero = entity.UltimoNumero,
            Prefijo = entity.Prefijo,
            Longitud = entity.Longitud,
            NumeroFormateado = Formatear(entity)
        };
    }


    private static string Formatear(CorrelativoEntity entity)
    {
        var numero = entity.UltimoNumero
            .ToString()
            .PadLeft(entity.Longitud, '0');

        return string.IsNullOrEmpty(entity.Prefijo)
            ? $"{entity.Gestion}-{numero}"
            : $"{entity.Prefijo}-{entity.Gestion}-{numero}";
    }
}