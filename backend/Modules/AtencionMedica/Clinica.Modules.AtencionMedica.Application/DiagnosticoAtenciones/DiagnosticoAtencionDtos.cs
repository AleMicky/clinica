namespace Clinica.Modules.AtencionMedica.Application.DiagnosticoAtenciones;

public sealed record DiagnosticoAtencionResponse(
    Guid Id,
    Guid AtencionId,
    Guid DiagnosticoId,
    bool EsPrincipal,
    string? Observaciones);

public sealed record CreateDiagnosticoAtencionRequest(
    Guid AtencionId,
    Guid DiagnosticoId,
    bool EsPrincipal = false,
    string? Observaciones = null);

public sealed record UpdateDiagnosticoAtencionRequest(
    Guid AtencionId,
    Guid DiagnosticoId,
    bool EsPrincipal = false,
    string? Observaciones = null);
