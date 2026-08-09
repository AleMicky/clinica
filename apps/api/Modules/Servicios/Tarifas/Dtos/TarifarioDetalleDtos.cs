using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Tarifas.Dtos;

public abstract record TarifarioDetalleRequest
{
    public required int ServicioId { get; init; }
    public required decimal Precio { get; init; }
}

public sealed record CreateTarifarioDetalleRequest : TarifarioDetalleRequest;

public sealed record UpdateTarifarioDetalleRequest : TarifarioDetalleRequest;

public sealed record TarifarioDetalleCategoriaRequest
{
    public int CategoriaServicioId { get; init; }
}

public sealed record TarifarioDetalleResponse : AuditableResponse
{
    public int Id { get; init; }
    public int TarifarioId { get; init; }
    public ServicioResumenResponse Servicio { get; init; }
    public decimal Precio { get; init; }
}

public sealed record ServicioResumenResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
}