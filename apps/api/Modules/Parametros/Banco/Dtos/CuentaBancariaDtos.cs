using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Banco.Dtos;

public abstract record CuentaBancariaRequest
{
    public required int MonedaId { get; init; }
    public required string NumeroCuenta { get; init; }
    public string? NombreCuenta { get; init; }
    public string? TipoCuenta { get; init; }
}

public sealed record CreateCuentaBancariaRequest : CuentaBancariaRequest;

public sealed record UpdateCuentaBancariaRequest : CuentaBancariaRequest;

public sealed record CuentaBancariaResponse : AuditableResponse
{
    public int Id { get; init; }
    public int BancoId { get; init; }
    public int MonedaId { get; init; }
    public string NumeroCuenta { get; init; }
    public string? NombreCuenta { get; init; }
    public string? TipoCuenta { get; init; }
}
