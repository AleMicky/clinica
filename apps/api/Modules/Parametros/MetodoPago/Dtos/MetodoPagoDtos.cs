using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.MetodoPago.Dtos;

public abstract record MetodoPagoRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public bool RequiereReferencia { get; init; }
}

public sealed record CreateMetodoPagoRequest : MetodoPagoRequest;

public sealed record UpdateMetodoPagoRequest : MetodoPagoRequest;

public sealed record MetodoPagoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public bool RequiereReferencia { get; init; }
}

public sealed record MetodoPagoInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
}