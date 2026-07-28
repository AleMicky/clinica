namespace Clinica.Modules.Parametros.Application.Gestiones;

public sealed record CreateGestionRequest(
    int Gestion,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    string Literal,
    bool Activa = true
);
