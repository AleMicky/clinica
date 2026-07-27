namespace Clinica.Modules.Laboratorio.Application.ValoresReferencia;

public sealed record ValorReferenciaResponse(
    Guid Id,
    Guid ParametroId,
    string? Sexo,
    int? EdadMin,
    int? EdadMax,
    decimal? ValorMin,
    decimal? ValorMax,
    string? ValorTexto,
    bool Activo
);
