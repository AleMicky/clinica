namespace Clinica.Modules.Parametros.Application.UnidadesMedida;

public sealed record UnidadesMedidaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Simbolo
);
