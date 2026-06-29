namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed record AtencionResponse(
    Guid Id,
    string NumeroAtencion,
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid? ServicioId,
    Guid? EspecialidadId,
    Guid? MedicoId,
    string? MotivoConsulta,
    Guid? FormularioClinicoId,
    DateTime FechaAtencion,
    DateTime? FechaRecepcion,
    string Estado,
    Guid? WorkflowInstanceId,
    string? ResponsableFinancieroNombre,
    string? ResponsableFinancieroDocumento,
    string? ResponsableFinancieroTelefono,
    string? SeguroNombre,
    string? NumeroAfiliacion,
    string? Observaciones);
