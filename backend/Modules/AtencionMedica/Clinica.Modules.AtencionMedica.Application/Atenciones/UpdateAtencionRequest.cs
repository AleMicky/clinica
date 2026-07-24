namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed record UpdateAtencionRequest(
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid FormularioClinicoId,
    DateTime FechaAtencion,
    string? Observaciones = null);
