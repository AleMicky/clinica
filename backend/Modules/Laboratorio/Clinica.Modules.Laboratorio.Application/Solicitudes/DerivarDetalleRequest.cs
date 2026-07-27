namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public sealed record DerivarDetalleRequest(
    Guid LaboratorioExternoId,
    string? Observaciones = null
);
