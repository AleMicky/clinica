using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.CategoriaServicio.Dtos;

public abstract record CategoriaServicioRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string Descripcion { get; init; } = string.Empty;
}

public sealed record CreateCategoriaServicioRequest : CategoriaServicioRequest;

public sealed record UpdateCategoriaServicioRequest : CategoriaServicioRequest;

public sealed record CategoriaServicioResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
}