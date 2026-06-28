namespace Clinica.Modules.AtencionMedica.Application.Tratamientos;

public sealed record TratamientoResponse(
    Guid Id,
    Guid AtencionId,
    string Descripcion,
    string? Indicaciones,
    DateTime FechaRegistro);

public sealed record CreateTratamientoRequest(
    Guid AtencionId,
    string Descripcion,
    string? Indicaciones = null,
    DateTime? FechaRegistro = null);

public sealed record UpdateTratamientoRequest(
    Guid AtencionId,
    string Descripcion,
    string? Indicaciones = null,
    DateTime? FechaRegistro = null);
