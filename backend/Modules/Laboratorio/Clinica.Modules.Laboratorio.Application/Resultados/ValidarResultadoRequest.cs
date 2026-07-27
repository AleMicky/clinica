namespace Clinica.Modules.Laboratorio.Application.Resultados;

public sealed record ValidarResultadoRequest(
    Guid EmpleadoId,
    string? Observaciones = null
);
