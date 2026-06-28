namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed record CreateAtencionRequest(
    string NumeroTramite,
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid FormularioClinicoId,
    DateTime FechaAtencion,
    string Estado = "BORRADOR",
    string? Observaciones = null);
