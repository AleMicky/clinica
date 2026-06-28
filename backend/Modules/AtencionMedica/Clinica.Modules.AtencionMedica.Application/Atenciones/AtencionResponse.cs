namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed record AtencionResponse(
    Guid Id,
    string NumeroTramite,
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid FormularioClinicoId,
    DateTime FechaAtencion,
    string Estado,
    string? Observaciones);
