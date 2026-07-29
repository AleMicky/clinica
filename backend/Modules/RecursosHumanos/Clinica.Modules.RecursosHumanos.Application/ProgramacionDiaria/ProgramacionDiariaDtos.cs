using Clinica.Modules.RecursosHumanos.Domain.Enums;

namespace Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;

public sealed record CreateProgramacionDiariaRequest(
    Guid ProgramacionId,
    Guid EmpleadoId,
    DateOnly Fecha,
    Guid? TurnoId,
    TipoAsignacionProgramacion TipoAsignacion,
    string? Observacion);

public sealed record UpdateProgramacionDiariaRequest(
    Guid ProgramacionId,
    Guid EmpleadoId,
    DateOnly Fecha,
    Guid? TurnoId,
    TipoAsignacionProgramacion TipoAsignacion,
    string? Observacion);

public sealed record ProgramacionDiariaResponse(
    Guid Id,
    Guid ProgramacionId,
    string ProgramacionNombre,
    EstadoProgramacion ProgramacionEstado,
    Guid GrupoProgramacionId,
    string GrupoProgramacionNombre,
    Guid AreaId,
    string AreaCodigo,
    string AreaNombre,
    Guid EmpleadoId,
    string EmpleadoCodigo,
    string EmpleadoNombre,
    DateOnly Fecha,
    Guid? TurnoId,
    string? TurnoCodigo,
    string? TurnoNombre,
    TimeOnly? HoraInicio,
    TimeOnly? HoraFin,
    bool? CruceDia,
    TipoAsignacionProgramacion TipoAsignacion,
    string? Observacion,
    Guid? MedicoId);

public sealed record MedicoDisponibilidadResponse(
    Guid ProgramacionDiariaId,
    Guid ProgramacionId,
    Guid MedicoId,
    Guid EmpleadoId,
    string MedicoNombre,
    Guid AreaId,
    string AreaNombre,
    string? TurnoNombre,
    TimeOnly? HoraInicio,
    TimeOnly? HoraFin,
    bool CruceDia,
    bool DisponibleAhora,
    DateTime? ProximaDisponibilidad);

public sealed record ValidarMedicoProgramadoRequest(
    Guid MedicoId,
    DateTime FechaAtencion,
    Guid? EspecialidadId = null);

public sealed record ProgramacionLookupResponse(
    Guid Id,
    string Nombre,
    EstadoProgramacion Estado,
    Guid GrupoProgramacionId,
    string GrupoProgramacionNombre,
    Guid AreaId,
    string AreaNombre,
    DateOnly FechaInicio,
    DateOnly FechaFin);
