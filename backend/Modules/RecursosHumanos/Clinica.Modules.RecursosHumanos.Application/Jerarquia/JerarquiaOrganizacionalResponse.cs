namespace Clinica.Modules.RecursosHumanos.Application.Jerarquia;

public sealed record JerarquiaOrganizacionalResponse(
    IReadOnlyList<JerarquiaAreaNode> Areas
);

public sealed record JerarquiaAreaNode(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion,
    Guid TipoAreaId,
    string TipoAreaCodigo,
    string TipoAreaNombre,
    int TipoAreaOrden,
    Guid? AreaPadreId,
    Guid? ResponsableEmpleadoId,
    int? EmpleadosCount
);
