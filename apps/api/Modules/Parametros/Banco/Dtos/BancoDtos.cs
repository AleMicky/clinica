using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Banco.Dtos;

public abstract record BancoRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? NombreCorto { get; init; }
}

public sealed record CreateBancoRequest : BancoRequest;

public sealed record UpdateBancoRequest : BancoRequest;

public sealed record BancoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? NombreCorto { get; init; }
}
