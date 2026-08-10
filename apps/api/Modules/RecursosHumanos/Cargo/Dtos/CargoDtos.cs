using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Cargo.Dtos;

public abstract record CargoRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record CreateCargoRequest : CargoRequest;

public sealed record UpdateCargoRequest : CargoRequest;

public sealed record CargoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Descripcion { get; init; }
}