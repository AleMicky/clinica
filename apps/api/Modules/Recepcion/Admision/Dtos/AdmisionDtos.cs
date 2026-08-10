using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Admision.Dtos;

public abstract record AdmisionRequest
{
    public required string Numero { get; init; }
    public required int PacienteId { get; init; }
    public int? ConvenioId { get; init; }
    public required DateTime FechaHora { get; init; }
    public required EstadoAdmision Estado { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<AdmisionDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateAdmisionRequest : AdmisionRequest;

public sealed record UpdateAdmisionRequest : AdmisionRequest;

public sealed record AdmisionResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }
    public int PacienteId { get; init; }
    public int? ConvenioId { get; init; }
    public DateTime FechaHora { get; init; }
    public EstadoAdmision Estado { get; init; }
    public string? Observacion { get; init; }
}

public abstract record AdmisionDetalleRequest
{
    public required int ServicioId { get; init; }
    public int? MedicoId { get; init; }
    public decimal Cantidad { get; init; } = 1;
    public decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }

    public decimal CalcularTotal() =>
        (Cantidad * PrecioUnitario) - Descuento;
}

public sealed record CreateAdmisionDetalleRequest : AdmisionDetalleRequest;

public sealed record UpdateAdmisionDetalleRequest : AdmisionDetalleRequest;

public sealed record AdmisionDetalleResponse : AuditableResponse
{
    public int Id { get; init; }
    public int AdmisionId { get; init; }
    public int ServicioId { get; init; }
    public int? MedicoId { get; init; }
    public decimal Cantidad { get; init; }
    public decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }
    public decimal Total { get; init; }
}
