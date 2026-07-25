namespace Clinica.Modules.Parametros.Application.UnidadesMedida;

public sealed record UpdateUnidadesMedidaRequest(
    string Codigo,
    string Nombre,
    string Simbolo
);
