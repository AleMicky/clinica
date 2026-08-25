using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;

public abstract record OpcionMenuRequest
{
    public int? PadreId { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Ruta { get; init; }
    public string? Icono { get; init; }
    public int Orden { get; init; }
}

public sealed record CreateOpcionMenuRequest : OpcionMenuRequest;

public sealed record UpdateOpcionMenuRequest : OpcionMenuRequest;

public sealed record OpcionMenuResponse : AuditableResponse
{
    public int Id { get; init; }
    public int? PadreId { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Ruta { get; init; }
    public string? Icono { get; init; }
    public int Orden { get; init; }
}

public sealed record OpcionMenuTreeResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Ruta { get; init; }
    public string? Icono { get; init; }
    public int Orden { get; init; }
    public List<OpcionMenuTreeResponse> Hijos { get; init; } = [];
}