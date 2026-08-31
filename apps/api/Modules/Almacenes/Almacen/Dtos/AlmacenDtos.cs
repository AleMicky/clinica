using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Almacen.Dtos;

public abstract record AlmacenRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public string? Ubicacion { get; init; }
}

public sealed record CreateAlmacenRequest : AlmacenRequest;

public sealed record UpdateAlmacenRequest : AlmacenRequest;

public sealed record AlmacenResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public string? Ubicacion { get; init; }
}
