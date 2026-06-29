namespace Clinica.Modules.AtencionMedica.Application.Recepcion;

public sealed record CrearRecepcionAtencionRequest(
    Guid PacienteId,
    Guid TipoAtencionId,
    IReadOnlyCollection<RespuestaFormularioItem> RespuestasFormulario);
