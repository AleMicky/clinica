namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed record AtencionResponse(
    Guid Id,
    string NumeroAtencion,
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid? MedicoId,
    Guid? FormularioClinicoId,
    DateTime FechaAtencion,
    DateTime? FechaRecepcion,
    string Estado,
    Guid? WorkflowInstanceId,
    string? Observaciones,
    string PacienteNombre,
    string NumeroHistoriaClinica,
    string TipoAtencionNombre,
    string TipoAtencionCodigo,
    string TipoAtencionColor,
    string? TipoAtencionIcono,
    string? FormularioClinicoNombre);
