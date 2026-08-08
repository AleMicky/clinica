using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Convenios.Dtos;

public abstract record ConvenioTarifarioRequest
{
    public required int TarifarioId { get; init; }

    public required DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
}

public sealed record CreateConvenioTarifarioRequest : ConvenioTarifarioRequest;

public sealed record UpdateConvenioTarifarioRequest : ConvenioTarifarioRequest;

public sealed record ConvenioTarifarioResponse : AuditableResponse
{
    public int Id { get; init; }
    public int ConvenioId { get; init; }
    public int TarifarioId { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
}
