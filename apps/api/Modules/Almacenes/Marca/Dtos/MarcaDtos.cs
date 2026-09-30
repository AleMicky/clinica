using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Marca.Dtos;

public abstract record MarcaRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record CreateMarcaRequest : MarcaRequest;

public sealed record UpdateMarcaRequest : MarcaRequest;

public sealed record MarcaResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Descripcion { get; init; }
}
