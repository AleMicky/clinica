namespace Clinica.Api.Modules.Recepcion.Admision.Entity;

public static class AdmisionTransiciones
{
    private static readonly Dictionary<EstadoAdmision, HashSet<EstadoAdmision>> TransicionesValidas = new()
    {
        [EstadoAdmision.Registrada] = [EstadoAdmision.PendientePago, EstadoAdmision.Cancelada],
        [EstadoAdmision.PendientePago] = [EstadoAdmision.Pagada, EstadoAdmision.Cancelada],
        [EstadoAdmision.Pagada] = [EstadoAdmision.EnAtencion],
        [EstadoAdmision.EnAtencion] = [EstadoAdmision.Finalizada],
        [EstadoAdmision.Finalizada] = [],
        [EstadoAdmision.Cancelada] = []
    };

    public static bool EsValida(EstadoAdmision origen, EstadoAdmision destino)
    {
        return TransicionesValidas.TryGetValue(origen, out var destinos)
               && destinos.Contains(destino);
    }
}