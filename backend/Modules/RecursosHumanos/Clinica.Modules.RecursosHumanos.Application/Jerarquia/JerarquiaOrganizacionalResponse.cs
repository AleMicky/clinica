namespace Clinica.Modules.RecursosHumanos.Application.Jerarquia;

public sealed record JerarquiaOrganizacionalResponse(
    IReadOnlyList<JerarquiaAreaNode> Areas
);

public sealed record JerarquiaAreaNode(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion,
    int? EmpleadosCount,
    IReadOnlyList<JerarquiaDepartamentoNode> Departamentos
);

public sealed record JerarquiaDepartamentoNode(
    Guid Id,
    Guid AreaId,
    string Codigo,
    string Nombre,
    string Descripcion,
    int? EmpleadosCount,
    IReadOnlyList<JerarquiaServicioNode> Servicios
);

public sealed record JerarquiaServicioNode(
    Guid Id,
    Guid DepartamentoId,
    string Codigo,
    string Nombre,
    string Descripcion,
    int? EmpleadosCount
);
