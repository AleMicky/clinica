namespace Clinica.Modules.Parametros.Application.Gestiones;

public sealed record UpdateGestionRequest(
    int Gestion,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    string Literal,
    bool Activa
);
