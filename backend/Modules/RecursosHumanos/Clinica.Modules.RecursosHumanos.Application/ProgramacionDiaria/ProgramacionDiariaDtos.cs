namespace Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;

public sealed record CreateProgramacionDiariaRequest(
    Guid EmpleadoId,
    DateOnly Fecha,
    Guid TurnoId,
    Guid AreaId,
    Guid CargoId,
    Guid? EspecialidadId,
    bool EsMedicoTurno,
    bool AceptaConsultas,
    bool AceptaSinCita,
    int MaxPacientes,
    string Estado,
    string? Observacion,
    bool PermiteMultiplesMedicosTurno = false);

public sealed record UpdateProgramacionDiariaRequest(
    Guid EmpleadoId,
    DateOnly Fecha,
    Guid TurnoId,
    Guid AreaId,
    Guid CargoId,
    Guid? EspecialidadId,
    bool EsMedicoTurno,
    bool AceptaConsultas,
    bool AceptaSinCita,
    int MaxPacientes,
    string Estado,
    string? Observacion,
    bool PermiteMultiplesMedicosTurno);

public sealed record ProgramacionDiariaResponse(
    Guid Id,
    Guid EmpleadoId,
    string EmpleadoCodigo,
    string EmpleadoNombre,
    DateOnly Fecha,
    Guid TurnoId,
    string TurnoCodigo,
    string TurnoNombre,
    TimeOnly HoraInicio,
    TimeOnly HoraFin,
    bool CruceDia,
    Guid AreaId,
    string AreaCodigo,
    string AreaNombre,
    Guid CargoId,
    string CargoNombre,
    Guid? EspecialidadId,
    string? EspecialidadNombre,
    bool EsMedicoTurno,
    bool AceptaConsultas,
    bool AceptaSinCita,
    int MaxPacientes,
    string Estado,
    string? Observacion,
    bool PermiteMultiplesMedicosTurno,
    Guid? MedicoId);

public sealed record MedicoDisponibilidadResponse(
    Guid ProgramacionId,
    Guid MedicoId,
    Guid EmpleadoId,
    string MedicoNombre,
    string? EspecialidadNombre,
    Guid? EspecialidadId,
    Guid AreaId,
    string AreaNombre,
    string TurnoNombre,
    TimeOnly HoraInicio,
    TimeOnly HoraFin,
    bool CruceDia,
    bool EsMedicoTurno,
    bool AceptaConsultas,
    bool AceptaSinCita,
    int MaxPacientes,
    bool DisponibleAhora,
    DateTime? ProximaDisponibilidad);

public sealed record ValidarMedicoProgramadoRequest(
    Guid MedicoId,
    DateTime FechaAtencion,
    Guid? EspecialidadId = null);
