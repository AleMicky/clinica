using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;

namespace Clinica.Api.Modules.Cajas.Cobro.Mappers;

internal static class CobroDetalleMapper
{
    internal static CobroDetalle CrearDetalle(CobroDetalleRequest request)
    {
        var montoMonedaBase = decimal.Round(
            request.Monto * request.TipoCambio,
            2,
            MidpointRounding.AwayFromZero);

        return new CobroDetalle
        {
            MetodoPagoId = request.MetodoPagoId,
            MonedaId = request.MonedaId,
            CuentaBancariaId = request.CuentaBancariaId,
            Monto = request.Monto,
            TipoCambio = request.TipoCambio,
            MontoMonedaBase = montoMonedaBase,
            Referencia = NormalizarOpcional(request.Referencia),
            EntidadFinanciera = NormalizarOpcional(request.EntidadFinanciera),
            Observacion = NormalizarOpcional(request.Observacion)
        };
    }

    internal static void ReemplazarDetalles(
        CobroEntity entity,
        IReadOnlyCollection<CobroDetalleRequest> detalles)
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
                detalle.CuentaBancariaId = request.CuentaBancariaId;
                detalle.Monto = request.Monto;
                detalle.TipoCambio = request.TipoCambio;
                detalle.MontoMonedaBase = decimal.Round(
                    request.Monto * request.TipoCambio,
                    2,
                    MidpointRounding.AwayFromZero);
                detalle.Referencia = NormalizarOpcional(request.Referencia);
                detalle.EntidadFinanciera = NormalizarOpcional(request.EntidadFinanciera);
                detalle.Observacion = NormalizarOpcional(request.Observacion);
            }
            else
            {
                entity.Detalles.Add(CrearDetalle(request));
            }
        }
    }

    internal static void CalcularTotal(CobroEntity entity)
    {
        entity.Total = entity.Detalles
            .Where(x => x.Activo)
            .Sum(x => x.MontoMonedaBase);
    }

    internal static IReadOnlyCollection<CobroDetalleResponse> MapDetalles(
        IEnumerable<CobroDetalle> detalles)
    {
        return detalles
            .Select(d => new CobroDetalleResponse
            {
                Id = d.Id,
                CobroId = d.CobroId,
                MetodoPagoId = d.MetodoPagoId,
                MetodoPago = new MetodoPagoInfo
                {
                    Id = d.MetodoPagoId,
                    Codigo = d.MetodoPago.Codigo,
                    Nombre = d.MetodoPago.Nombre
                },
                MonedaId = d.MonedaId,
                Moneda = new MonedaInfo
                {
                    Id = d.MonedaId,
                    Codigo = d.Moneda.Codigo,
                    Nombre = d.Moneda.Nombre
                },
                CuentaBancariaId = d.CuentaBancariaId,
                Monto = d.Monto,
                TipoCambio = d.TipoCambio,
                MontoMonedaBase = d.MontoMonedaBase,
                Referencia = d.Referencia,
                EntidadFinanciera = d.EntidadFinanciera,
                Observacion = d.Observacion,
                Activo = d.Activo,
                FechaCreacion = d.FechaCreacion,
                FechaModificacion = d.FechaModificacion,
                CreadoPor = d.CreadoPor,
                ModificadoPor = d.ModificadoPor
            })
            .ToList();
    }

    internal static string? NormalizarOpcional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static DetalleKey ClaveDetalle(CobroDetalle d) =>
        new(d.MetodoPagoId, d.MonedaId, d.CuentaBancariaId);

    private static DetalleKey ClaveDetalle(CobroDetalleRequest r) =>
        new(r.MetodoPagoId, r.MonedaId, r.CuentaBancariaId);

    private readonly record struct DetalleKey(
        int MetodoPagoId,
        int MonedaId,
        int? CuentaBancariaId);
}
