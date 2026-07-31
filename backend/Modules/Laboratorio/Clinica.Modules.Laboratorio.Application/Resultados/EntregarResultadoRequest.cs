namespace Clinica.Modules.Laboratorio.Application.Resultados;

public sealed record EntregarResultadoRequest(
    Guid EmpleadoId,
    string? Observaciones = null
);
