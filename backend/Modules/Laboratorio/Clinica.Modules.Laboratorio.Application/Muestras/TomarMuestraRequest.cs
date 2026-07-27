namespace Clinica.Modules.Laboratorio.Application.Muestras;

public sealed record TomarMuestraRequest(
    Guid? TipoMuestraId,
    Guid TomadoPorEmpleadoId,
    string? Observaciones = null,
    IReadOnlyList<Guid>? SolicitudDetalleIds = null
);
