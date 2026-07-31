using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;

public sealed class ProgramacionDiariaPagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public DateOnly? Fecha { get; init; }

    public DateOnly? FechaDesde { get; init; }

    public DateOnly? FechaHasta { get; init; }

    public Guid? EmpleadoId { get; init; }

    public Guid? TurnoId { get; init; }

    public Guid? ProgramacionId { get; init; }

    public Guid? GrupoProgramacionId { get; init; }

    public Guid? AreaId { get; init; }

    public int? TipoAsignacion { get; init; }

    public int? EstadoProgramacion { get; init; }
}

public sealed class MedicoDisponibilidadRequest
{
    public DateOnly? Fecha { get; init; }

    public TimeOnly? Hora { get; init; }

    public Guid? AreaId { get; init; }

    // bool? so [AsParameters] does not require these query params.
    public bool? SoloDisponiblesAhora { get; init; }

    public bool? IncluirProximaDisponibilidad { get; init; }
}
