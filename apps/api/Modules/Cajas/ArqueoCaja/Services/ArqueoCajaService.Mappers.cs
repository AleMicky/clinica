using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using ArqueoCajaEntity = Clinica.Api.Modules.Cajas.ArqueoCaja.Entity.ArqueoCaja;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Services;

public sealed partial class ArqueoCajaService
{
    private static ArqueoCajaEntity MapToNewEntity(
        CreateArqueoCajaRequest request)
    {
        var entity = ArqueoCajaMapper.ToEntity(request);
        entity.Detalles = request.Detalles
            .Select(CrearDetalle)
            .ToList();
        CalcularTotales(entity);
        Normalizar(entity);
        return entity;
    }

    private static void MapToExistingEntity(
        UpdateArqueoCajaRequest request,
        ArqueoCajaEntity entity)
    {
        ArqueoCajaMapper.UpdateEntity(request, entity);
        ReemplazarDetalles(entity, request.Detalles);
        CalcularTotales(entity);
        Normalizar(entity);
    }

    private static ArqueoCajaResponse MapToResponse(
        ArqueoCajaEntity entity)
    {
        return new ArqueoCajaResponse
        {
            Id = entity.Id,
            TurnoCaja = MapTurnoCajaInfo(entity.TurnoCaja),
            FechaHora = entity.FechaHora,
            TotalEsperado = entity.TotalEsperado,
            TotalContado = entity.TotalContado,
            Diferencia = entity.Diferencia,
            Observacion = entity.Observacion,
            Detalles = MapDetalles(entity.Detalles.Where(x => x.Activo)),
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static IReadOnlyCollection<ArqueoCajaResponse>
        MapToResponseList(IEnumerable<ArqueoCajaEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    private static DetalleArqueoCaja CrearDetalle(
        ArqueoCajaDetalleRequest request)
    {
        var diferencia = decimal.Round(
            request.MontoContado - request.MontoEsperado,
            2,
            MidpointRounding.AwayFromZero);

        return new DetalleArqueoCaja
        {
            MetodoPagoId = request.MetodoPagoId,
            MonedaId = request.MonedaId,
            MontoEsperado = request.MontoEsperado,
            MontoContado = request.MontoContado,
            Diferencia = diferencia
        };
    }

    private static void ReemplazarDetalles(
        ArqueoCajaEntity entity,
        IReadOnlyCollection<ArqueoCajaDetalleRequest> detalles)
    {
        var existingByKey = entity.Detalles
            .Where(x => x.Activo)
            .ToDictionary(ClaveDetalle);

        var incomingKeys = detalles
            .Select(ClaveDetalle)
            .ToHashSet();

        foreach (var existing in entity.Detalles
                     .Where(x => x.Activo && !incomingKeys.Contains(ClaveDetalle(x)))
                     .ToList())
        {
            entity.Detalles.Remove(existing);
        }

        foreach (var request in detalles)
        {
            if (existingByKey.TryGetValue(
                    ClaveDetalle(request),
                    out var detalle))
            {
                detalle.MetodoPagoId = request.MetodoPagoId;
                detalle.MonedaId = request.MonedaId;
                detalle.MontoEsperado = request.MontoEsperado;
                detalle.MontoContado = request.MontoContado;
                detalle.Diferencia = decimal.Round(
                    request.MontoContado - request.MontoEsperado,
                    2,
                    MidpointRounding.AwayFromZero);
            }
            else
            {
                entity.Detalles.Add(CrearDetalle(request));
            }
        }
    }

    private static void CalcularTotales(ArqueoCajaEntity entity)
    {
        var activos = entity.Detalles.Where(x => x.Activo).ToList();

        entity.TotalEsperado = activos.Sum(x => x.MontoEsperado);
        entity.TotalContado = activos.Sum(x => x.MontoContado);
        entity.Diferencia = decimal.Round(
            entity.TotalContado - entity.TotalEsperado,
            2,
            MidpointRounding.AwayFromZero);
    }

    private static void Normalizar(ArqueoCajaEntity entity)
    {
        entity.Observacion = string.IsNullOrWhiteSpace(entity.Observacion)
            ? null
            : entity.Observacion.Trim();
    }

    private static IReadOnlyCollection<ArqueoCajaDetalleResponse> MapDetalles(
        IEnumerable<DetalleArqueoCaja> detalles)
    {
        return detalles
            .Select(d => new ArqueoCajaDetalleResponse
            {
                Id = d.Id,
                ArqueoCajaId = d.ArqueoCajaId,
                MetodoPagoId = d.MetodoPagoId,
                MonedaId = d.MonedaId,
                MontoEsperado = d.MontoEsperado,
                MontoContado = d.MontoContado,
                Diferencia = d.Diferencia,
                Activo = d.Activo,
                FechaCreacion = d.FechaCreacion,
                FechaModificacion = d.FechaModificacion,
                CreadoPor = d.CreadoPor,
                ModificadoPor = d.ModificadoPor
            })
            .ToList();
    }

    private static TurnoCajaInfo? MapTurnoCajaInfo(TurnoCajaEntity? turno)
    {
        if (turno is null)
            return null;

        return new TurnoCajaInfo
        {
            Id = turno.Id,
            Caja = MapCajaInfo(turno.Caja),
            Empleado = MapEmpleadoInfo(turno.Empleado),
            FechaHoraApertura = turno.FechaHoraApertura,
            FechaHoraCierre = turno.FechaHoraCierre,
            Estado = turno.Estado
        };
    }

    private static CajaInfo? MapCajaInfo(
        Clinica.Api.Modules.Cajas.Caja.Entity.Caja? caja)
    {
        if (caja is null)
            return null;

        return new CajaInfo
        {
            Id = caja.Id,
            Codigo = caja.Codigo,
            Nombre = caja.Nombre
        };
    }

    private static EmpleadoInfo? MapEmpleadoInfo(
        Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado? empleado)
    {
        if (empleado is null)
            return null;

        var nombreCompleto = string.Join(" ",
            new[]
            {
                empleado.Persona?.Nombres,
                empleado.Persona?.ApellidoPaterno,
                empleado.Persona?.ApellidoMaterno
            }.Where(x => !string.IsNullOrWhiteSpace(x)));

        return new EmpleadoInfo
        {
            Id = empleado.Id,
            CodigoEmpleado = empleado.CodigoEmpleado,
            NombreCompleto = nombreCompleto
        };
    }

    private static DetalleKey ClaveDetalle(DetalleArqueoCaja d) =>
        new(d.MetodoPagoId, d.MonedaId);

    private static DetalleKey ClaveDetalle(ArqueoCajaDetalleRequest r) =>
        new(r.MetodoPagoId, r.MonedaId);

    private readonly record struct DetalleKey(
        int MetodoPagoId,
        int MonedaId);
}