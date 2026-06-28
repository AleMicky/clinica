namespace Clinica.Modules.AtencionMedica.Application.Diagnosticos;

public sealed record DiagnosticoResponse(
    Guid Id,
    string CodigoCie10,
    string Nombre,
    string? Descripcion);

public sealed record CreateDiagnosticoRequest(
    string CodigoCie10,
    string Nombre,
    string? Descripcion = null);

public sealed record UpdateDiagnosticoRequest(
    string CodigoCie10,
    string Nombre,
    string? Descripcion = null);
