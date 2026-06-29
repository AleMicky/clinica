namespace Clinica.Modules.AtencionMedica.Application.Recepcion;

public sealed record CrearRecepcionAtencionRequest(
    Guid PacienteId,
    Guid TipoAtencionId,
    Guid ServicioId,
    string MotivoConsulta,
    Guid? EspecialidadId = null,
    Guid? MedicoId = null,
    string? ResponsableFinancieroNombre = null,
    string? ResponsableFinancieroDocumento = null,
    string? ResponsableFinancieroTelefono = null,
    string? SeguroNombre = null,
    string? NumeroAfiliacion = null,
    string? Observaciones = null);
