namespace Clinica.Modules.Almacen.Application.UnidadesMedida;

public sealed record UnidadMedidaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Abreviatura,
    bool PermiteDecimales);

public sealed record CreateUnidadMedidaRequest(
    string Codigo,
    string Nombre,
    string? Abreviatura = null,
    bool PermiteDecimales = false);

public sealed record UpdateUnidadMedidaRequest(
    string Codigo,
    string Nombre,
    string? Abreviatura,
    bool PermiteDecimales);
