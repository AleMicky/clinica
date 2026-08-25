namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;

public sealed record CreateRolOpcionMenuRequest
{
    public int OpcionMenuId { get; init; }
}

public sealed record AsignarRolOpcionMenuRequest
{
    public List<int> OpcionMenuIds { get; init; } = [];
}

public sealed record RolOpcionMenuResponse
{
    public int RolId { get; init; }

    public int OpcionMenuId { get; init; }

    public int? PadreId { get; init; }

    public string Codigo { get; init; } = string.Empty;

    public string Nombre { get; init; } = string.Empty;

    public string? Ruta { get; init; }

    public string? Icono { get; init; }

    public int Orden { get; init; }
}

public sealed record RolOpcionesMenuResponse
{
    public int RolId { get; init; }

    public string RolNombre { get; init; } = string.Empty;

    public List<RolOpcionMenuResponse> OpcionesMenu { get; init; } = [];
}

public sealed record RolOpcionMenuTreeResponse
{
    public int Id { get; init; }

    public string Codigo { get; init; } = string.Empty;

    public string Nombre { get; init; } = string.Empty;

    public string? Ruta { get; init; }

    public string? Icono { get; init; }

    public int Orden { get; init; }

    public List<RolOpcionMenuTreeResponse> Hijos { get; init; } = [];
}