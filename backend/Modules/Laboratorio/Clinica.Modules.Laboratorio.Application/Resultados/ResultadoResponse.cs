namespace Clinica.Modules.Laboratorio.Application.Resultados;

public sealed record ResultadoDetalleResponse(
    Guid Id,
    Guid ParametroId,
    string ParametroNombre,
    Guid SolicitudDetalleId,
    decimal? ValorNumerico,
    string? ValorTexto,
    bool FueraDeRango,
    string? Observaciones
);

public sealed record ResultadoResponse(
    Guid Id,
    Guid SolicitudId,
    Guid? MuestraId,
    string Estado,
    Guid? ValidadoPorEmpleadoId,
    DateTime? FechaValidacion,
    string? Observaciones,
    IReadOnlyList<ResultadoDetalleResponse> Detalles
);
