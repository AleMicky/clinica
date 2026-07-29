using Clinica.Modules.RecursosHumanos.Domain.Enums;

namespace Clinica.Modules.RecursosHumanos.Application.Programacion;

public sealed record CreateProgramacionRequest(
    string Nombre,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    Guid GrupoProgramacionId,
    string? Observacion);

public sealed record UpdateProgramacionRequest(
    string Nombre,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    Guid GrupoProgramacionId,
    string? Observacion);

public sealed record UpdateProgramacionEstadoRequest(
    EstadoProgramacion Estado);

public sealed record ProgramacionResponse(
    Guid Id,
    string Nombre,
    DateOnly FechaInicio,
    DateOnly FechaFin,
    Guid GrupoProgramacionId,
    string GrupoProgramacionNombre,
    Guid AreaId,
    string AreaNombre,
    EstadoProgramacion Estado,
    string? Observacion);
