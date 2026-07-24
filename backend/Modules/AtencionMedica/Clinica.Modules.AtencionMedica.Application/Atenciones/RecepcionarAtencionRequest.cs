namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

/// <summary>
/// Recepción en un solo paso: paciente existente o nuevo + tipo de atención.
/// El formulario clínico activo se resuelve en el servidor.
/// </summary>
public sealed record RecepcionarAtencionRequest(
    Guid TipoAtencionId,
    DateTime? FechaAtencion = null,
    string? Observaciones = null,
    Guid? PacienteId = null,
    RecepcionPacienteNuevoRequest? PacienteNuevo = null);

public sealed record RecepcionPacienteNuevoRequest(
    Guid TipoDocumentoId,
    string NumeroDocumento,
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    DateOnly FechaNacimiento,
    Guid SexoId,
    Guid EstadoCivilId,
    string Telefono,
    string? Direccion = null,
    Guid? ExtensionDocumentoId = null,
    string? ComplementoDocumento = null);
