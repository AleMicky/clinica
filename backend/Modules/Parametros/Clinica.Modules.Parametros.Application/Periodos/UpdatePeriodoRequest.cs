namespace Clinica.Modules.Parametros.Application.Periodos;

public sealed record UpdatePeriodoRequest(
    DateOnly FechaInicio,
    DateOnly FechaFin,
    string Literal
);
