namespace Clinica.Modules.Parametros.Application.UnidadesMedida;

public sealed record CreateUnidadesMedidaRequest(
    string Codigo,
    string Nombre,
    string Simbolo
);
