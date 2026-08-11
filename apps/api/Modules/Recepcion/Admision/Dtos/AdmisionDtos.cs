using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Admision.Dtos;

public abstract record AdmisionRequest
{
    public required string Numero { get; init; }
    public required int PacienteId { get; init; }
    public int? ConvenioId { get; init; }
    public required DateTime FechaHora { get; init; }
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
    public IReadOnlyCollection<AdmisionDetalleResponse> Detalles { get; init; } = [];
}