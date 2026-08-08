using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Convenios.Dtos;

public abstract record ConvenioRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public required DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
}

public sealed record CreateConvenioRequest : ConvenioRequest;

public sealed record UpdateConvenioRequest : ConvenioRequest;

public sealed record ConvenioResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
}
