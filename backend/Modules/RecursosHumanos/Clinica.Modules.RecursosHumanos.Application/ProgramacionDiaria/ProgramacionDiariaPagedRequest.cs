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

    public Guid? AreaId { get; init; }

    public Guid? EspecialidadId { get; init; }

    public string? Estado { get; init; }

    public bool? EsMedicoTurno { get; init; }
}

public sealed class MedicoDisponibilidadRequest
{
    public DateOnly? Fecha { get; init; }

    public TimeOnly? Hora { get; init; }

    public Guid? EspecialidadId { get; init; }

    public Guid? AreaId { get; init; }

    public bool SoloDisponiblesAhora { get; init; }

    public bool IncluirProximaDisponibilidad { get; init; } = true;
}
