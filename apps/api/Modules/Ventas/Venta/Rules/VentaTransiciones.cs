using Clinica.Api.Modules.Ventas.Venta.Enums;

namespace Clinica.Api.Modules.Ventas.Venta.Rules;

public static class VentaTransiciones
{
    private static readonly Dictionary<EstadoVenta, HashSet<EstadoVenta>> TransicionesValidas = new()
    {
        [EstadoVenta.Pendiente] =
        [
            EstadoVenta.PendienteCobro,
            EstadoVenta.Anulada
        ],

        [EstadoVenta.PendienteCobro] =
        [
            EstadoVenta.ParcialmentePagada,
            EstadoVenta.Pagada,
            EstadoVenta.Anulada
        ],

        [EstadoVenta.ParcialmentePagada] =
        [
            EstadoVenta.Pagada,
            EstadoVenta.Anulada
        ],

        [EstadoVenta.Pagada] =
        [
            EstadoVenta.Anulada
        ],

        [EstadoVenta.Anulada] = []
    };

    public static bool EsValida(
        EstadoVenta origen,
        EstadoVenta destino)
    {
        return TransicionesValidas.TryGetValue(
                   origen,
                   out var destinos)
               && destinos.Contains(destino);
    }
}