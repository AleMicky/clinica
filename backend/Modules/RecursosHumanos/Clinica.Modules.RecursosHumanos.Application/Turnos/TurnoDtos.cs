namespace Clinica.Modules.RecursosHumanos.Application.Turnos;

public sealed record CreateTurnoRequest(
    string Codigo,
    string Nombre,
    TimeOnly HoraInicio,
    TimeOnly HoraFin,
    bool CruceDia = false,
    bool Activo = true,
    bool PermiteMultiplesMedicosTurno = false);

public sealed record UpdateTurnoRequest(
    string Codigo,
    string Nombre,
    TimeOnly HoraInicio,
    TimeOnly HoraFin,
    bool CruceDia,
    bool Activo,
    bool PermiteMultiplesMedicosTurno);

public sealed record TurnoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    TimeOnly HoraInicio,
    TimeOnly HoraFin,
    bool CruceDia,
    bool Activo,
    bool PermiteMultiplesMedicosTurno);
