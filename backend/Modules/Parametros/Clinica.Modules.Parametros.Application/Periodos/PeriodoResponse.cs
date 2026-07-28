namespace Clinica.Modules.Parametros.Application.Periodos;

public sealed record PeriodoResponse(
    Guid Id,
    Guid GestionId,
    int Numero,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    string Literal
);
