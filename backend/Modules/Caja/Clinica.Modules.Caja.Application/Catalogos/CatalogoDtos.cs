namespace Clinica.Modules.Caja.Application.Catalogos;

public sealed record MetodoPagoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    bool RequiereReferencia,
    bool EsEfectivo);

public sealed record CreateMetodoPagoRequest(
    string Codigo,
    string Nombre,
    bool RequiereReferencia = false,
    bool EsEfectivo = false);

public sealed record UpdateMetodoPagoRequest(
    string Nombre,
    bool RequiereReferencia,
    bool EsEfectivo);

public sealed record ConceptoCajaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string TipoMovimiento,
    bool Activo);
