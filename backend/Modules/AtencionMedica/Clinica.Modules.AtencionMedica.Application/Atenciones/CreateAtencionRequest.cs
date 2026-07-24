namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed record CreateAtencionRequest(
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid FormularioClinicoId,
    DateTime FechaAtencion,
    string? Observaciones = null);
