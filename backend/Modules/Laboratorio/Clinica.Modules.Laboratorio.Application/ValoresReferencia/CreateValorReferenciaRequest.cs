namespace Clinica.Modules.Laboratorio.Application.ValoresReferencia;

public sealed record CreateValorReferenciaRequest(
    Guid ParametroId,
    string? Sexo = null,
    int? EdadMin = null,
    int? EdadMax = null,
    decimal? ValorMin = null,
    decimal? ValorMax = null,
    string? ValorTexto = null,
    bool Activo = true
);
