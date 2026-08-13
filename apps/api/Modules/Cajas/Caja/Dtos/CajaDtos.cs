using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.Caja.Dtos;

public abstract record CajaRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record CreateCajaRequest : CajaRequest;

public sealed record UpdateCajaRequest : CajaRequest;

public sealed record CajaResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Descripcion { get; init; }
}
