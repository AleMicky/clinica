namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed record UpdateAtencionRequest(
    string NumeroTramite,
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid FormularioClinicoId,
    DateTime FechaAtencion,
    string Estado,
    string? Observaciones = null);
