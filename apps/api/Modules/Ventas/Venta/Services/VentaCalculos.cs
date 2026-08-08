using Clinica.Api.Modules.Ventas.Venta.Dtos;

namespace Clinica.Api.Modules.Ventas.Venta.Services;

internal static class VentaCalculos
{
    public static decimal TotalDetalle(
        VentaDetalleRequest request)
    {
        return (request.Cantidad * request.PrecioUnitario)
               - request.Descuento;
    }

    public static (decimal? MontoMedico, decimal? MontoClinica) RepartoMedico(
        decimal total,
        decimal? porcentajeMedico)
    {
        if (porcentajeMedico is null)
            return (null, null);

        var montoMedico = decimal.Round(
            total * porcentajeMedico.Value / 100,
            2,
            MidpointRounding.AwayFromZero);

        return (montoMedico, total - montoMedico);
    }
}
