namespace Clinica.Modules.Laboratorio.Application.Muestras;

public sealed record MuestraDetalleResponse(
    Guid Id,
    Guid SolicitudDetalleId,
    Guid PruebaId,
    string PruebaNombre,
    string Estado
);

public sealed record MuestraResponse(
    Guid Id,
    Guid SolicitudId,
    string Codigo,
    Guid? TipoMuestraId,
    DateTime FechaToma,
    Guid? TomadoPorEmpleadoId,
    string Estado,
    string? Observaciones,
    IReadOnlyList<MuestraDetalleResponse> Detalles
);
