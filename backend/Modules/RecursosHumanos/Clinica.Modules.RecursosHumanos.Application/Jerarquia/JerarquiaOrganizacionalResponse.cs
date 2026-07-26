namespace Clinica.Modules.RecursosHumanos.Application.Jerarquia;

public sealed record JerarquiaOrganizacionalResponse(
    IReadOnlyList<JerarquiaAreaNode> Areas
);

public sealed record JerarquiaAreaNode(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion,
    int? EmpleadosCount
);
