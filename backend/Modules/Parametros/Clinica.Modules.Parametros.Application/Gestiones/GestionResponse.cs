namespace Clinica.Modules.Parametros.Application.Gestiones;

public sealed record GestionResponse(
    Guid Id,
    int Gestion,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    string Literal,
    bool Activa
);
