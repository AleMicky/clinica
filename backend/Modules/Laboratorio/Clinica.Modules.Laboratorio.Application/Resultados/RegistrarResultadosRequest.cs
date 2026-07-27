namespace Clinica.Modules.Laboratorio.Application.Resultados;

public sealed record RegistrarResultadoLineaRequest(
    Guid ParametroId,
    Guid SolicitudDetalleId,
    decimal? ValorNumerico = null,
    string? ValorTexto = null,
    string? Observaciones = null
);

public sealed record RegistrarResultadosRequest(
    Guid? MuestraId,
    string? Observaciones,
    Guid EmpleadoId,
    IReadOnlyList<RegistrarResultadoLineaRequest> Lineas
);
