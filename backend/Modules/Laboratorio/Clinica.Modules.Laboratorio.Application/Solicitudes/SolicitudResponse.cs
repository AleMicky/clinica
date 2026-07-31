namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public sealed record SolicitudDetalleResponse(
    Guid Id,
    Guid PruebaId,
    string PruebaNombre,
    decimal PrecioUnitario,
    decimal Cantidad,
    bool EsDerivada,
    string? Observaciones
);

public sealed record SolicitudPagoResponse(
    Guid Id,
    Guid CuentaId,
    decimal MontoTotal,
    DateTime FechaEnvio,
    string Estado
);

public sealed record SolicitudResponse(
    Guid Id,
    string Numero,
    Guid PacienteId,
    string Origen,
    Guid? AtencionId,
    Guid? MedicoSolicitanteId,
    string? MedicoExternoNombre,
    string Estado,
    string? Observaciones,
    DateTime FechaSolicitud,
    IReadOnlyList<SolicitudDetalleResponse> Detalles,
    IReadOnlyList<SolicitudPagoResponse> Pagos
);
