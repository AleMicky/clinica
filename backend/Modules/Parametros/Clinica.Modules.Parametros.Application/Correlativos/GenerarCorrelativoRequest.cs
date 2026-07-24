namespace Clinica.Modules.Parametros.Application.Correlativos;

public sealed record GenerarCorrelativoRequest(
    string Codigo,
    int? Gestion = null,
    string? Prefijo = null,
    int? Longitud = null
);
