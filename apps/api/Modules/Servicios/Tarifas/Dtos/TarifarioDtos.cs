using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Tarifas.Dtos;

public abstract record TarifarioRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }

    public required DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }

    public required int MonedaId { get; init; }

    public bool EsPrincipal { get; init; }
}

public sealed record CreateTarifarioRequest : TarifarioRequest;

public sealed record UpdateTarifarioRequest : TarifarioRequest;

public sealed record TarifarioResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
    public int MonedaId { get; init; }
    public bool EsPrincipal { get; init; }
}

public abstract record TarifarioDetalleRequest
{
    public required int ServicioId { get; init; }
    public required decimal Precio { get; init; }
}

public sealed record CreateTarifarioDetalleRequest : TarifarioDetalleRequest;

public sealed record UpdateTarifarioDetalleRequest : TarifarioDetalleRequest;

public sealed record TarifarioDetalleResponse : AuditableResponse
{
    public int Id { get; init; }
    public int TarifarioId { get; init; }
    public int ServicioId { get; init; }
    public decimal Precio { get; init; }
}
