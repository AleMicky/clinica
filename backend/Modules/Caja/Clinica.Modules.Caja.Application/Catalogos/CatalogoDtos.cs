namespace Clinica.Modules.Caja.Application.Catalogos;

public sealed record MetodoPagoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    bool RequiereReferencia,
    bool EsEfectivo,
    bool Activo);

public sealed record ConceptoCajaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string TipoMovimiento,
    bool Activo);
