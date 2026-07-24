namespace Clinica.Modules.Parametros.Application.Correlativos;

public sealed record CorrelativoResponse(
    Guid Id,
    string Codigo,
    int Gestion,
    int UltimoNumero,
    string? Prefijo,
    int Longitud,
    string NumeroFormateado,
    DateTime FechaCreacion,
    DateTime? FechaActualizacion
);
