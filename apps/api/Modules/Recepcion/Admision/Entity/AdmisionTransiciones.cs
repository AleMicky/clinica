using Clinica.Api.Modules.Recepcion.Admision.Enums;

namespace Clinica.Api.Modules.Recepcion.Admision.Entity;

public static class AdmisionTransiciones
{
    private static readonly Dictionary<EstadoAdmision, HashSet<EstadoAdmision>> TransicionesValidas = new()
        {
            [EstadoAdmision.Registrada] = [EstadoAdmision.Confirmada, EstadoAdmision.Cancelada],
            [EstadoAdmision.Confirmada] = [EstadoAdmision.EnviadaVenta, EstadoAdmision.Cancelada],
            [EstadoAdmision.EnviadaVenta] = [],
            [EstadoAdmision.Cancelada] = []
        };

    public static bool EsValida(EstadoAdmision origen, EstadoAdmision destino)
    {
        return TransicionesValidas.TryGetValue(origen, out var destinos) && destinos.Contains(destino);
    }
}